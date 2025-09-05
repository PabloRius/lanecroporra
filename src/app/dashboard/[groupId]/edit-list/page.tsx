"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDebounce } from "@/hooks/useDebounce";
import { getGroupById, updateList } from "@/lib/firestore/groups";
import { BetDoc } from "@/models/Bet";
import { GroupDoc } from "@/models/Group";
import { ListDoc } from "@/models/List";
import { useAuth } from "@/providers/auth-provider";
import {
  AlertCircle,
  ArrowLeft,
  Ban,
  Calendar,
  CheckCircle,
  Loader2,
  Plus,
  Save,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

type WikiSuggestion = {
  id: string;
  name: string;
  snippet: string;
  wikidataId: string;
  isAlive: boolean;
  age: number | null;
};

export default function EditListPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const [groupId, setGroupId] = useState<string | null>(null);

  const { currentUser, loading } = useAuth();
  const [groupData, setGroupData] = useState<GroupDoc | undefined | null>(
    undefined
  );
  const [currentList, setCurrentList] = useState<ListDoc>({
    bets: [],
    points: 0,
  });

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0 });
  const [hasChanges, setHasChanges] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 400);
  const [filteredSuggestions, setFilteredSuggestions] = useState<
    WikiSuggestion[]
  >([]);

  useEffect(() => {
    const initPage = async () => {
      const { groupId } = await params;
      if (!groupId) {
        redirect("/dashboard");
      }
      setGroupId(groupId);
    };
    initPage();
  }, [params]);

  useEffect(() => {
    const fetchGroupData = async () => {
      if (!groupId) return;
      setGroupData(undefined);
      const data = await getGroupById(groupId, currentUser?.uid);
      if (data) {
        setGroupData(data);
        if (currentUser?.uid && data.members![currentUser?.uid].list) {
          setCurrentList(data.members![currentUser?.uid].list);
        }
        return;
      }
      setGroupData(null);
    };
    fetchGroupData();
  }, [groupId, currentUser]);

  useEffect(() => {
    const updateTimeLeft = () => {
      if (!groupData) return;
      const now = new Date();
      const diff = groupData.public.deadline.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );

      setTimeLeft({ days, hours });
    };

    updateTimeLeft();
  }, [groupData]);

  useEffect(() => {
    const fetchPeople = async () => {
      if (!debouncedSearch) {
        setFilteredSuggestions([]);
        return;
      }

      try {
        // Step 1: Search Wikidata
        const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(
          debouncedSearch
        )}&language=en&format=json&origin=*&type=item`;

        const res = await fetch(searchUrl);
        const data = await res.json();

        // Step 2: For each result, fetch details to confirm it's a human
        const humanResults = await Promise.all(
          data.search.map(
            async (item: {
              id: string;
              label: string;
              description: string;
            }) => {
              try {
                const entityUrl = `https://www.wikidata.org/wiki/Special:EntityData/${item.id}.json`;
                const entityRes = await fetch(entityUrl);
                const entityData = await entityRes.json();

                const entity = entityData.entities[item.id];
                const claims = entity?.claims ?? {};

                // Check "instance of" human
                const isHuman = (claims.P31 || []).some(
                  (c: { mainsnak: { datavalue: { value: { id: string } } } }) =>
                    c.mainsnak.datavalue?.value?.id === "Q5"
                );
                if (!isHuman) return null;

                // Extract birth & death dates
                const birthClaim =
                  claims.P569?.[0]?.mainsnak?.datavalue?.value?.time;
                const deathClaim =
                  claims.P570?.[0]?.mainsnak?.datavalue?.value?.time;

                const birthDate = birthClaim
                  ? new Date(birthClaim.replace("+", ""))
                  : null;
                const deathDate = deathClaim
                  ? new Date(deathClaim.replace("+", ""))
                  : null;

                let age: number | null = null;
                let isAlive = true;

                if (birthDate) {
                  const endDate = deathDate || new Date();
                  age =
                    endDate.getFullYear() -
                    birthDate.getFullYear() -
                    (endDate <
                    new Date(
                      endDate.getFullYear(),
                      birthDate.getMonth(),
                      birthDate.getDate()
                    )
                      ? 1
                      : 0);
                }

                if (deathDate) {
                  isAlive = false;
                }

                return {
                  id: item.id,
                  name: item.label,
                  snippet: item.description || "Person",
                  wikidataId: item.id,
                  isAlive,
                  age,
                };
              } catch (err) {
                console.warn("Failed to load entity", item.id, err);
                return null;
              }
            }
          )
        );

        setFilteredSuggestions(humanResults.filter(Boolean));
      } catch (err) {
        console.error("Wikidata search error", err);
      }
    };

    fetchPeople();
  }, [debouncedSearch]);

  const addBetToList = (newBet: BetDoc) => {
    setCurrentList((prev) => {
      if (Object.keys(prev.bets).length >= groupData!.private!.settings.maxBets)
        return prev;
      if (prev.bets.some((bet) => bet.name === newBet.name)) return prev;

      return { ...prev, bets: [...prev.bets, newBet] };
    });
    setHasChanges(true);
  };

  const removeBetFromList = (index: number) => {
    setCurrentList((prev) => {
      return { ...prev, bets: prev.bets.filter((_, i) => i !== index) };
    });
    setHasChanges(true);
  };

  const saveList = async () => {
    await updateList(groupId!, currentUser!.uid, currentList);
    setHasChanges(false);
    redirect("/dashboard/" + groupId);
  };

  if (groupData === undefined || loading) {
    return (
      <div className="flex flex-1 w-full items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (groupData === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Grupo no encontrado</h1>
          <Button onClick={() => redirect("/dashboard")}>
            Volver al Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (
    !(
      currentUser &&
      groupData.members &&
      Object.keys(groupData.members!).includes(currentUser.uid)
    )
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 mb-4">
            No tienes permiso para editar esta lista.
          </p>
          <Button onClick={() => redirect("/dashboard")}>
            Volver al Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-[dvh] bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => redirect(`/dashboard/${groupId}`)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold truncate">
                  {groupData.public.name}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Editando mi lista
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              {timeLeft && timeLeft.days > 0 && timeLeft.hours > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center sm:justify-start">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {timeLeft.days}d {timeLeft.hours}h restantes
                  </span>
                </div>
              )}

              <Button
                onClick={saveList}
                disabled={!hasChanges}
                className="flex items-center gap-2 w-full sm:w-auto"
              >
                <Save className="w-4 h-4" />
                Guardar Lista
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto h-full px-4 py-6">
        {/* Current List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full gap-6">
          <div className="space-y-4 order-1 lg:order-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="text-lg">Mi Lista Actual</span>
                  <Badge
                    variant={
                      Object.keys(currentList.bets).length ===
                      groupData.private!.settings.maxBets
                        ? "default"
                        : "secondary"
                    }
                  >
                    {Object.keys(currentList.bets).length}/
                    {groupData.private!.settings.maxBets}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Puedes añadir hasta {groupData.private!.settings.maxBets}{" "}
                  personas a tu lista
                </CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(currentList.bets).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Tu lista está vacía</p>
                    <p className="text-sm">Busca y añade personas famosas</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentList.bets.map(({ name }, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg border border-border"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{name}</p>
                            {/* <p className="text-sm text-muted-foreground truncate">
                              {person.profession} • {person.age} años
                            </p> */}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeBetFromList(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 flex-shrink-0 ml-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Deadline Warning */}
            {timeLeft && (
              <Alert
                className={
                  timeLeft.days <= 0 && timeLeft.hours <= 0
                    ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20"
                    : timeLeft.days <= 7
                    ? "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20"
                    : ""
                }
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {timeLeft.days <= 0 && timeLeft.hours <= 0
                    ? "La fecha límite ha expirado. No puedes modificar tu lista."
                    : timeLeft.days <= 7
                    ? `¡Atención! Solo quedan ${timeLeft.days} días y ${timeLeft.hours} horas para enviar tu lista.`
                    : `Tienes ${timeLeft.days} días y ${timeLeft.hours} horas para completar tu lista.`}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Search and Add People */}
          <div className="order-2 lg:order-2 h-full">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Buscar Personas</CardTitle>
                <CardDescription>
                  Busca personas famosas para añadir a tu lista
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Buscar por nombre o profesión..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="overflow-y-auto space-y-2">
                    {filteredSuggestions.map((person) => {
                      const isInList = currentList.bets.some(
                        (bet) => bet.name === person.name
                      );
                      const canAdd =
                        person.isAlive &&
                        currentList.bets.length <
                          groupData.private!.settings.maxBets &&
                        !isInList;

                      return (
                        <div
                          key={person.id}
                          className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                            isInList
                              ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20"
                              : canAdd
                              ? "border-border hover:bg-muted/50 cursor-pointer"
                              : "border-border bg-muted/30 opacity-50"
                          }`}
                          onClick={() =>
                            canAdd &&
                            addBetToList({
                              name: person.name,
                              type: "default",
                              status: "alive",
                            })
                          }
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">
                              {person.name}
                            </p>
                            <p className="text-sm text-muted-foreground truncate">
                              {person.snippet} •{" "}
                              {person.age !== null
                                ? `${person.age} años`
                                : "Edad desconocida"}{" "}
                              • {person.isAlive ? "Vivo/a" : "Fallecido/a"}
                            </p>
                          </div>
                          <div className="flex-shrink-0 ml-3">
                            {isInList ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : !person.isAlive ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Ban className="w-5 h-5 text-red-500 cursor-not-allowed" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Esta persona no es elegible</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : canAdd ? (
                              <Plus className="w-5 h-5 text-muted-foreground" />
                            ) : (
                              <div className="w-5 h-5" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
