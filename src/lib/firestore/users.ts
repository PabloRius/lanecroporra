import { UserDoc } from "@/models/User";
import { User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/clientApp";

export async function getUserById(uid: string): Promise<UserDoc | null> {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? (userSnap.data() as UserDoc) : null;
}

export async function createUser(authUser: User) {
  const userRef = doc(db, "users", authUser.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    const newUser: UserDoc = {
      uid: authUser.uid,
      email: authUser.email || null,
      displayName: authUser.displayName || null,
      createdAt: new Date(),
      groups: [],
    };

    await setDoc(userRef, newUser);
  }
}
