import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck } from "lucide-react";

export default function LoadingOverlay({ loading, progress }) {
  const percentage = progress?.total ? Math.round((progress.completed / progress.total) * 100) : 0;
  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/60 backdrop-blur-2xl"
        >
          <div className="flex flex-col items-center">

            {/* Shield */}

            <motion.div
              animate={{
                scale: [1, 1.08, 1],
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut",
              }}
              className="
                flex
                h-28
                w-28
                items-center
                justify-center

                rounded-full

                bg-black

                text-white

                shadow-2xl
              "
            >
              <ShieldCheck size={48} strokeWidth={2.2} />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10 text-2xl font-semibold"
            >
              {progress?.stage || "Analyzing domain..."}
            </motion.h2>

            <p className="mt-2 text-neutral-500">
              {progress?.total ? `${progress.completed} of ${progress.total} security checks complete` : "Initializing intelligence engine"}
            </p>
            <div className="mt-6 h-1.5 w-64 overflow-hidden rounded-full bg-neutral-200"><motion.div className="h-full rounded-full bg-black" animate={{ width: `${percentage}%` }} transition={{ duration: 0.35 }} /></div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
