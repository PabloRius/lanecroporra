export interface UserDoc {
  uid: string;
  email: string;
  displayName: string;
  createdAt: Date;
  groups: Array<string>;
  role?: "user" | "admin" | "creator";
  status: "active" | "inactive" | "banned";
}
