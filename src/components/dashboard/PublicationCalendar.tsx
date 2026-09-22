"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  X,
  Plus,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Carousel } from "@/types/carousel";

interface PublicationCalendarProps {
  carousels: Carousel[];
  onUpdateSchedule: (carouselId: string, scheduledFor: string | null) => Promise<void>;
  onAutoScheduleNextDays: () => Promise<void>;
}

const DAYS_OF_WEEK = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTH_NAMES = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

function formatDateKey(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

export function PublicationCalendar({
  carousels,
  onUpdateSchedule,
  onAutoScheduleNextDays,
}: PublicationCalendarProps) {
  const router = useRouter();
  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(
    () => formatDateKey(today.getFullYear(), today.getMonth(), today.getDate()),
    [today]
  );

  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
  const [dragOverDayKey, setDragOverDayKey] = useState<string | null>(null);
  const [isAutoScheduling, setIsAutoScheduling] = useState(false);

  // Month navigation
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const jumpToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  // Map carousels by scheduled date
  const scheduledMap = useMemo(() => {
    const map = new Map<string, Carousel[]>();
    for (const c of carousels) {
      if (c.scheduledFor) {
        // Normalize YYYY-MM-DD
        const dateKey = c.scheduledFor.slice(0, 10);
        const existing = map.get(dateKey) || [];
        existing.push(c);
        map.set(dateKey, existing);
      }
    }
    return map;
  }, [carousels]);

  // Unscheduled drafts
  const unscheduledCarousels = useMemo(() => {
    return carousels.filter((c) => !c.scheduledFor);
  }, [carousels]);

  // Calendar cells generation for Monday-first layout
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    // Monday as 0: (day + 6) % 7
    const startOffset = (firstDayIndex + 6) % 7;
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const days: Array<{
      dayNumber: number;
      dateKey: string;
      isCurrentMonth: boolean;
    }> = [];

    // Preceding month trailing days
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const m = currentMonth === 0 ? 11 : currentMonth - 1;
      const y = currentMonth === 0 ? currentYear - 1 : currentYear;
      days.push({
        dayNumber: d,
        dateKey: formatDateKey(y, m, d),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({
        dayNumber: d,
        dateKey: formatDateKey(currentYear, currentMonth, d),
        isCurrentMonth: true,
      });
    }

    // Following month trailing days to complete full grid
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const m = currentMonth === 11 ? 0 : currentMonth + 1;
      const y = currentMonth === 11 ? currentYear + 1 : currentYear;
      days.push({
        dayNumber: d,
        dateKey: formatDateKey(y, m, d),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDayDragOver = (e: React.DragEvent, dateKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverDayKey !== dateKey) {
      setDragOverDayKey(dateKey);
    }
  };

  const handleDayDrop = async (e: React.DragEvent, dateKey: string) => {
    e.preventDefault();
    setDragOverDayKey(null);
    const id = e.dataTransfer.getData("text/plain");
    if (id) {
      await onUpdateSchedule(id, dateKey);
    }
  };

  const handleAutoSchedule = async () => {
    setIsAutoScheduling(true);
    try {
      await onAutoScheduleNextDays();
    } finally {
      setIsAutoScheduling(false);
    }
  };

  const selectedCarousels = selectedDayKey ? scheduledMap.get(selectedDayKey) || [] : [];

  return (
    <div className="space-y-6">
      {/* Calendar Header / Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface p-4 rounded-xl border border-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span>{MONTH_NAMES[currentMonth]} {currentYear}</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Cadence cible : 1 carrousel par jour • {carousels.filter(c => !!c.scheduledFor).length} planifiés
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={jumpToToday}
            className="text-xs h-8"
          >
            Aujourd&apos;hui
          </Button>

          <div className="flex items-center gap-1 border border-border rounded-lg p-0.5 bg-muted/30">
            <button
              onClick={prevMonth}
              className="h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted"
              aria-label="Mois précédent"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextMonth}
              className="h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted"
              aria-label="Mois suivant"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {unscheduledCarousels.length > 0 && (
            <Button
              variant="accent"
              size="sm"
              disabled={isAutoScheduling}
              onClick={handleAutoSchedule}
              className="text-xs h-8 gap-1.5 shadow-sm"
              title="Planifie automatiquement 1 carrousel par jour à partir d'aujourd'hui"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Auto-planifier (1/j)</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid: Days of Week + Month Cells */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-border bg-muted/40 text-center text-xs font-semibold text-muted-foreground py-2.5">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-border/60">
          {calendarDays.map(({ dayNumber, dateKey, isCurrentMonth }) => {
            const isToday = dateKey === todayKey;
            const items = scheduledMap.get(dateKey) || [];
            const isSelected = selectedDayKey === dateKey;
            const isDragTarget = dragOverDayKey === dateKey;

            return (
              <div
                key={dateKey}
                onDragOver={(e) => handleDayDragOver(e, dateKey)}
                onDragLeave={() => setDragOverDayKey(null)}
                onDrop={(e) => handleDayDrop(e, dateKey)}
                onClick={() => setSelectedDayKey(dateKey === selectedDayKey ? null : dateKey)}
                className={`min-h-[110px] p-2 transition-all flex flex-col justify-between group cursor-pointer relative ${
                  !isCurrentMonth ? "bg-muted/15 opacity-40 text-muted-foreground" : "bg-surface"
                } ${
                  isToday ? "ring-2 ring-inset ring-accent/60 bg-accent/[0.03]" : ""
                } ${
                  isSelected ? "bg-accent/10" : "hover:bg-muted/30"
                } ${
                  isDragTarget ? "ring-2 ring-inset ring-cyan-400 bg-cyan-500/20 scale-[0.99]" : ""
                }`}
              >
                {/* Date header */}
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-xs font-mono font-medium rounded-full h-5 w-5 flex items-center justify-center ${
                      isToday
                        ? "bg-accent text-accent-foreground font-bold shadow-sm"
                        : "text-foreground"
                    }`}
                  >
                    {dayNumber}
                  </span>

                  {items.length > 0 && (
                    <span className="text-[10px] font-mono text-muted-foreground font-medium">
                      {items.length} post{items.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {/* Scheduled carousels list */}
                <div className="flex-1 space-y-1 overflow-y-auto max-h-[80px] pr-0.5">
                  {items.map((item) => {
                    const isPub = item.status === "published";
                    return (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={(e) => {
                          e.stopPropagation();
                          handleDragStart(e, item.id);
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/carousel/${item.id}`);
                        }}
                        className={`text-[11px] p-1.5 rounded-md border leading-tight transition-all truncate flex items-center justify-between gap-1 group/item cursor-pointer shadow-xs ${
                          isPub
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                            : "bg-cyan-500/10 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20"
                        }`}
                        title={`${item.name} (${isPub ? "Publié" : "À publier"}) - Cliquer pour ouvrir`}
                      >
                        <div className="flex items-center gap-1 min-w-0 flex-1 truncate">
                          {isPub ? (
                            <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-400" />
                          ) : (
                            <Clock className="h-3 w-3 shrink-0 text-cyan-400" />
                          )}
                          <span className="truncate font-medium">{item.name}</span>
                        </div>

                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            await onUpdateSchedule(item.id, null);
                          }}
                          className="opacity-0 group-hover/item:opacity-100 hover:text-destructive h-3.5 w-3.5 shrink-0 flex items-center justify-center transition-opacity"
                          title="Retirer du calendrier"
                          aria-label="Retirer du calendrier"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Drop indicator / quick add on hover */}
                {isDragTarget && (
                  <div className="absolute inset-0 rounded border-2 border-dashed border-cyan-400 bg-cyan-500/20 flex items-center justify-center z-10 pointer-events-none">
                    <span className="text-xs font-bold text-cyan-300">Déposer le carrousel ici</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details or Unscheduled Queue Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Day Inspector (if selected) */}
        <div className="lg:col-span-1 bg-surface p-4 rounded-xl border border-border">
          <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-accent" />
              <span>
                {selectedDayKey
                  ? `Détails du ${new Date(selectedDayKey + "T00:00:00").toLocaleDateString("fr-FR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}`
                  : "Sélectionnez un jour"}
              </span>
            </h3>
            {selectedDayKey && (
              <button
                onClick={() => setSelectedDayKey(null)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Fermer
              </button>
            )}
          </div>

          {!selectedDayKey ? (
            <p className="text-xs text-muted-foreground leading-relaxed">
              Cliquez sur une case du calendrier pour voir en détail les carrousels prévus ce jour-là, ou glissez-y un carrousel non planifié.
            </p>
          ) : selectedCarousels.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs">Aucun carrousel planifié pour ce jour.</p>
              <p className="text-[11px] mt-1 text-muted-foreground">
                Glissez-en un depuis la liste de droite pour le programmer.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedCarousels.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-lg border border-border bg-muted/30 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold truncate">{item.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        item.status === "published"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-cyan-500/15 text-cyan-300"
                      }`}>
                        {item.status === "published" ? "Publié" : "À publier"}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {item.slides.length} slides
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/carousel/${item.id}`)}
                      className="h-7 w-7 p-0"
                      title="Ouvrir dans l'éditeur"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onUpdateSchedule(item.id, null)}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      title="Déprogrammer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Unscheduled Drafts Queue */}
        <div className="lg:col-span-2 bg-surface p-4 rounded-xl border border-border">
          <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-semibold">
                En attente de planification ({unscheduledCarousels.length})
              </h3>
            </div>
            <span className="text-[11px] text-muted-foreground">
              Glissez une carte sur un jour du calendrier
            </span>
          </div>

          {unscheduledCarousels.length === 0 ? (
            <div className="text-center py-6 text-emerald-400">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-80" />
              <p className="text-xs font-medium">Tous vos carrousels sont actuellement planifiés !</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
              {unscheduledCarousels.map((item) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.id)}
                  className="p-2.5 rounded-lg border border-border bg-muted/20 hover:bg-muted/50 hover:border-cyan-500/40 transition-all flex items-center justify-between gap-2 cursor-grab active:cursor-grabbing group shadow-xs"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate group-hover:text-cyan-300 transition-colors">
                      {item.name}
                    </p>
                    <span className="text-[10px] text-muted-foreground">
                      {item.slides.length} slides • {item.aspectRatio}
                    </span>
                  </div>

                  {/* Quick schedule today button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onUpdateSchedule(item.id, todayKey)}
                    className="h-7 text-[11px] px-2 text-cyan-400 hover:bg-cyan-500/10 shrink-0"
                    title="Planifier pour aujourd'hui"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Aujourd&apos;hui
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
