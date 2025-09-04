import { UserDoc } from "@/models/User";
import { User } from "firebase/auth";
import {
  arrayRemove,
  doc,
  getDoc,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/clientApp";

export async function getUserById(uid: string): Promise<UserDoc | null> {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  const data = userSnap.data();
  return userSnap.exists()
    ? ({
        ...data,
        createdAt: (data?.createdAt as Timestamp).toDate(),
      } as UserDoc)
    : null;
}

export async function resolveUserId(uid: string): Promise<string | null> {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  const data = userSnap.data();
  return userSnap.exists() ? data!.displayName : null;
}

export async function createUser(authUser: User) {
  const userRef = doc(db, "users", authUser.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    const newUser: UserDoc = {
      uid: authUser.uid,
      email: authUser.email!,
      displayName: authUser.displayName || authUser.email!.split("@")[0],
      createdAt: new Date(),
      groups: [],
    };

    await setDoc(userRef, newUser);
  }
}

export async function removeGroupFromUser(userId: string, groupId: string) {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error("User not found");
  }

  const userData = userSnap.data() as UserDoc;

  if (!userData.groups.includes(groupId)) {
    return;
  }

  await updateDoc(userRef, {
    groups: arrayRemove(groupId),
  });
}
