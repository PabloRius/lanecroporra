"use server";

import { EditList } from "@/components/edit-list";

export default async function EditListPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;

  return <EditList groupId={groupId} />;
}
