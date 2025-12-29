import { Timestamp } from "firebase/firestore";
import { ListDoc } from "./List";

export interface MemberDoc {
  role: "admin" | "member";
  list: ListDoc;
  joinedAt: Date;
}

export interface Log {
  message: string;
  timestamp: Timestamp;
}

export type MembersMap = Record<string, MemberDoc>;

export type GroupDoc = {
  id: string;
  name: string;
  description: string;
  status: "draft" | "activo" | "finalizado";
  deadline: Date;
  creatorId: string;
  createdAt: Date;

  settings: {
    maxBets: number;
  };
  inviteLink?: string;
  activityLog: Log[];
  members?: MembersMap;
};

export interface UpdateGroupDoc {
  name?: string;
  description?: string;
  deadline?: Date;
  settings?: {
    maxBets?: number;
  };
}
