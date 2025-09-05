import { BetDoc } from "@/models/Bet";
import {
  GroupDoc,
  MemberDoc,
  MembersMap,
  PrivateGroupDoc,
  PublicGroupDoc,
  UpdateGroupDoc,
} from "@/models/Group";
import { InviteDoc } from "@/models/Invite";
import { ListDoc } from "@/models/List";
import { UserDoc } from "@/models/User";
import {
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  Timestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase/clientApp";
import { updateRecord } from "./review-record";
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
): Promise<{ groupId: string }> {
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

  const privateDoc: PrivateGroupDoc = {
    settings: groupData.settings,
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

  return { groupId: groupRef.id };
}

export async function updateList(
  groupId: string,
  userId: string,
  newList: ListDoc
) {
  const memberRef = doc(db, "groups", groupId, "members", userId);

  // Get old list
  const memberSnap = await getDoc(memberRef);
  const oldList = memberSnap.exists()
    ? (memberSnap.data()?.list as ListDoc)
    : { bets: [] };

  const oldNames = new Set(oldList.bets.map((bet) => bet.name) || []);
  const newNames = new Set(newList.bets.map((bet) => bet.name) || []);

  // Detect additions
  const added = [...newNames].filter((name) => !oldNames.has(name));
  // Detect removals
  const removed = [...oldNames].filter((name) => !newNames.has(name));

  // Process additions
  for (const name of added) {
    console.log("adding: ", name);
    await updateRecord(name, userId, groupId);
  }

  // Process removals
  for (const name of removed) {
    console.log("removing: ", name);
    const listRef = doc(
      db,
      "review-record",
      name,
      "lists",
      `${userId}_${groupId}`
    );
    await deleteDoc(listRef);
  }

  // Finally update the list in member doc
  await updateDoc(memberRef, { list: newList });
}

export async function joinGroup(userId: string, tokenId: string) {
  const inviteRef = doc(db, "invites", tokenId);
  const userRef = doc(db, "users", userId);

  const inviteSnap = await getDoc(inviteRef);
  const userSnap = await getDoc(userRef);
  if (!inviteSnap.exists()) {
    throw new Error("Invite not found!");
  }
  const userData = userSnap.data() as UserDoc;
  if (!userSnap.exists() || !userData) {
    throw new Error("User not found!");
  }

  const inviteData = inviteSnap.data() as InviteDoc;

  const memberRef = doc(db, "groups", inviteData.groupId, "members", userId);
  const groupRef = doc(db, "groups", inviteData.groupId, "private", "data");

  setDoc(memberRef, {
    role: "member",
    joinedAt: new Date(),
    list: { bets: [], points: 0 },
    inviteId: tokenId,
  });

  updateDoc(userRef, {
    groups: arrayUnion(inviteData.groupId),
  });

  const now = Timestamp.now();

  updateDoc(groupRef, {
    activityLog: arrayUnion({
      message: `${userData.displayName} se unió al grupo`,
      timestamp: now,
    }),
  });
}

export async function leaveGroup(userId: string, groupId: string) {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  const userData = userSnap.data() as UserDoc;
  if (!userSnap.exists() || !userData) {
    throw new Error("User not found!");
  }

  const memberRef = doc(db, "groups", groupId, "members", userId);
  const groupRef = doc(db, "groups", groupId, "private", "data");

  const now = Timestamp.now();

  await updateDoc(groupRef, {
    activityLog: arrayUnion({
      message: `${userData.displayName} abandonó el grupo`,
      timestamp: now,
    }),
  });
  await deleteDoc(memberRef);
}

export async function updateGroup(
  groupId: string,
  newGroupData: UpdateGroupDoc
) {
  const publicGroupRef = doc(db, "groups", groupId, "public", "data");
  const privateGroupRef = doc(db, "groups", groupId, "private", "data");
  await updateDoc(publicGroupRef, {
    name: newGroupData.public?.name,
    description: newGroupData.public?.description,
    deadline: newGroupData.public?.deadline,
  });
  await updateDoc(privateGroupRef, {
    settings: {
      maxBets: newGroupData.private?.settings?.maxBets,
    },
  });
}

export async function deleteGroup(groupId: string) {
  const publicGroupRef = doc(db, "groups", groupId, "public", "data");
  const privateGroupRef = doc(db, "groups", groupId, "private", "data");

  const privateSnap = await getDoc(privateGroupRef);
  if (privateSnap.exists()) {
    const privateData = privateSnap.data() as { inviteLink?: string };

    if (privateData.inviteLink) {
      const inviteRef = doc(db, "invites", privateData.inviteLink);
      await deleteDoc(inviteRef);
    }
  }

  await deleteDoc(publicGroupRef);
  await deleteDoc(privateGroupRef);

  const membersColRef = collection(db, "groups", groupId, "members");
  const membersSnap = await getDocs(membersColRef);
  for (const member of membersSnap.docs) {
    await deleteDoc(member.ref);
  }
}

const normalize = (s: string) =>
  s
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();

export async function setNameStatusAcrossGroup(
  groupId: string,
  name: string,
  status: "alive" | "deceased"
) {
  const target = normalize(name);
  const membersCol = collection(db, "groups", groupId, "members");
  const snap = await getDocs(membersCol);

  // Gather updates
  const updates: Array<{ ref: ReturnType<typeof doc>; list: ListDoc }> = [];

  snap.forEach((memberSnap) => {
    const data = memberSnap.data() as MemberDoc | undefined;
    if (!data?.list?.bets?.length) return;

    let changed = false;
    const newBets: BetDoc[] = data.list.bets.map((b) => {
      if (normalize(b.name) === target && b.status !== status) {
        changed = true;
        return { ...b, status };
      }
      return b;
    });

    if (changed) {
      updates.push({
        ref: memberSnap.ref,
        list: { ...data.list, bets: newBets },
      });
    }
  });

  if (!updates.length) return;

  // Commit in batches (max 500 ops, stay conservative)
  const CHUNK = 400;
  for (let i = 0; i < updates.length; i += CHUNK) {
    const batch = writeBatch(db);
    for (const u of updates.slice(i, i + CHUNK)) {
      batch.update(u.ref, { list: u.list });
    }
    await batch.commit();
  }
}

export async function promoteToAdmin(groupId: string, memberId: string) {
  const memberRef = doc(db, "groups", groupId, "members", memberId);

  try {
    await updateDoc(memberRef, {
      role: "admin",
    });
  } catch (error) {
    console.error("Error promoting member to admin:", error);
    throw error;
  }
}
