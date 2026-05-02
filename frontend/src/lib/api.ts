const API_BASE = import.meta.env.VITE_API_BASE ?? "";

export type UserProfilePayload = {
  age: number;
  first_time_voter: boolean;
  is_nri: boolean;
  preferred_language: string;
  moved_city?: boolean;
};

export type ChatMessage = { role: "user" | "assistant"; content: string };

export async function postProfile(profile: UserProfilePayload) {
  const r = await fetch(`${API_BASE}/user/profile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<{ ok: boolean; profile_id: string | null; message: string }>;
}

export async function postDecisionCheck(body: {
  age: number;
  is_nri: boolean;
  moved_city: boolean;
}) {
  const r = await fetch(`${API_BASE}/decision/check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<{
    eligible: boolean;
    rules: { code: string; title: string; detail: string; severity: string }[];
    next_actions: string[];
    journey_hints: string[];
  }>;
}

export async function postChat(body: {
  message: string;
  eli5?: boolean;
  profile?: UserProfilePayload | null;
  history?: ChatMessage[];
  source_language?: string | null;
}) {
  const r = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<{ reply: string; cached: boolean }>;
}

export async function postSimulation(body: {
  scenario_id: string;
  step_id?: string | null;
  choice_id?: string | null;
}) {
  const r = await fetch(`${API_BASE}/simulation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<{
    scenario_id: string;
    step: {
      id: string;
      prompt: string;
      choices: { id: string; label: string }[];
    } | null;
    feedback: string | null;
    complete: boolean;
    score_delta: number;
  }>;
}

export async function getTimeline() {
  const r = await fetch(`${API_BASE}/timeline`);
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<
    { id: string; title: string; description: string; status: string }[]
  >;
}

export async function getChecklist() {
  const r = await fetch(`${API_BASE}/checklist`);
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<{ id: string; label: string; hint: string }[]>;
}

export async function getHealth() {
  const r = await fetch(`${API_BASE}/health`);
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<{ status: string; services: Record<string, string> }>;
}
