import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { Layout } from "@/components/Layout";
import { ProfileProvider } from "@/context/ProfileContext";
import { LandingPage } from "@/pages/LandingPage";

const ProfilePage = lazy(() =>
  import("@/pages/ProfilePage").then((m) => ({ default: m.ProfilePage })),
);
const JourneyPage = lazy(() =>
  import("@/pages/JourneyPage").then((m) => ({ default: m.JourneyPage })),
);
const SimulationPage = lazy(() =>
  import("@/pages/SimulationPage").then((m) => ({ default: m.SimulationPage })),
);
const AssistantPage = lazy(() =>
  import("@/pages/AssistantPage").then((m) => ({ default: m.AssistantPage })),
);
const ReadinessPage = lazy(() =>
  import("@/pages/ReadinessPage").then((m) => ({ default: m.ReadinessPage })),
);
const BoothPage = lazy(() => import("@/pages/BoothPage").then((m) => ({ default: m.BoothPage })));

function PageFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
      Loading experience…
    </div>
  );
}

export default function App() {
  return (
    <ProfileProvider>
      <BrowserRouter>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route element={<Layout />}>
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/journey" element={<JourneyPage />} />
              <Route path="/simulation" element={<SimulationPage />} />
              <Route path="/assistant" element={<AssistantPage />} />
              <Route path="/readiness" element={<ReadinessPage />} />
              <Route path="/booth" element={<BoothPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ProfileProvider>
  );
}
