export interface UserDoc {
  uid: string;
  email: string | null;
  displayName: string | null;
  createdAt: Date;
  groups: Array<unknown>;
}
