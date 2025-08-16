import { ListDoc } from "./List";

export interface GroupDoc {
  id: string;
  creatorId: string;
  name: string;
  description: string;
  members: Array<string>;
  status: "draft" | "activo" | "finalizado";
  deadline: Date;
  lists: Record<string, ListDoc>;
  settings: {
    maxBets: number;
  };
}
