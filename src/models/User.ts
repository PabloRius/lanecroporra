export interface UserDoc {
  uid: string;
  email: string;
  photoURL?: string;
  displayName: string;
  createdAt: Date;
  groups: Array<string>;
  role?: "user" | "admin" | "creator";
  status: "active" | "inactive" | "banned";
  tier?: "free" | "pro";
  victories?: number;
  createdGroupsCount?: number;
}

export interface UserStats {
  totalPoints: number;
  victories: number;
  games: { active: number; finished: number };
}
