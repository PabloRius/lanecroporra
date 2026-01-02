import { BetDoc } from "@/models/Bet";
import { MemberDoc } from "@/models/Group";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase/clientApp";

export async function updateRecord(
  wikidataId: string,
  userId: string,
  groupId: string
) {
  const recordRef = doc(db, "review-record", wikidataId);

  const listRef = doc(
    db,
    "review-record",
    wikidataId,
    "lists",
    `${userId}_${groupId}`
  );

  const recordSnap = await getDoc(recordRef);

  if (!recordSnap.exists()) {
    await setDoc(recordRef, {
      createdAt: new Date(),
      status: "alive",
    });
  }

  await setDoc(listRef, { userId, groupId });
}

async function checkWikidataDeceasedStatus(
  ids: string[]
): Promise<Record<string, boolean>> {
  if (ids.length === 0) return {};

  const idsParam = ids.join("|");
  const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${idsParam}&props=claims&format=json&origin=*`;

  const res = await fetch(url);
  const data = await res.json();

  const statusMap: Record<string, boolean> = {};

  ids.forEach((id) => {
    const entity = data.entities[id];
    if (entity && entity.claims) {
      const isDeceased = !!entity.claims.P570;
      statusMap[id] = isDeceased;
    }
  });

  return statusMap;
}

export async function reviewAllRecords() {
  const recordsRef = collection(db, "review-record");
  const q = query(recordsRef, where("status", "==", "alive"));
  const recordsSnap = await getDocs(q);

  if (recordsSnap.empty) return "No hay registros pendientes de revisión";

  const allRecordIds = recordsSnap.docs.map((d) => d.id);

  const CHUNK_SIZE = 50;
  const deceasedFound: string[] = [];

  for (let i = 0; i < allRecordIds.length; i += CHUNK_SIZE) {
    const chunk = allRecordIds.slice(i, i + CHUNK_SIZE);
    const results = await checkWikidataDeceasedStatus(chunk);

    Object.entries(results).forEach(([id, isDeceased]) => {
      if (isDeceased) deceasedFound.push(id);
    });
  }

  console.log(`Se han detectado ${deceasedFound.length} fallecimientos nuevos`);

  for (const wikidataId of deceasedFound) {
    const batch = writeBatch(db);

    batch.update(doc(db, "review-record", wikidataId), {
      status: "deceased",
      updatedAt: new Date(),
    });

    const listsCol = collection(db, "review-record", wikidataId, "lists");
    const listsSnap = await getDocs(listsCol);

    console.log(
      wikidataId,
      "has been updated to deceased in the following lists: "
    );

    for (const listDoc of listsSnap.docs) {
      const { userId, groupId } = listDoc.data();
      console.log("Group: ", groupId, " user: ", userId);

      const memberRef = doc(db, "groups", groupId, "members", userId);
      const memberSnap = await getDoc(memberRef);

      const memberData = memberSnap.data() as MemberDoc;

      if (!memberData || !memberData.list.bets) continue;

      const { list: oldList } = memberData;

      const betIndex = oldList.bets.findIndex(
        (bet) => bet.wikidataId === wikidataId
      );

      if (betIndex === -1) {
        // Should remove the reference from the global array (unexpected data mismatch)
        return;
      }

      const oldStatus = oldList.bets[betIndex].status;

      if (oldStatus === "alive") {
        const newList = oldList.bets.map((bet: BetDoc, i) => {
          if (i === betIndex) return { ...bet, status: "deceased" };
          return bet;
        });

        batch.update(memberRef, {
          ...memberData,
          list: newList,
          points: oldList.points + 1,
        });
      }
    }
  }
}
