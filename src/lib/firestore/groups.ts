import { BetDoc } from "@/models/Bet";
import {
  GroupDoc,
  MemberDoc,
  MembersMap,
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

export async function getAllGroups(): Promise<GroupDoc[] | null> {
  try {
    const groupsRef = collection(db, "groups");

    const querySnapshot = await getDocs(groupsRef);

    if (querySnapshot.empty) {
      return [];
    }

    const groups = await Promise.all(
      querySnapshot.docs.map(async (doc) => {
        const data = doc.data();
        const groupId = doc.id;

        const membersRef = collection(db, "groups", groupId, "members");
        const membersSnapshot = await getDocs(membersRef);

        const members: MembersMap = {};
        membersSnapshot.forEach((mDoc) => {
          members[mDoc.id] = mDoc.data() as MemberDoc;
        });
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt
            ? (data.createdAt as Timestamp).toDate()
            : null,
          deadline: (data.deadline as Timestamp).toDate() || new Date(),
          members,
        } as unknown as GroupDoc;
      })
    );

    return groups;
  } catch (error) {
    console.error("Error fetching users: ", error);
    return null;
  }
}

export async function getGroupById(
  groupId: string,
  userId?: string
): Promise<GroupDoc | null> {
  const groupSnap = await getDoc(doc(db, "groups", groupId));
  if (!groupSnap.exists()) return null;

  const groupData = groupSnap.data();

  const result: GroupDoc = {
    id: groupId,
    ...groupData,
    deadline: (groupData.deadline as Timestamp).toDate(),
  } as GroupDoc;

  if (userId) {
    try {
      // Check membership
      const memberSnap = await getDoc(
        doc(db, "groups", groupId, "members", userId)
      );
      if (memberSnap.exists()) {
        const membersCol = collection(db, "groups", groupId, "members");
        const membersSnap = await getDocs(membersCol);

        const members: MembersMap = {};
        membersSnap.forEach((docSnap) => {
          members[docSnap.id] = docSnap.data() as MemberDoc;
        });

        result.members = members;
      }
    } catch (err) {
      console.warn("Not a member or no permission to read:", err);
    }
  }

  return result;
}

export async function createGroup(
  groupData: Omit<GroupDoc, "id" | "status" | "activityLog" | "createdAt">
): Promise<{ groupId: string }> {
  const batch = writeBatch(db);

  const groupRef = doc(collection(db, "groups"));
  const groupId = groupRef.id;

  const creatorUsername = await resolveUserId(groupData.creatorId);
  const now = Timestamp.now();

  const groupDoc: GroupDoc = {
    id: groupRef.id,
    creatorId: groupData.creatorId,
    name: groupData.name,
    description: groupData.description,
    status: "draft",
    deadline: groupData.deadline,
    settings: groupData.settings,
    createdAt: new Date(),
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

  batch.set(doc(db, "groups", groupId), groupDoc);
  batch.set(
    doc(db, "groups", groupId, "members", groupData.creatorId),
    memberDoc
  );

  const userRef = doc(db, "users", groupData.creatorId);
  batch.update(userRef, {
    groups: arrayUnion(groupId),
  });

  await batch.commit();

  return { groupId };
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

  const oldIds = new Set(oldList.bets.map((bet) => bet.wikidataId) || []);
  const newIds = new Set(newList.bets.map((bet) => bet.wikidataId) || []);

  // Detect additions
  const added = [...newIds].filter((id) => !oldIds.has(id));
  // Detect removals
  const removed = [...oldIds].filter((id) => !newIds.has(id));

  // Process additions
  for (const id of added) {
    const bet = newList.bets.find((b) => b.wikidataId === id);
    if (!bet) continue;

    console.log("adding:", bet.name, id);
    await updateRecord(bet.wikidataId, userId, groupId);
  }

  // Process removals
  for (const id of removed) {
    console.log("removing:", id);
    const listRef = doc(
      db,
      "review-record",
      id,
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
  const groupRef = doc(db, "groups", inviteData.groupId);

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
  const groupRef = doc(db, "groups", groupId);

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
  const groupRef = doc(db, "groups", groupId);
  await updateDoc(groupRef, {
    name: newGroupData.name,
    description: newGroupData.description,
    deadline: newGroupData.deadline,
    settings: {
      maxBets: newGroupData.settings?.maxBets,
    },
  });
}

export async function deleteGroup(groupId: string) {
  const groupRef = doc(db, "groups", groupId);
  const groupSnap = await getDoc(groupRef);
  const groupData = groupSnap.data() as GroupDoc;

  if (groupData.inviteLink) {
    const inviteRef = doc(db, "invites", groupData.inviteLink);
    await deleteDoc(inviteRef);
  }

  await deleteDoc(groupRef);

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

export async function closeGroupLists(groupId: string) {
  try {
    const groupRef = doc(db, "groups", groupId);
    await updateDoc(groupRef, { status: "activo" });
    return true;
  } catch (error) {
    console.error("Error closing group:", error);
  }
  return false;
}

export async function getUserList(groupId: string, userId: string) {
  const memberDoc = doc(db, "groups", groupId, "members", userId);
  const memberSnap = await getDoc(memberDoc);
  if (!memberSnap.exists()) return null;

  const memberData = memberSnap.data() as MemberDoc;

  return memberData.list;
}
