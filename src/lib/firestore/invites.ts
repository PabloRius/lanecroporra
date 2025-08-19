import { GroupDoc } from "@/models/Group";
import { InviteDoc } from "@/models/Invite";
import { doc, getDoc, setDoc, Timestamp, updateDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { db } from "../firebase/clientApp";
import { getGroupById } from "./groups";

export async function generateInvite(groupId: string, userId: string) {
  const groupRef = doc(db, "groups", groupId, "private", "data");
  const groupData = (await getDoc(groupRef)).data();

  if (!groupData) {
    throw new Error("Group not found");
  }

  const inviteId = uuidv4();
  const inviteRef = doc(db, "invites", inviteId);

  const inviteData: InviteDoc = {
    groupId: groupId,
    createdAt: new Date(),
    createdBy: userId,
    used: false,
  };
  await setDoc(inviteRef, inviteData);

  await updateDoc(groupRef, {
    inviteLinks: [...(groupData.invites || []), inviteId],
  });

  return inviteId;
}

export async function resolveInvite(
  inviteId: string
): Promise<InviteDoc | null> {
  const inviteRef = doc(db, "invites", inviteId);
  const inviteSnap = await getDoc(inviteRef);
  const data = inviteSnap.data();

  return inviteSnap.exists()
    ? ({
        ...data,
        createdAt: (data!.createdAt as Timestamp).toDate(),
      } as InviteDoc)
    : null;
}

export async function resolveInviteGroup(
  inviteId: string,
  userId?: string
): Promise<GroupDoc | null> {
  const inviteData = await resolveInvite(inviteId);
  if (!inviteData) return null;
  const groupData = await getGroupById(inviteData.groupId, userId);
  return groupData;
}
