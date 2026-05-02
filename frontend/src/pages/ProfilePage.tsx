import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfile } from "@/context/ProfileContext";
import { postDecisionCheck, postProfile } from "@/lib/api";

export function ProfilePage() {
  const { profile, setProfile } = useProfile();
  const [saving, setSaving] = useState(false);
  const [decision, setDecision] = useState<Awaited<ReturnType<typeof postDecisionCheck>> | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await postProfile({
        age: profile.age,
        first_time_voter: profile.first_time_voter,
        is_nri: profile.is_nri,
        preferred_language: profile.preferred_language,
        moved_city: profile.moved_city,
      });
      setProfile({ profile_id: res.profile_id });
      const d = await postDecisionCheck({
        age: profile.age,
        is_nri: profile.is_nri,
        moved_city: !!profile.moved_city,
      });
      setDecision(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Your profile</h1>
        <p className="mt-2 text-muted-foreground">
          We personalize guidance, chat context, and decision hints from these details. Data syncs to
          Firestore when configured.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Basics</CardTitle>
          <CardDescription>Age, voter status, language, and mobility.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              min={0}
              max={120}
              value={profile.age}
              onChange={(e) => setProfile({ age: Number(e.target.value) || 0 })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lang">Preferred language code</Label>
            <Input
              id="lang"
              placeholder="en, hi, ta, te, ke, etc..."
              value={profile.preferred_language}
              onChange={(e) => setProfile({ preferred_language: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Used for Translate API round-trip on the assistant when not English.
            </p>
          </div>
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              className="size-4 rounded border-border"
              checked={profile.first_time_voter}
              onChange={(e) => setProfile({ first_time_voter: e.target.checked })}
            />
            First-time voter
          </label>
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              className="size-4 rounded border-border"
              checked={profile.is_nri}
              onChange={(e) => setProfile({ is_nri: e.target.checked })}
            />
            NRI / overseas context
          </label>
          <label className="flex items-center gap-3 text-sm sm:col-span-2">
            <input
              type="checkbox"
              className="size-4 rounded border-border"
              checked={!!profile.moved_city}
              onChange={(e) => setProfile({ moved_city: e.target.checked })}
            />
            Recently moved city / constituency may need update
          </label>
          {error && <p className="text-sm text-red-400 sm:col-span-2">{error}</p>}
          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <Button onClick={save} disabled={saving}>
              {saving ? <Loader2 className="animate-spin" /> : null}
              Save &amp; run decision check
            </Button>
            <Button asChild variant="secondary">
              <Link to="/journey">Continue to journey</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {decision && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-cyan-500/20">
            <CardHeader>
              <CardTitle>Decision intelligence</CardTitle>
              <CardDescription>
                Eligible:{" "}
                <span className={decision.eligible ? "text-emerald-400" : "text-amber-400"}>
                  {decision.eligible ? "Yes" : "No"}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                {decision.rules.map((r) => (
                  <li
                    key={r.code}
                    className="rounded-lg border border-border/60 bg-secondary/30 px-3 py-2"
                  >
                    <span className="font-medium">{r.title}</span>
                    <p className="text-muted-foreground">{r.detail}</p>
                  </li>
                ))}
              </ul>
              {decision.journey_hints.length > 0 && (
                <div>
                  <p className="text-sm font-medium">Journey hints</p>
                  <ul className="mt-1 list-disc pl-5 text-sm text-muted-foreground">
                    {decision.journey_hints.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
