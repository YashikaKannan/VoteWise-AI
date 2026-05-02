import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { PulseBeams } from "@/components/ui/pulse-beams";
import { Button } from "@/components/ui/button";

export function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <header className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-6 py-5">
        <span className="font-display text-lg font-bold text-white">
          VoteWise <span className="text-cyan-400">AI</span>
        </span>
        <nav className="flex gap-3 text-sm">
          <Link className="text-slate-300 hover:text-white" to="/journey">
            Journey
          </Link>
          <Link className="text-slate-300 hover:text-white" to="/assistant">
            Assistant
          </Link>
          <Link className="text-slate-300 hover:text-white" to="/profile">
            Profile
          </Link>
        </nav>
      </header>
      <PulseBeams />
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-medium text-cyan-200"
        >
          <Sparkles className="size-3.5" />
          Intelligent Election Companion
        </motion.div>
        <motion.h1
          className="font-display max-w-4xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          VoteWise AI
          <span className="mt-2 block bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400 bg-clip-text text-transparent">
            Learn. Prepare. Vote with confidence.
          </span>
        </motion.h1>
        <motion.p
          className="mt-6 max-w-2xl text-base text-slate-300 sm:text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.6 }}
        >
          A guided journey, decision intelligence, interactive simulations, and a context-aware assistant
          — built for first-time voters, NRIs, and anyone navigating India&apos;s electoral process.
        </motion.p>
        <motion.div
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Button
            asChild
            size="lg"
            className="rounded-full px-8 text-base shadow-[0_0_40px_-10px_rgba(34,211,238,0.6)]"
          >
            <Link to="/profile">
              Start Your Voting Journey
              <ArrowRight className="size-5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full border-cyan-500/40 bg-black/20">
            <Link to="/journey">Explore guided steps</Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
