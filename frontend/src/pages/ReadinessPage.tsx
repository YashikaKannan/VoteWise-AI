import { motion } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";
import { useEffect, useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getChecklist, getTimeline } from "@/lib/api";

export function ReadinessPage() {
  const [timeline, setTimeline] = useState<Awaited<ReturnType<typeof getTimeline>>>([]);
  const [items, setItems] = useState<Awaited<ReturnType<typeof getChecklist>>>([]);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    void Promise.all([getTimeline(), getChecklist()]).then(([t, c]) => {
      setTimeline(t);
      setItems(c);
    });
  }, []);

  function toggle(id: string) {
    setChecked((c) => ({ ...c, [id]: !c[id] }));
  }

  const done = items.filter((i) => checked[i.id]).length;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl font-bold">Am I ready to vote?</h1>
        <p className="mt-2 text-muted-foreground">
          Track phases on a horizontal timeline and complete your readiness checklist.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Election timeline</CardTitle>
          <CardDescription>High-level phases — dates vary by election schedule.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto pb-2">
          <div className="flex min-w-[640px] gap-4">
            {timeline.map((phase, idx) => (
              <motion.div
                key={phase.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="relative flex-1 rounded-xl border border-border/70 bg-secondary/30 p-4"
              >
                {idx < timeline.length - 1 && (
                  <div className="absolute right-[-10px] top-1/2 hidden h-0.5 w-4 -translate-y-1/2 bg-gradient-to-r from-cyan-500/50 to-transparent md:block" />
                )}
                <p className="text-xs uppercase tracking-wide text-cyan-300/90">{phase.status}</p>
                <p className="mt-1 font-display font-semibold">{phase.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{phase.description}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Readiness checklist</CardTitle>
          <CardDescription>
            {done}/{items.length} complete
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((it) => (
            <button
              key={it.id}
              type="button"
              onClick={() => toggle(it.id)}
              className="flex w-full items-start gap-3 rounded-lg border border-border/60 bg-muted/20 p-4 text-left transition-colors hover:bg-muted/40"
            >
              {checked[it.id] ? (
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-400" />
              ) : (
                <Circle className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
              )}
              <span>
                <span className="font-medium">{it.label}</span>
                <p className="text-sm text-muted-foreground">{it.hint}</p>
              </span>
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
