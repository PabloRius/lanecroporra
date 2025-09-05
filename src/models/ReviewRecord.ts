export type ReviewRecord = Record<
  string,
  { status: string; lists: Array<{ userId: string; groupId: string }> }
>;
