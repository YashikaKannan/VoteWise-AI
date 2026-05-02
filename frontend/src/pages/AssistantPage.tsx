import { motion } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProfile } from "@/context/ProfileContext";
import { postChat, type ChatMessage } from "@/lib/api";

export function AssistantPage() {
  const { profile } = useProfile();
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [mode, setMode] = useState<"standard" | "eli5">("standard");
  const [busy, setBusy] = useState(false);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setBusy(true);
    const userMsg: ChatMessage = { role: "user", content: text };
    const nextHistory = [...history, userMsg];
    setHistory(nextHistory);
    setInput("");
    try {
      const res = await postChat({
        message: text,
        eli5: mode === "eli5",
        profile,
        history: nextHistory.slice(-10),
        source_language:
          profile.preferred_language && profile.preferred_language !== "en"
            ? profile.preferred_language
            : null,
      });
      setHistory((h) => [...h, { role: "assistant", content: res.reply }]);
    } catch {
      setHistory((h) => [
        ...h,
        {
          role: "assistant",
          content: "Request failed. Ensure the FastAPI server is running on port 8000.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">AI assistant</h1>
        <p className="mt-2 text-muted-foreground">
          Context-aware help using your profile and recent messages. ELI5 mode simplifies answers.
          Non-English input is translated via Google Translate when configured.
        </p>
      </div>

      <Card className="min-h-[420px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-violet-400" />
            Chat
          </CardTitle>
          <CardDescription>Powered by Gemini on the backend with response caching.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={mode} onValueChange={(v) => setMode(v as "standard" | "eli5")}>
            <TabsList>
              <TabsTrigger value="standard">Standard</TabsTrigger>
              <TabsTrigger value="eli5">ELI5</TabsTrigger>
            </TabsList>
            <TabsContent value={mode} className="mt-4" />
          </Tabs>

          <div className="max-h-72 space-y-3 overflow-y-auto rounded-lg border border-border/60 bg-secondary/20 p-3">
            {history.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Ask about registration, EPIC, polling booths, or EVM/VVPAT basics.
              </p>
            )}
            {history.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className={
                  m.role === "user"
                    ? "ml-8 rounded-lg bg-primary/15 px-3 py-2 text-sm"
                    : "mr-8 rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground"
                }
              >
                {m.content}
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="msg">Message</Label>
              <Input
                id="msg"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void send()}
                placeholder="Type your question..."
              />
            </div>
            <Button onClick={() => void send()} disabled={busy} className="gap-2 sm:mb-0.5">
              <Send className="size-4" />
              Send
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
