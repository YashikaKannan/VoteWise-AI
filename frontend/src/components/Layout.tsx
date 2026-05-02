import { motion } from "framer-motion";
import { NavLink, Outlet } from "react-router-dom";

import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Home" },
  { to: "/profile", label: "Profile" },
  { to: "/journey", label: "Journey" },
  { to: "/simulation", label: "Simulation" },
  { to: "/assistant", label: "Assistant" },
  { to: "/readiness", label: "Readiness" },
  { to: "/booth", label: "Booth Map" },
];

export function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <NavLink to="/" className="font-display text-lg font-bold tracking-tight text-foreground">
            VoteWise <span className="text-primary">AI</span>
          </NavLink>
          <nav className="flex max-w-[70vw] flex-nowrap items-center justify-end gap-1 overflow-x-auto md:max-w-none">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                    isActive && "bg-muted/80 text-foreground",
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <motion.main
        className="mx-auto max-w-6xl px-4 py-8"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Outlet />
      </motion.main>
    </div>
  );
}
