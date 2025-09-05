import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/clientApp";

export async function updateRecord(
  name: string,
  userId: string,
  groupId: string
) {
  const listRef = doc(
    db,
    "review-record",
    name,
    "lists",
    `${userId}_${groupId}`
  );
  await setDoc(listRef, { userId, groupId });
}
