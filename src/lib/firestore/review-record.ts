import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/clientApp";

export async function updateRecord(
  name: string,
  userId: string,
  groupId: string
) {
  const recordRef = doc(db, "review-record", name);

  const listRef = doc(
    db,
    "review-record",
    name,
    "lists",
    `${userId}_${groupId}`
  );

  const recordSnap = await getDoc(recordRef);

  if (!recordSnap.exists()) {
    await setDoc(recordRef, {
      createdAt: new Date(),
      status: "alive",
    });
  }

  await setDoc(listRef, { userId, groupId });
}
