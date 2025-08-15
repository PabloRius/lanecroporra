import { GroupDoc } from "@/models/Group";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/clientApp";

export async function getGroupById(uid: string): Promise<GroupDoc | null> {
  const groupRef = doc(db, "groups", uid);
  const groupSnap = await getDoc(groupRef);
  const data = groupSnap.data();
  return groupSnap.exists() ? (data as GroupDoc) : null;
}

export async function createGroup(groupData: Omit<GroupDoc, "id">) {
  const groupRef = doc(collection(db, "groups"));

  const newGroup: GroupDoc = {
    id: groupRef.id,
    creatorId: groupData.creatorId,
    name: groupData.name,
    description: groupData.description,
    members: [groupData.creatorId],
    status: "activo",
    deadline: groupData.deadline,
    lists: [],
  };

  await setDoc(groupRef, newGroup);
}
