import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ChevronRight, Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useProfile } from "@/context/ProfileContext";
import { postChat } from "@/lib/api";
import ReactMarkdown from "react-markdown";

const STEPS = [
  {
    id: "registration",
    title: "Voter Registration",
    summary:
      "Apply on the ECI portal or with your BLO using the prescribed form. Keep proof of age and residence handy.",
  },
  {
    id: "verification",
    title: "Voter ID Verification",
    summary:
      "Confirm your EPIC details and spelling on the electoral roll. Note your part number and serial number if needed.",
  },
  {
    id: "booth",
    title: "Find Polling Booth",
    summary:
      "Locate your assigned polling station via the official booth locator. Plan travel and timing for polling day.",
  },
  {
    id: "prep",
    title: "Voting Preparation",
    summary:
      "Carry permitted ID, know prohibited items, and understand how EVM/VVPAT flow works at the station.",
  },
  {
    id: "cast",
    title: "Casting Vote",
    summary:
      "Queue calmly, verify your identity, cast your vote privately, and confirm VVPAT as per official instructions.",
  },
];

export function JourneyPage() {
  const { profile } = useProfile();
  const [index, setIndex] = useState(0);
  const [explain, setExplain] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const step = STEPS[index];
  const pct = Math.round(((index + 1) / STEPS.length) * 100);

  async function explainSimply() {
    console.log("LANG BEFORE CALL:", profile.preferred_language);
    setLoading(true);
    setExplain(null);
    try {
      const msg = `Explain simply (for this journey step: "${step.title}"): ${step.summary}`;
      console.log("LANG:", profile.preferred_language);
      const res = await postChat({
        message: msg,
        eli5: true,
        profile,
        history: [],
        source_language:
          profile.preferred_language && profile.preferred_language !== "en"
            ? profile.preferred_language
            : null,
      });
      setExplain(res.reply);
    } catch {
      setExplain("Could not reach the assistant. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Guided election journey</h1>
        <p className="mt-2 text-muted-foreground">
          Step-by-step flow with progress, next actions, and optional ELI5 explanations powered by Gemini.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Step {index + 1} of {STEPS.length}
          </span>
          <span>{pct}%</span>
        </div>
        <Progress value={pct} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.25 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>{step.title}</CardTitle>
              <CardDescription>{step.summary}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button
                variant="secondary"
                onClick={explainSimply}
                disabled={loading}
                className="gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : <BookOpen className="size-4" />}
                Explain simply
              </Button>
              <Button
                onClick={() => setIndex((i) => Math.min(STEPS.length - 1, i + 1))}
                disabled={index >= STEPS.length - 1}
                className="gap-2"
              >
                Next step
                <ChevronRight className="size-4" />
              </Button>
              <Button variant="outline" onClick={() => setIndex((i) => Math.max(0, i - 1))}>
                Back
              </Button>
            </CardContent>
            {explain && (
  <CardContent className="border-t border-border/60 pt-4">
    <div className="ai-response text-sm text-muted-foreground">
      <ReactMarkdown
        components={{
          p: ({node, ...props}) => <p className="mb-2" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc pl-5" {...props} />,
        }}
      >
        {explain}
      </ReactMarkdown>
    </div>
  </CardContent>
)}
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
