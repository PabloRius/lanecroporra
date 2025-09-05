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

export interface PublicGroupDoc {
  id: string;
  name: string;
  description: string;
  status: "draft" | "activo" | "finalizado";
  deadline: Date;
  creatorId: string;
}

export interface PrivateGroupDoc {
  settings: {
    maxBets: number;
  };
  inviteLink: string;
  activityLog: Log[];
}

export type MembersMap = Record<string, MemberDoc>;

export type GroupDoc = {
  id: string;
  public: PublicGroupDoc;
  private?: PrivateGroupDoc;
  members?: MembersMap;
};

export interface UpdateGroupDoc {
  public?: {
    name?: string;
    description?: string;
    deadline?: Date;
  };
  private?: {
    settings?: {
      maxBets?: number;
    };
  };
}
