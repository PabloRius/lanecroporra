import { UserDoc, UserStats } from "@/models/User";
import { User } from "firebase/auth";
import {
  arrayRemove,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/clientApp";
import { getGroupById, getUserList } from "./groups";

export async function getAllUsers(): Promise<UserDoc[] | null> {
  try {
    const usersRef = collection(db, "users");

    const q = query(usersRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return [];
    }

    const users = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: (data.createdAt as Timestamp).toDate() || new Date(),
      } as unknown as UserDoc;
    });

    return users;
  } catch (error) {
    console.error("Error fetching users: ", error);
    return null;
  }
}

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
      photoURL: authUser.photoURL || undefined,
      displayName: authUser.displayName || authUser.email!.split("@")[0],
      createdAt: new Date(),
      groups: [],
      role: "user",
      status: "active",
      tier: "free",
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

export async function getUserStats(userId: string): Promise<UserStats | null> {
  const user = await getUserById(userId);
  if (!user) return null;
  let totalPoints: number = 0;
  let activeGroups = 0;
  let finishedGroups = 0;
  await Promise.all(
    user.groups.map(async (group) => {
      const groupData = await getGroupById(group);
      const groupList = await getUserList(group, userId);
      if (groupList) totalPoints += groupList.points;
      if (groupData && groupList?.bets) {
        if (groupData.status === "activo" || groupData.status === "draft")
          activeGroups += 1;
        if (groupData.status === "finalizado") finishedGroups += 1;
      }
    })
  );
  console.log(activeGroups);
  return {
    totalPoints,
    victories: user.victories || 0,
    games: { active: activeGroups, finished: finishedGroups },
  };
}
