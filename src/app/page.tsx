import { Header } from "@/components/header";
import { StartLink } from "@/components/start-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  Code2,
  Github,
  Globe,
  Heart,
  Linkedin,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <Header />

      <main className="container mx-auto px-4 pt-12 pb-24 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16 space-y-6">
          <Badge
            variant="outline"
            className="py-1 px-4 border-primary/20 bg-primary/5 text-primary animate-pulse"
          >
            <Sparkles className="w-3 h-3 mr-2" />
            Edición 2026 ya disponible
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight font-serif lg:leading-[1.1]">
            La Necroporra <br />
            <span className="text-primary bg-clip-text bg-gradient-to-r from-primary to-blue-600">
              El juego del destino.
            </span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Crea tu lista de famosos antes del 31 de diciembre y compite con tus
            amigos. Detección automática de fallecimientos mediante Wikidata
            API.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <StartLink />
            <Button
              variant="outline"
              asChild
              className="h-11 px-8 rounded-full"
            >
              <Link
                href="https://github.com/PabloRius/lanecroporra"
                target="_blank"
              >
                <Github className="w-4 h-4 mr-2" />
                Colaborar en GitHub
              </Link>
            </Button>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="relative group overflow-hidden rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 p-6 transition-all hover:shadow-md">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-amber-900 dark:text-amber-200">
                  Aviso Legal & Ético
                </h4>
                <p className="text-sm text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
                  Este proyecto es un experimento social y tecnológico. Se basa
                  en una tradición popular de internet y no pretende desear el
                  mal ni faltar al respeto. Todo el contenido es generado de
                  forma automática a través de datos públicos.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid gap-8 md:grid-cols-2 mb-20">
          <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 transition-transform hover:-translate-y-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl font-serif">
                <Calendar className="h-6 w-6 text-primary" />
                Tradición Anual
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                Cada 31 de diciembre, grupos de amigos en toda España cierran
                sus listas. Es el &quot;Draft&quot; de la vida real. Una vez
                activado el grupo, las listas se bloquean.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" /> Listas
                  privadas hasta el cierre
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" /> Sistema de
                  puntos por edad
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 transition-transform hover:-translate-y-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl font-serif">
                <Users className="h-6 w-6 text-primary" />
                ¿Cómo participar?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                {[
                  { step: 1, text: "Crea tu grupo personalizado" },
                  { step: 2, text: "Invita a tus amigos con el link mágico" },
                  {
                    step: 3,
                    text: "Busca famosos con nuestro motor de Wikidata",
                  },
                  {
                    step: 4,
                    text: "Relájate. Nosotros vigilamos las noticias",
                  },
                ].map((item) => (
                  <div
                    key={item.step}
                    className="flex items-center gap-4 group"
                  >
                    <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold group-hover:bg-primary group-hover:text-white transition-colors">
                      {item.step}
                    </span>
                    <span className="text-muted-foreground font-medium">
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Open Source / Collaboration */}
        <div className="max-w-4xl mx-auto mb-24 p-8 rounded-3xl bg-slate-900 text-slate-50 dark:bg-white dark:text-slate-900">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 space-y-4 text-center md:text-left">
              <h3 className="text-2xl font-bold flex items-center justify-center md:justify-start gap-2">
                <Code2 className="w-6 h-6" /> Open Source
              </h3>
              <p className="opacity-80 leading-relaxed">
                Este proyecto está construido con Next.js 15, Tailwind CSS y
                Firebase. Si eres desarrollador, tus PRs son bienvenidos para
                mejorar la experiencia del usuario.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <Badge
                  variant="secondary"
                  className="dark:bg-purple-800/80 bg-slate-100"
                >
                  React
                </Badge>
                <Badge
                  variant="secondary"
                  className="dark:bg-purple-800/80 bg-slate-100"
                >
                  Firebase
                </Badge>
                <Badge
                  variant="secondary"
                  className="dark:bg-purple-800/80 bg-slate-100"
                >
                  TypeScript
                </Badge>
              </div>
            </div>
            <Button
              size="lg"
              variant="secondary"
              asChild
              className="rounded-full shadow-lg"
            >
              <Link
                href="https://github.com/PabloRius/lanecroporra"
                target="_blank"
              >
                Ver Repositorio <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer Personalizado */}
      <footer className="border-t bg-white dark:bg-slate-950 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-xl font-serif font-bold tracking-tight">
                La Necroporra
              </h2>
              <p className="text-sm text-muted-foreground flex items-center justify-center md:justify-start">
                Hecho con{" "}
                <Heart className="w-3 h-3 mx-1 text-red-500 fill-red-500" /> por
                Pablo García Rius
              </p>
            </div>

            <div className="flex items-center gap-6">
              <Link
                href="https://github.com/PabloRius"
                rel="noopener noreferrer"
                target="_blank"
                className="text-muted-foreground hover:text-black dark:hover:text-white transition-colors"
              >
                <Github className="w-5 h-5" />
              </Link>
              <Link
                href="https://linkedin.com/in/pablo-rius"
                rel="noopener noreferrer"
                target="_blank"
                className="text-muted-foreground hover:text-[#0077B5] transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </Link>
              <Link
                href="https://pablogrius.com/"
                rel="noopener noreferrer"
                target="_blank"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Globe className="w-5 h-5" />
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 w-full border-t text-center text-xs text-muted-foreground uppercase tracking-widest">
            © 2026 Necroporra Project • Todos los derechos reservados
          </div>
        </div>
      </footer>
    </div>
  );
}

// Componente auxiliar
function CheckCircle(props: { className: string }) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
