export interface GroupDoc {
  id: string;
  creatorId: string;
  name: string;
  description: string;
  members: Array<string>;
  status: "activo" | "inactivo";
  deadline: Date;
  lists: Array<string>;
}
