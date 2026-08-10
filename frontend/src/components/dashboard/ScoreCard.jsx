import { motion } from "framer-motion";

export default function ScoreCircle({
    score,
    verdict
}) {

    const radius = 95;
    const circumference = 2 * Math.PI * radius;

    const progress = circumference - (score / 100) * circumference;

    const label = String(verdict || "").toLowerCase();
    const color = label.includes("critical") || label.includes("high") ? "#ff5b68" : label.includes("medium") ? "#ffbd45" : "var(--neon)";

    return (

        <div className="terminal-score relative flex justify-center">

            <svg
                width="240"
                height="240"
                className="-rotate-90"
            >

                <circle
                    cx="120"
                    cy="120"
                    r={radius}
                    stroke="rgba(255,255,255,.10)"
                    strokeWidth="10"
                    fill="transparent"
                />

                <motion.circle
                    cx="120"
                    cy="120"
                    r={radius}
                    stroke={color}
                    strokeWidth="10"
                    fill="transparent"
                    strokeLinecap="round"

                    strokeDasharray={circumference}

                    initial={{
                        strokeDashoffset: circumference
                    }}

                    animate={{
                        strokeDashoffset: progress
                    }}

                    transition={{
                        duration: 1.5
                    }}
                />

            </svg>

            <div className="absolute flex h-[240px] w-[240px] flex-col items-center justify-center">

                <h1 className="font-mono text-6xl font-bold text-white">

                    {score}

                </h1>

                <p className="mt-2 font-mono text-xs font-bold tracking-[.16em] text-slate-400">

                    {verdict}

                </p>

            </div>

        </div>

    );

}
