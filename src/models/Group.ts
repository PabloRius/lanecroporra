import { ListDoc } from "./List";

export interface MemberDoc {
  role: "admin" | "member";
  list: ListDoc;
  joinedAt: Date;
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
  inviteLinks: string[];
}

export type MembersMap = Record<string, MemberDoc>;

export type GroupDoc = {
  id: string;
  public: PublicGroupDoc;
  private?: PrivateGroupDoc;
  members?: MembersMap;
};
