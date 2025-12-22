import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "../../lib/utils";
import React from "react";

interface NeonButtonProps extends HTMLMotionProps<"button"> {
    children: React.ReactNode;
    className?: string;
    variant?: "primary" | "secondary" | "danger" | "ghost";
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
}

export const NeonButton: React.FC<NeonButtonProps> = ({
    children,
    className,
    variant = "primary",
    size = "md",
    disabled,
    ...props
}) => {
    const variants = {
        primary: "bg-primary/10 border-primary/50 text-white hover:bg-primary/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]",
        secondary: "bg-surface border-zinc-600 text-zinc-300 hover:border-zinc-400 hover:text-white",
        danger: "bg-danger/10 border-danger/50 text-danger hover:bg-danger/20 hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]",
        ghost: "bg-transparent border-transparent text-zinc-400 hover:text-white"
    };

    const sizes = {
        sm: "px-3 py-1 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base"
    };

    return (
        <motion.button
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            disabled={disabled}
            className={cn(
                "relative rounded-lg border font-medium flex items-center justify-center gap-2 transition-all duration-300",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {children}
            {/* Inner glow effect for primary */}
            {variant === "primary" && !disabled && (
                <div className="absolute inset-0 rounded-lg bg-primary/5 blur-md opacity-0 hover:opacity-100 transition-opacity" />
            )}
        </motion.button>
    );
};
