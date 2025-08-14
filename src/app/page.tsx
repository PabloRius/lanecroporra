import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { StartLink } from "@/components/start-link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Calendar, Users } from "lucide-react";

export default function Home() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Warning Banner */}
        <div className="max-w-4xl mx-auto mb-6 sm:mb-8 px-4">
          <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950/50">
            <CardContent className="flex items-start sm:items-center gap-3 p-4">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5 sm:mt-0" />
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Advertencia:</strong> Este juego trata temas sensibles.
                Es solo entretenimiento entre amigos y no pretende faltar al
                respeto a nadie.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto grid gap-6 lg:gap-8 mb-8 sm:mb-12 px-4">
          <div className="space-y-6">
            <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <CardHeader>
                <CardTitle className="text-black dark:text-white flex items-center gap-2 text-lg sm:text-xl">
                  <Calendar className="h-5 w-5" />
                  ¿Qué es la Necroporra?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 dark:text-gray-300 space-y-4 text-sm sm:text-base">
                <p>
                  La necroporra es un juego anual que se ha vuelto viral en
                  España. Cada participante crea una lista de personas famosas
                  cerca del 31 de diciembre para el año siguiente.
                </p>
                <p>
                  Durante el año, si alguna persona de tu lista fallece por
                  causas naturales, ganas puntos. Al final del año, quien tenga
                  más puntos gana el premio acordado por el grupo.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <CardHeader>
                <CardTitle className="text-black dark:text-white flex items-center gap-2 text-lg sm:text-xl">
                  <Users className="h-5 w-5" />
                  ¿Cómo funciona?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 dark:text-gray-300 space-y-3 text-sm sm:text-base">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Badge variant="secondary" className="mt-0.5 flex-shrink-0">
                      1
                    </Badge>
                    <span>Crea o únete a una party con tus amigos</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge variant="secondary" className="mt-0.5 flex-shrink-0">
                      2
                    </Badge>
                    <span>
                      Cada uno hace su lista de famosos siguiendo las reglas
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge variant="secondary" className="mt-0.5 flex-shrink-0">
                      3
                    </Badge>
                    <span>
                      Durante el año, el sistema detecta automáticamente los
                      fallecimientos
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge variant="secondary" className="mt-0.5 flex-shrink-0">
                      4
                    </Badge>
                    <span>Al final del año, se corona al ganador</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center px-4">
          <Card className="max-w-md mx-auto border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <CardContent className="p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-bold text-black dark:text-white mb-4">
                ¿Listo para el reto?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm sm:text-base">
                Únete a miles de españoles en el reto más controvertido del año
              </p>
              <StartLink />
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
