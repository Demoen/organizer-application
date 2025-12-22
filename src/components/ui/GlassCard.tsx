import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "../../lib/utils";
import React from "react";

interface GlassCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    className?: string;
    variant?: "default" | "interactive";
}

export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    className,
    variant = "default",
    ...props
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
                "glass rounded-xl p-4 border border-zinc-700/50 relative overflow-hidden",
                variant === "interactive" && "hover:border-primary/50 hover:shadow-[0_0_15px_rgba(34,211,238,0.1)] transition-all cursor-pointer",
                className
            )}
            {...props}
        >
            {/* Subtle noise texture or gradient overlay could go here */}
            <div className="relative z-10">{children}</div>
        </motion.div>
    );
};
