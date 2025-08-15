"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createGroup } from "@/lib/firestore/groups";
import { useAuth } from "@/providers/auth-provider";
import { ArrowLeft, ArrowRight, Settings, Users } from "lucide-react";
import { redirect } from "next/navigation";
import { useState } from "react";

export default function CreateGroup() {
  const { currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [groupData, setGroupData] = useState({
    name: "",
    description: "",
    maxBets: 10,
    deadline: `${new Date().getFullYear()}-12-31`,
  });

  const handleNext = async () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else {
      await createGroup({
        ...groupData,
        creatorId: currentUser!.uid,
        deadline: new Date(groupData.deadline),
      });
      redirect("/dashboard");
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      redirect("/dashboard");
    }
  };

  const isStep1Valid =
    groupData.name.trim() !== "" && groupData.description.trim() !== "";
  const isStep2Valid = groupData.maxBets > 0 && groupData.deadline !== "";

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={handleBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {currentStep === 1 ? "Volver al Dashboard" : "Paso Anterior"}
          </Button>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep >= 1
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                1
              </div>
              <span
                className={`text-sm ${
                  currentStep >= 1 ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                Información Básica
              </span>
            </div>

            <div
              className={`h-px flex-1 ${
                currentStep >= 2 ? "bg-primary" : "bg-muted"
              }`}
            />

            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep >= 2
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                2
              </div>
              <span
                className={`text-sm ${
                  currentStep >= 2 ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                Configuración
              </span>
            </div>
          </div>
        </div>

        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <CardTitle>Información del Grupo</CardTitle>
              </div>
              <CardDescription>
                Proporciona la información básica para tu nuevo grupo de
                necroporra
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Grupo *</Label>
                <Input
                  id="name"
                  placeholder="Ej: Amigos del Barrio 2024"
                  value={groupData.name}
                  onChange={(e) =>
                    setGroupData({ ...groupData, name: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Elige un nombre único y memorable para tu grupo
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe tu grupo, las reglas especiales, o cualquier información relevante..."
                  value={groupData.description}
                  onChange={(e) =>
                    setGroupData({ ...groupData, description: e.target.value })
                  }
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Esta descripción será visible para todos los miembros del
                  grupo
                </p>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleNext} disabled={!isStep1Valid}>
                  Siguiente Paso
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Configuration */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                <CardTitle>Configuración del Juego</CardTitle>
              </div>
              <CardDescription>
                Define las reglas y límites para las apuestas en tu grupo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="maxBets">
                  Número máximo de apuestas por persona *
                </Label>
                <Input
                  id="maxBets"
                  type="number"
                  min="1"
                  max="50"
                  value={groupData.maxBets}
                  onChange={(e) =>
                    setGroupData({
                      ...groupData,
                      maxBets: Number.parseInt(e.target.value) || 0,
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Cada miembro podrá apostar por un máximo de{" "}
                  {groupData.maxBets} famosos
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">
                  Fecha límite para enviar listas *
                </Label>
                <Input
                  id="deadline"
                  type="date"
                  value={groupData.deadline}
                  disabled={true}
                />
                <p className="text-xs text-muted-foreground">
                  Los miembros tendrán hasta esta fecha para completar sus
                  listas
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Próximamente:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Restricciones de edad</li>
                  <li>
                    • Categorías especiales (deportistas, actores, políticos)
                  </li>
                  <li>• Puntuación personalizada por categorías</li>
                  <li>• Reglas de bonificación</li>
                </ul>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Paso Anterior
                </Button>
                <Button onClick={handleNext} disabled={!isStep2Valid}>
                  Crear Grupo
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
