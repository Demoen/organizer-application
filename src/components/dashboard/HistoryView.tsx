import { motion } from "framer-motion";
import { Clock, Undo2, CheckCircle2 } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { NeonButton } from "../ui/NeonButton";
import type { Operation } from "../../types";

interface HistoryViewProps {
    history: Operation[][];
    onUndo?: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ history, onUndo }) => {
    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white tracking-tight">
                    Activity History
                </h2>
                <NeonButton
                    onClick={onUndo}
                    variant="secondary"
                    className="flex items-center gap-2"
                    disabled={history.length === 0}
                >
                    <Undo2 size={18} />
                    Undo Last Batch
                </NeonButton>
            </div>

            <div className="space-y-4">
                {history.length === 0 ? (
                    <div className="text-center py-12 text-zinc-500 bg-zinc-900/20 rounded-xl border border-zinc-800/50">
                        <Clock size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No operations recorded in this session.</p>
                    </div>
                ) : (
                    history.slice().reverse().map((batch, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <GlassCard className="p-4">
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-zinc-800/50 flex items-center justify-center border border-zinc-700">
                                        <CheckCircle2 size={18} className="text-emerald-400" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-zinc-200 font-medium">Batch Operation #{history.length - i}</div>
                                        <div className="text-xs text-zinc-500">{batch.length} files affected</div>
                                    </div>
                                    {i === 0 && (
                                        <div className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-xs font-medium border border-zinc-700">
                                            Latest
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-1 pl-14">
                                    {batch.slice(0, 3).map((op, opIdx) => (
                                        <div key={opIdx} className="text-xs text-zinc-400 flex items-center gap-2">
                                            <span className={`w-1.5 h-1.5 rounded-full ${op.op_type === 'Move' ? 'bg-white' : 'bg-zinc-500'}`} />
                                            <span className="truncate max-w-md">
                                                {op.op_type}
                                                <span className="text-zinc-300 mx-1">{op.source ? op.source.split('\\').pop() : "Unknown"}</span>
                                                to
                                                <span className="text-zinc-300 mx-1">{op.destination.replace(/.*Desktop\\/, '')}</span>
                                            </span>
                                        </div>
                                    ))}
                                    {batch.length > 3 && (
                                        <div className="text-xs text-zinc-500 italic">
                                            + {batch.length - 3} more operations...
                                        </div>
                                    )}
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};
