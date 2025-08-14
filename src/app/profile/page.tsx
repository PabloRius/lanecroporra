"use client";

import { useAuth } from "@/providers/auth-provider";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Award,
  Calendar,
  Target,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";

const userData = {
  name: "Juan Pérez",
  email: "juan.perez@email.com",
  avatar: "/diverse-user-avatars.png",
  joinDate: "Enero 2024",
  stats: {
    totalPoints: 1250,
    gamesWon: 3,
    gamesPlayed: 8,
    friendsAdded: 12,
    currentRank: 2,
    bestStreak: 5,
    averagePoints: 156,
    successRate: 38,
  },
  achievements: [
    {
      name: "Primera Victoria",
      description: "Ganaste tu primera necroporra",
      earned: true,
    },
    {
      name: "Racha Perfecta",
      description: "5 aciertos consecutivos",
      earned: true,
    },
    { name: "Social", description: "Añadiste 10+ amigos", earned: true },
    { name: "Veterano", description: "Jugaste 10+ partidas", earned: false },
    { name: "Maestro", description: "Ganaste 5+ necroportas", earned: false },
  ],
  recentActivity: [
    {
      action: "Ganaste la Necroporra de Navidad 2024",
      date: "Hace 2 días",
      points: 340,
    },
    {
      action: "Te uniste al grupo 'Amigos del Barrio'",
      date: "Hace 1 semana",
      points: 0,
    },
    {
      action: "Acertaste: Morgan Freeman",
      date: "Hace 2 semanas",
      points: 85,
    },
    {
      action: "Creaste la lista 'Famosos 2024'",
      date: "Hace 3 semanas",
      points: 0,
    },
  ],
};

export default function ProfilePage() {
  const { currentUser, loading } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold font-serif">Mi Perfil</h1>
              <p className="text-muted-foreground">Estadísticas y logros</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Profile Info */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Users className="h-12 w-12 text-muted-foreground" />
                </div>
                <CardTitle className="font-serif">{userData.name}</CardTitle>
                <CardDescription>{userData.email}</CardDescription>
                <Badge variant="secondary" className="mt-2">
                  Miembro desde {userData.joinDate}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Puntos Totales
                  </span>
                  <span className="font-bold text-lg">
                    {userData.stats.totalPoints.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Ranking Actual
                  </span>
                  <Badge variant="outline">#{userData.stats.currentRank}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Tasa de Éxito
                  </span>
                  <span className="font-semibold">
                    {userData.stats.successRate}%
                  </span>
                </div>
                <Progress value={userData.stats.successRate} className="h-2" />
              </CardContent>
            </Card>
          </div>

          {/* Stats and Activity */}
          <div className="md:col-span-2 space-y-8">
            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="text-2xl font-bold">
                        {userData.stats.gamesWon}
                      </p>
                      <p className="text-sm text-muted-foreground">Victorias</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">
                        {userData.stats.gamesPlayed}
                      </p>
                      <p className="text-sm text-muted-foreground">Partidas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">
                        {userData.stats.friendsAdded}
                      </p>
                      <p className="text-sm text-muted-foreground">Amigos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-2xl font-bold">
                        {userData.stats.bestStreak}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Mejor Racha
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif">
                  <Award className="h-5 w-5" />
                  Logros
                </CardTitle>
                <CardDescription>
                  Desbloquea logros jugando y mejorando tus estadísticas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {userData.achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        achievement.earned
                          ? "bg-muted/50 border-green-200 dark:border-green-800"
                          : "bg-muted/20 border-muted opacity-60"
                      }`}
                    >
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          achievement.earned
                            ? "bg-green-100 dark:bg-green-900"
                            : "bg-muted"
                        }`}
                      >
                        <Award
                          className={`h-5 w-5 ${
                            achievement.earned
                              ? "text-green-600 dark:text-green-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">
                          {achievement.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {achievement.description}
                        </p>
                      </div>
                      {achievement.earned && (
                        <Badge variant="secondary" className="text-xs">
                          ✓
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif">
                  <Calendar className="h-5 w-5" />
                  Actividad Reciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userData.recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-3 rounded-lg bg-muted/30"
                    >
                      <div className="h-2 w-2 rounded-full bg-foreground flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.date}
                        </p>
                      </div>
                      {activity.points > 0 && (
                        <Badge variant="outline" className="text-xs">
                          +{activity.points} pts
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
