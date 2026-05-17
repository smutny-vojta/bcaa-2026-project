import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import DateComponent from "@/shared/components/ui/date";
import TimeComponent from "@/shared/components/ui/time";
import {
  LucideArrowRight,
  LucideClock,
  LucideClockAlert,
  LucideInfo,
  LucideRoute,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col gap-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">
          Dnes - <DateComponent date={new Date()} />
        </h1>
        <Badge
          variant="default"
          className="font-bold text-base [&>svg]:size-4! h-7 gap-2"
        >
          <LucideClock />
          <TimeComponent date={new Date()} seconds={true} reactive={true} />
        </Badge>
      </div>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
          Aplikace slouží ke sledování zpoždění vlaků na konkrétních linkách.
          Než začnete zaznamenávat zpoždění, je potřeba nejdříve vytvořit linku,
          ke které záznamy patří.
        </p>

        <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
          <div className="rounded-lg border bg-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                <LucideRoute className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                  krok 1
                </p>
                <p className="text-sm font-medium">Vytvoř linku</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Linka reprezentuje konkrétní vlakové spojení – například Praha →
              Brno. Zadáš název a seznam stanic v pořadí, jak jdou za sebou.
            </p>
          </div>

          <LucideArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />

          <div className="rounded-lg border bg-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                <LucideClockAlert className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                  krok 2
                </p>
                <p className="text-sm font-medium">Přidej záznamy zpoždění</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Pro každý jízdní den pak k lince přidáš záznam – skutečné časy
              příjezdů a odjezdů na jednotlivých stanicích.
            </p>
          </div>
        </div>

        <Card className="">
          <CardContent className="flex items-start gap-2.5 rounded-md bg-muted/50">
            <LucideInfo className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Jednu linku můžeš použít opakovaně – záznamy zpoždění se přidávají
              průběžně, vždy ke stejné lince.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
