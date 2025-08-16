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
import { getGroupById, updateLists } from "@/lib/firestore/groups";
import { GroupDoc } from "@/models/Group";
import { ListDoc } from "@/models/List";
import { useAuth } from "@/providers/auth-provider";
import {
  AlertCircle,
  ArrowLeft,
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

// Mock famous people suggestions
const mockSuggestions = [
  { id: 4, name: "Morgan Freeman", age: 86, profession: "Actor" },
  { id: 5, name: "Anthony Hopkins", age: 86, profession: "Actor" },
  { id: 6, name: "Julie Andrews", age: 88, profession: "Actriz" },
  { id: 7, name: "Al Pacino", age: 83, profession: "Actor" },
  { id: 8, name: "Robert De Niro", age: 80, profession: "Actor" },
  { id: 9, name: "Jack Nicholson", age: 86, profession: "Actor" },
  { id: 10, name: "Helen Mirren", age: 78, profession: "Actriz" },
];

export function EditList({ groupId }: { groupId: string }) {
  const { currentUser, loading } = useAuth();
  const [groupData, setGroupData] = useState<GroupDoc | undefined | null>(
    undefined
  );
  const [currentList, setCurrentList] = useState<ListDoc>({ bets: {} });

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0 });
  const [hasChanges, setHasChanges] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] =
    useState(mockSuggestions);

  useEffect(() => {
    const fetchGroupData = async () => {
      setGroupData(undefined);
      const data = await getGroupById(groupId);
      if (data) {
        setGroupData(data);
        if (currentUser?.uid && data.lists[currentUser?.uid]) {
          setCurrentList(data.lists[currentUser.uid]);
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
      const diff = groupData.deadline.getTime() - now.getTime();

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
    console.log(currentList);
  }, [currentList]);

  useEffect(() => {
    const filtered = mockSuggestions.filter(
      (person) =>
        person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.profession.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSuggestions(filtered);
  }, [searchTerm]);

  const addPersonToList = (key: string, newBet: string) => {
    setCurrentList((prev) => {
      if (Object.keys(prev.bets).length >= groupData!.settings.maxBets)
        return prev;
      if (Object.values(prev.bets).some((bet) => bet === newBet)) return prev;

      let uniqueKey = key;
      let counter = 1;
      while (prev.bets.hasOwnProperty(uniqueKey)) {
        uniqueKey = `${key}-${counter}`;
        counter++;
      }

      return { ...prev, bets: { ...prev.bets, [uniqueKey]: newBet } };
    });
    setHasChanges(true);
  };

  const removeBetFromList = (key: string) => {
    setCurrentList((prev) => {
      const updatedBets = { ...prev.bets };
      delete updatedBets[key];
      return { ...prev, bets: updatedBets };
    });
    setHasChanges(true);
  };

  const saveList = async () => {
    await updateLists(groupId, currentUser!.uid, currentList);
    setHasChanges(false);
    redirect("/dashboard");
  };

  if (groupData === undefined) {
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => redirect("/dashboard")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <div>
                <h1 className="text-xl font-bold">{groupData.name}</h1>
                <p className="text-sm text-muted-foreground">
                  Editando mi lista
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {new Date() <= groupData.deadline && (
                <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {timeLeft.days}d {timeLeft.hours}h restantes
                  </span>
                </div>
              )}

              <Button
                onClick={saveList}
                disabled={!hasChanges}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Guardar Lista
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Current List */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Mi Lista Actual</span>
                  <Badge
                    variant={
                      Object.keys(currentList.bets).length ===
                      groupData.settings.maxBets
                        ? "default"
                        : "secondary"
                    }
                  >
                    {Object.keys(currentList.bets).length}/
                    {groupData.settings.maxBets}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Puedes añadir hasta {groupData.settings.maxBets} personas a tu
                  lista
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex flex-1 w-full items-center justify-center">
                    <Loader2 className="animate-spin" />
                  </div>
                ) : Object.keys(currentList.bets).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Tu lista está vacía</p>
                    <p className="text-sm">Busca y añade personas famosas</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(currentList.bets).map(
                      ([key, bet], index) => (
                        <div
                          key={key}
                          className="flex items-center justify-between p-3 rounded-lg border border-border"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{bet}</p>
                              {/* <p className="text-sm text-muted-foreground">
                              {person.profession} • {person.age} años
                            </p> */}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeBetFromList(key)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Deadline Warning */}
            {timeLeft && (
              <Alert
                className={
                  timeLeft.days <= 0 && timeLeft.hours <= 0
                    ? "border-red-200 bg-red-50"
                    : ""
                }
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {timeLeft.days <= 0 && timeLeft.hours <= 0
                    ? "La fecha límite ha expirado. No puedes modificar tu lista."
                    : `Tienes ${timeLeft.days} días y ${timeLeft.hours} horas para completar tu lista.`}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Search and Add People */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Buscar Personas</CardTitle>
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

                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {filteredSuggestions.map((person) => {
                      const isInList = Object.values(currentList.bets).some(
                        (bet) => bet === person.name
                      );
                      const canAdd =
                        Object.keys(currentList.bets).length <
                          groupData.settings.maxBets && !isInList;

                      return (
                        <div
                          key={person.id}
                          className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                            isInList
                              ? "border-green-200 bg-green-50"
                              : canAdd
                              ? "border-border hover:bg-muted/50 cursor-pointer"
                              : "border-border bg-muted/30 opacity-50"
                          }`}
                          onClick={() =>
                            canAdd && addPersonToList("default", person.name)
                          }
                        >
                          <div>
                            <p className="font-medium">{person.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {person.profession} • {person.age} años
                            </p>
                          </div>
                          <div>
                            {isInList ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
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
