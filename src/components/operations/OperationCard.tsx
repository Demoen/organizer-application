import { motion } from "framer-motion";
import { FolderInput, FileOutput, Trash2, Ban, ArrowRight, ChevronDown, File, Folder, Rocket, Sparkles, Scale, FileType, Info, X } from "lucide-react";
import { useState } from "react";
import { GlassCard } from "../ui/GlassCard";
import { cn } from "../../lib/utils";

import type { Operation } from "../../types";

interface OperationCardProps {
    operation: Operation;
    index: number;
    onRemove?: () => void;
}

export const OperationCard: React.FC<OperationCardProps> = ({ operation, index, onRemove }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const getIcon = () => {
        switch (operation.op_type) {
            case "Move": return <FolderInput className="text-white" size={20} />;
            case "Delete": return <Trash2 className="text-red-500" size={20} />;
            case "Ignore": return <Ban className="text-zinc-500" size={20} />;
            default: return <FileOutput className="text-zinc-400" size={20} />;
        }
    };

    const getBadgeColor = () => {
        switch (operation.op_type) {
            case "Move": return "bg-white/10 text-white border-white/20";
            case "Delete": return "bg-red-500/10 text-red-400 border-red-500/20";
            default: return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
        }
    };

    const getReasonDetails = (reason: string) => {
        if (reason.startsWith("Project detected:")) {
            return { icon: Rocket, label: reason.replace("Project detected:", "").trim() };
        }
        if (reason.includes("AI Rename")) {
            return { icon: Sparkles, label: reason.replace("Project detected:", "").trim() }; // Keep it simple or clean up further
        }
        if (reason.startsWith("Rule:")) {
            return { icon: Scale, label: reason.replace("Rule:", "").trim() };
        }
        if (reason.startsWith("Extension:")) {
            return { icon: FileType, label: reason.replace("Extension:", "").trim() };
        }
        return { icon: Info, label: reason };
    };

    const { icon: ReasonIcon, label: reasonLabel } = getReasonDetails(operation.reason);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <GlassCard
                variant="interactive"
                className="group p-0 overflow-visible"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="p-4 flex items-center gap-4">
                    {/* Icon Box */}
                    <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center border border-zinc-700 group-hover:border-primary/30 transition-colors">
                        {getIcon()}
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0 grid grid-cols-12 gap-4 items-center">
                        {/* Source */}
                        <div className="col-span-4 flex flex-col min-w-0">
                            <span className="text-xs text-zinc-500 mb-0.5">Source</span>
                            <div className="flex items-center gap-2 text-sm font-medium text-zinc-200 truncate">
                                <File size={14} className="opacity-50" />
                                <span className="truncate" title={operation.source}>
                                    {operation.source ? operation.source.split(/[\\/]/).pop() : "N/A"}
                                </span>
                            </div>
                        </div>

                        {/* Arrow */}
                        <div className="col-span-1 flex justify-center">
                            <ArrowRight size={16} className="text-zinc-600 group-hover:text-primary transition-colors" />
                        </div>

                        {/* Destination */}
                        <div className="col-span-4 flex flex-col min-w-0">
                            <span className="text-xs text-zinc-500 mb-0.5">Destination</span>
                            <div className="flex items-center gap-2 text-sm font-medium text-zinc-200 truncate">
                                <Folder size={14} className="opacity-50" />
                                <span className="truncate" title={operation.destination}>
                                    {operation.destination.split(/[\\/]/).slice(-2).join("/")}
                                </span>
                            </div>
                        </div>

                        {/* Reason Pill */}
                        <div className="col-span-3 flex justify-end">
                            <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium border uppercase tracking-wider flex items-center gap-1.5", getBadgeColor())}>
                                <ReasonIcon size={12} strokeWidth={2.5} />
                                <span className="truncate max-w-[120px]" title={reasonLabel}>{reasonLabel}</span>
                            </span>
                        </div>
                    </div>

                    {/* Remove Button */}
                    {onRemove && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove();
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                            title="Remove operation"
                        >
                            <X size={16} className="text-red-400 hover:text-red-300 transition-colors" />
                        </button>
                    )}

                    {/* Chevron */}
                    <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        className="p-1 rounded-full hover:bg-white/5"
                    >
                        <ChevronDown size={16} className="text-zinc-500" />
                    </motion.div>
                </div>

                {/* Expanded Details */}
                <motion.div
                    initial={false}
                    animate={{ height: isExpanded ? "auto" : 0 }}
                    className="overflow-hidden bg-zinc-950/30 border-t border-zinc-700/30"
                >
                    <div className="p-4 grid grid-cols-2 gap-4 text-xs">
                        <div>
                            <span className="text-zinc-500 block mb-1">Full Source Path</span>
                            <code className="bg-black/30 px-2 py-1 rounded text-zinc-300 block overflow-x-auto">
                                {operation.source}
                            </code>
                        </div>
                        <div>
                            <span className="text-zinc-500 block mb-1">Full Destination Path</span>
                            <code className="bg-black/30 px-2 py-1 rounded text-zinc-300 block overflow-x-auto">
                                {operation.destination}
                            </code>
                        </div>
                    </div>
                </motion.div>
            </GlassCard>
        </motion.div>
    );
};
