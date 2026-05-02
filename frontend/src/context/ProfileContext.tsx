import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { UserProfilePayload } from "@/lib/api";

const STORAGE_KEY = "votewise_profile_v1";

type ProfileState = UserProfilePayload & { profile_id?: string | null };

const defaultProfile: ProfileState = {
  age: 21,
  first_time_voter: true,
  is_nri: false,
  preferred_language: "en",
  moved_city: false,
};

type ProfileContextValue = {
  profile: ProfileState;
  setProfile: (p: Partial<ProfileState>) => void;
  resetProfile: () => void;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<ProfileState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...defaultProfile, ...JSON.parse(raw) };
    } catch {
      /* ignore */
    }
    return defaultProfile;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      /* ignore */
    }
  }, [profile]);

  const setProfile = useCallback((p: Partial<ProfileState>) => {
    setProfileState((prev) => ({ ...prev, ...p }));
  }, []);

  const resetProfile = useCallback(() => setProfileState(defaultProfile), []);

  const value = useMemo(
    () => ({ profile, setProfile, resetProfile }),
    [profile, setProfile, resetProfile],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}
