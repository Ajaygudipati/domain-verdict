import { motion } from "framer-motion";

export default function ScoreCircle({
    score,
    verdict
}) {

    const radius = 95;
    const circumference = 2 * Math.PI * radius;

    const progress = circumference - (score / 100) * circumference;

    let color = "#22c55e";

    if (verdict === "MEDIUM RISK")
        color = "#eab308";

    if (verdict === "HIGH RISK")
        color = "#ef4444";

    if (verdict === "CRITICAL") color = "#dc2626";

    return (

        <div className="relative flex justify-center">

            <svg
                width="240"
                height="240"
                className="-rotate-90"
            >

                <circle
                    cx="120"
                    cy="120"
                    r={radius}
                    stroke="#e5e7eb"
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

                <h1 className="text-6xl font-bold text-black">

                    {score}

                </h1>

                <p className="mt-2 text-neutral-500">

                    {verdict}

                </p>

            </div>

        </div>

    );

}
