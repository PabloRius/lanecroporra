import { getUserById } from "@/lib/firestore/users";
import { MemberDoc } from "@/models/Group";
import { UserDoc } from "@/models/User";
import { User } from "firebase/auth";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

export function LeaderBoardCard({
  playerUid,
  playerData,
  index,
  currentUser,
  onClick,
}: {
  playerUid: string;
  playerData: MemberDoc;
  index: number;
  currentUser: User;
  onClick(userId: string): void;
}) {
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);

  useEffect(() => {
    async function fetchUser() {
      const user = await getUserById(playerUid);
      if (user) setUserDoc(user);
    }
    fetchUser();
  }, [playerUid]);

  if (!userDoc) return "Usuario desconocido";
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold flex-shrink-0">
          {index}
        </div>
        <span
          className={`text-sm lg:text-base truncate ${
            userDoc.displayName === currentUser?.displayName
              ? "font-semibold"
              : ""
          }`}
        >
          {userDoc.displayName === currentUser?.displayName
            ? "Tú"
            : userDoc.displayName}
        </span>
      </div>
      <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
        <div className="text-right">
          <p className="font-semibold text-sm lg:text-base">
            {playerData.list.points} pts
          </p>
        </div>
        {userDoc.displayName !== currentUser?.displayName && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-muted"
            onClick={() => onClick(playerUid)}
            disabled={!playerData.list.bets}
          >
            {playerData.list.bets ? (
              <Eye className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            ) : (
              <EyeOff className="w-4 h-4 text-muted-foreground/50" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
