import { motion } from "framer-motion";

const beamStyles = [
  "from-cyan-400/40 via-sky-500/30 to-transparent",
  "from-fuchsia-500/35 via-violet-500/25 to-transparent",
  "from-emerald-400/30 via-teal-500/25 to-transparent",
  "from-amber-400/35 via-orange-500/25 to-transparent",
];

export function PulseBeams() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(34,211,238,0.12),transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(167,139,250,0.12),transparent_50%)]" />
      <motion.div
        className="absolute -left-1/4 top-0 h-[120%] w-1/2 rotate-12 bg-gradient-to-b blur-3xl"
        animate={{ opacity: [0.35, 0.6, 0.35], x: [0, 40, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "linear-gradient(180deg, rgba(34,211,238,0.25) 0%, rgba(99,102,241,0.15) 40%, transparent 100%)",
        }}
      />
      <motion.div
        className="absolute -right-1/4 top-10 h-[110%] w-1/2 -rotate-6 bg-gradient-to-b blur-3xl"
        animate={{ opacity: [0.3, 0.55, 0.3], x: [0, -30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "linear-gradient(180deg, rgba(192,132,252,0.22) 0%, rgba(52,211,153,0.12) 45%, transparent 100%)",
        }}
      />
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className={`absolute left-0 top-0 h-full w-px bg-gradient-to-b ${beamStyles[i]} opacity-70 blur-[1px]`}
          style={{
            left: `${18 + i * 22}%`,
            transform: "rotate(12deg)",
            transformOrigin: "top center",
            height: "140%",
          }}
          animate={{
            opacity: [0.2, 0.85, 0.2],
            scaleY: [0.85, 1.05, 0.85],
          }}
          transition={{
            duration: 4 + i * 0.6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.4,
          }}
        />
      ))}
      <motion.div
        className="absolute inset-x-0 top-1/3 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent"
        animate={{ opacity: [0.2, 0.8, 0.2], scaleX: [0.9, 1, 0.9] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%224%22%20height=%224%22%3E%3Ccircle%20cx=%221%22%20cy=%221%22%20r=%221%22%20fill=%22rgba(255,255,255,0.04)%22/%3E%3C/svg%3E')] opacity-40" />
    </div>
  );
}
