export interface BetDoc {
  type: string;
  name: string;
  status: "deceased" | "alive";
  wikidataId: string;
  snippet?: string;
  age?: number | null;
}
