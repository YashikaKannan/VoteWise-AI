import { motion } from "framer-motion";
import { Play, Trophy } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { postSimulation } from "@/lib/api";

export function SimulationPage() {
  const [stepId, setStepId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [choices, setChoices] = useState<{ id: string; label: string }[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    void bootstrap();
  }, []);

  async function bootstrap() {
    try {
      const res = await postSimulation({ scenario_id: "polling_day", step_id: null, choice_id: null });
      if (res.step) {
        setStepId(res.step.id);
        setPrompt(res.step.prompt);
        setChoices(res.step.choices);
      }
      setFeedback(res.feedback);
      setComplete(res.complete);
    } catch {
      setFeedback("Could not load simulation. Start the FastAPI backend on port 8000.");
      setComplete(false);
    }
  }

  async function choose(choiceId: string) {
    try {
      const res = await postSimulation({
        scenario_id: "polling_day",
        step_id: stepId,
        choice_id: choiceId,
      });
      setScore((s) => s + (res.score_delta ?? 0));
      setFeedback(res.feedback);
      setComplete(res.complete);
      if (res.step) {
        setStepId(res.step.id);
        setPrompt(res.step.prompt);
        setChoices(res.step.choices);
      } else {
        setPrompt(null);
        setChoices([]);
      }
    } catch {
      setFeedback("Simulation request failed. Check your connection and backend.");
    }
  }

  async function restart() {
    setStepId(null);
    setPrompt(null);
    setChoices([]);
    setFeedback(null);
    setComplete(false);
    setScore(0);
    await bootstrap();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Interactive simulation</h1>
        <p className="mt-2 text-muted-foreground">
          Practice polling-day decisions. The engine responds dynamically to each choice.
        </p>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="size-5 text-cyan-400" />
            Polling day scenario
          </CardTitle>
          <CardDescription>Score: {score}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {prompt && (
            <motion.p
              key={prompt}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-lg font-medium leading-snug"
            >
              {prompt}
            </motion.p>
          )}
          <div className="flex flex-col gap-2">
            {choices.map((c) => (
              <Button
                key={c.id}
                variant="secondary"
                className="h-auto justify-start whitespace-normal py-3 text-left"
                onClick={() => void choose(c.id)}
              >
                {c.label}
              </Button>
            ))}
          </div>
          {feedback && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-lg border border-border/70 bg-muted/40 px-4 py-3 text-sm text-muted-foreground"
            >
              {feedback}
            </motion.div>
          )}
          {complete && (
            <div className="flex items-center gap-2 text-emerald-400">
              <Trophy className="size-5" />
              Scenario complete
            </div>
          )}
          <Button variant="outline" onClick={() => void restart()}>
            Restart simulation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
