export interface InviteDoc {
  groupId: string;
  createdBy: string;
  createdAt: Date;
  used: boolean;
  usedBy?: string;
  usedAt?: Date;
}
