"use client";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import type { HTMLAttributes, ReactNode } from "react";
import { useState } from "react";

export const ShinyRotatingBorderButton = ({
	children,
	className,
	...props
}: Readonly<{ children: ReactNode; className?: string }> &
	HTMLAttributes<HTMLButtonElement>) => {
	const [isActive, setIsActive] = useState(false);
	return (
		<button
			className={cn(
				"group relative overflow-hidden rounded-full bg-neutral-200 p-px transition-transform active:scale-95 dark:bg-neutral-600",
				"text-sm",
				className,
			)}
			type="button"
			{...props}
			onMouseEnter={() => setIsActive(true)}
			onMouseLeave={() => setIsActive(false)}
			onMouseDown={() => setIsActive(true)}
			onMouseUp={() => setIsActive(false)}
		>
			<motion.span
				animate={isActive ? {
					top: ["50%", "0%", "50%", "100%", "50%"],
					left: ["0%", "50%", "100%", "50%", "0%"],
				} : {
					top: "50%",
					left: "0%",
				}}
				className={`-translate-x-1/2 -translate-y-1/2 absolute z-10 size-6 transform-gpu blur-sm transition-transform duration-300 group-hover:scale-[3] ${isActive ? "opacity-100" : "opacity-0"}`}
				initial={{ top: 0, left: 0 }}
				transition={isActive ? {
					duration: 3,
					ease: "linear",
					repeat: Number.POSITIVE_INFINITY,
				} : { duration: 0 }}
			>
				<motion.span
					animate={isActive ? {
						rotate: ["0deg", "360deg"],
					} : { rotate: "0deg" }}
					className="block size-full transform-gpu rounded-full"
					style={{
						background:
							isActive ? "linear-gradient(135deg, #3BC4F2, #7A69F9, #F26378, #F5833F)" : "transparent",
					}}
					transition={isActive ? {
						duration: 3,
						ease: "linear",
						repeat: Number.POSITIVE_INFINITY,
					} : { duration: 0 }}
				/>
			</motion.span>
			<span className="relative z-10 block rounded-full bg-white px-3 py-1.5 dark:bg-neutral-800">
				<motion.span
					animate={isActive ? {
						backgroundImage: [
							"linear-gradient(90deg, #3BC4F2, #7A69F9, #F26378, #F5833F)",
							"linear-gradient(90deg, #F5833F,#3BC4F2, #7A69F9, #F26378)",
							"linear-gradient(90deg, #F26378, #F5833F,#3BC4F2, #7A69F9)",
							"linear-gradient(90deg, #7A69F9, #F26378, #F5833F,#3BC4F2)",
							"linear-gradient(90deg, #3BC4F2, #7A69F9, #F26378, #F5833F)",
						],
					} : {
						backgroundImage: "linear-gradient(90deg, #3BC4F2, #7A69F9, #F26378, #F5833F)",
					}}
					className="block transform-gpu bg-clip-text font-semibold text-black transition-colors duration-500 group-hover:text-transparent dark:text-white"
					transition={isActive ? {
						duration: 1,
						ease: "linear",
						repeat: Number.POSITIVE_INFINITY,
					} : { duration: 0 }}
				>
					{children}
				</motion.span>
			</span>
		</button>
	);
};
