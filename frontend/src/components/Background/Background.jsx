import { motion } from "framer-motion";

export default function Background() {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden bg-[#04070F]">

      <motion.div
        animate={{
          x: [0, 140, 0],
          y: [0, -120, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 20,
          ease: "easeInOut",
        }}
        className="absolute left-[-250px] top-[-250px] h-[800px] w-[800px] rounded-full bg-blue-500/20 blur-[180px]"
      />

      <motion.div
        animate={{
          x: [0, -150, 0],
          y: [0, 150, 0],
          scale: [1, 1.25, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 24,
          ease: "easeInOut",
        }}
        className="absolute right-[-300px] bottom-[-300px] h-[900px] w-[900px] rounded-full bg-violet-600/20 blur-[220px]"
      />

      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [.4,.8,.4],
        }}
        transition={{
          repeat: Infinity,
          duration: 12,
        }}
        className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-[180px]"
      />

      <div
      className="absolute inset-0 opacity-[0.04]"
      style={{
        backgroundImage:
          "radial-gradient(circle at center, white 1px, transparent 1px)",
        backgroundSize: "30px 30px",
      }}
      />

    </div>
  );
}