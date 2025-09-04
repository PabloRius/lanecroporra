import {
  GroupDoc,
  MemberDoc,
  MembersMap,
  PrivateGroupDoc,
  PublicGroupDoc,
} from "@/models/Group";
import { InviteDoc } from "@/models/Invite";
import { ListDoc } from "@/models/List";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  runTransaction,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/clientApp";
import { generateInvite } from "./invites";
import { resolveUserId } from "./users";

export async function getGroupById(
  groupId: string,
  userId?: string
): Promise<GroupDoc | null> {
  const publicSnap = await getDoc(doc(db, "groups", groupId, "public", "data"));
  if (!publicSnap.exists()) return null;

  const publicData = publicSnap.data();

  const result: GroupDoc = {
    id: groupId,
    public: {
      ...publicData,
      deadline: (publicData.deadline as Timestamp).toDate(),
    } as PublicGroupDoc,
  };

  if (userId) {
    try {
      // Check membership
      const memberSnap = await getDoc(
        doc(db, "groups", groupId, "members", userId)
      );
      if (memberSnap.exists()) {
        // ✅ user is a member → fetch private + members
        const privateSnap = await getDoc(
          doc(db, "groups", groupId, "private", "data")
        );
        result.private = privateSnap.exists()
          ? (privateSnap.data() as PrivateGroupDoc)
          : undefined;

        const membersCol = collection(db, "groups", groupId, "members");
        const membersSnap = await getDocs(membersCol);

        const members: MembersMap = {};
        membersSnap.forEach((docSnap) => {
          members[docSnap.id] = docSnap.data() as MemberDoc;
        });

        result.members = members;
      }
    } catch (err) {
      // Permission error (user not a member) → just ignore
      console.warn("Not a member or no permission to read members:", err);
    }
  }

  return result;
}

export async function createGroup(
  groupData: Omit<PublicGroupDoc, "id" | "status"> & {
    settings: PrivateGroupDoc["settings"];
  }
) {
  const groupRef = doc(collection(db, "groups"));

  const publicDoc: PublicGroupDoc = {
    id: groupRef.id,
    creatorId: groupData.creatorId,
    name: groupData.name,
    description: groupData.description,
    status: "draft",
    deadline: groupData.deadline,
  };

  const creatorUsername = await resolveUserId(groupData.creatorId);
  const now = Timestamp.now();
  const inviteLink = await generateInvite(groupRef.id, groupData.creatorId);

  const privateDoc: PrivateGroupDoc = {
    settings: groupData.settings,
    inviteLink: inviteLink,
    activityLog: [
      {
        message: `Grupo ${groupData.name} creado por ${creatorUsername}`,
        timestamp: now,
      },
      { message: `${creatorUsername} se unió al grupo`, timestamp: now },
    ],
  };

  const memberDoc: MemberDoc = {
    role: "admin",
    joinedAt: new Date(),
    list: { bets: [], points: 0 },
  };

  await Promise.all([
    setDoc(doc(db, "groups", groupRef.id, "public", "data"), publicDoc),
    setDoc(doc(db, "groups", groupRef.id, "private", "data"), privateDoc),
    setDoc(
      doc(db, "groups", groupRef.id, "members", groupData.creatorId),
      memberDoc
    ),
  ]);

  const userRef = doc(db, "users", groupData.creatorId);
  await updateDoc(userRef, {
    groups: arrayUnion(groupRef.id),
  });
}

export async function updateList(
  groupId: string,
  userId: string,
  list: ListDoc
) {
  const memberRef = doc(db, "groups", groupId, "members", userId);

  await updateDoc(memberRef, {
    list,
  });
}

export async function joinGroup(userId: string, tokenId: string) {
  const inviteRef = doc(db, "invites", tokenId);
  const userRef = doc(db, "users", userId);

  await runTransaction(db, async (transaction) => {
    const inviteSnap = await transaction.get(inviteRef);
    if (!inviteSnap.exists()) {
      throw new Error("Invite not found!");
    }

    const inviteData = inviteSnap.data() as InviteDoc;

    const memberRef = doc(db, "groups", inviteData.groupId, "members", userId);

    transaction.set(memberRef, {
      role: "member",
      joinedAt: new Date(),
      list: { bets: [], points: 0 },
    });

    transaction.update(userRef, {
      groups: arrayUnion(inviteData.groupId),
    });
  });
}
