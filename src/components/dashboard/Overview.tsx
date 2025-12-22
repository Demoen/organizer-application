import { motion } from "framer-motion";
import { FolderSearch, Play, FileText, Database, FileCode, Image, Video, File, Bot } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";

interface OverviewProps {
    rootPath: string;
    setRootPath: (path: string) => void;
    onScan: () => void;
    isScanning: boolean;
    stats: { files: number; projects: number } | null;
}

const FloatingIcon = ({ icon: Icon, delay, x, y, rotate }: { icon: any, delay: number, x: number, y: number, rotate: number }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{
            opacity: 1,
            scale: 1,
            y: [y, y - 20, y],
            rotate: [rotate, rotate + 10, rotate]
        }}
        transition={{
            duration: 0.5,
            y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay },
            rotate: { duration: 6, repeat: Infinity, ease: "easeInOut", delay }
        }}
        className="absolute w-16 h-16 rounded-2xl glass flex items-center justify-center border border-white/10 shadow-2xl backdrop-blur-md z-10"
        style={{ left: x, top: y }}
    >
        <Icon size={32} className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
    </motion.div>
);

export const Overview: React.FC<OverviewProps> = ({
    rootPath,
    setRootPath,
    onScan,
    isScanning,
    stats
}) => {
    return (
        <div className="relative min-h-[80vh] flex flex-col items-center justify-center">

            {/* Hero Section */}
            <div className="relative w-full max-w-5xl mx-auto z-20">
                <div className="text-center space-y-4 mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl font-bold text-white tracking-tight drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                    >
                        Organize Your Digital Workspace
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-zinc-400 font-light"
                    >
                        Select a target folder and let AI handle the rest.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    {/* Main Action Card */}
                    <div className="lg:col-span-7">
                        <GlassCard className="p-8 space-y-8 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-black/40 backdrop-blur-xl relative overflow-visible">
                            {/* Decorative Glow */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-xl opacity-20 -z-10" />

                            <div className="space-y-3">
                                <label className="text-sm font-medium text-zinc-300 ml-1 uppercase tracking-wider">Target Directory</label>
                                <div className="relative group">
                                    <FolderSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-white transition-colors" size={24} />
                                    <input
                                        type="text"
                                        value={rootPath}
                                        onChange={(e) => setRootPath(e.target.value)}
                                        className="w-full bg-zinc-900/60 border border-zinc-700/50 rounded-xl py-5 pl-14 pr-6 text-zinc-100 outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all font-mono text-base placeholder:text-zinc-600 shadow-inner"
                                        placeholder="C:\Users\Username\Desktop"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={onScan}
                                disabled={isScanning}
                                className="group relative w-full flex items-center justify-center gap-4 px-8 py-6 bg-white/5 border border-white/10 text-emerald-100/80 text-lg font-bold rounded-xl overflow-hidden transition-all duration-500 hover:text-white hover:border-emerald-500/50 hover:shadow-[0_0_50px_rgba(16,185,129,0.2)] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-md"
                            >
                                {/* Hover Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="relative z-10 flex items-center gap-3">
                                    {isScanning ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                            <span className="tracking-widest uppercase text-sm font-medium text-emerald-400">Scanning Grid...</span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-emerald-400/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <Play size={20} fill="currentColor" className="text-emerald-400/80 group-hover:text-emerald-400 transition-colors" />
                                            </div>
                                            <span className="tracking-widest uppercase text-sm font-medium group-hover:text-emerald-100 transition-colors">Initiate Scan</span>
                                        </>
                                    )}
                                </div>
                            </button>
                        </GlassCard>
                    </div>

                    {/* Floating Elements Area (Right Side) */}
                    <div className="lg:col-span-5 relative h-[400px] hidden lg:block perspective-1000">
                        {/* Central "Gravity" point could be invisible, but elements float around */}

                        <FloatingIcon icon={FileCode} delay={0} x={50} y={50} rotate={-10} />
                        <FloatingIcon icon={Image} delay={1.5} x={250} y={20} rotate={15} />
                        <FloatingIcon icon={Video} delay={0.8} x={300} y={150} rotate={-5} />
                        <FloatingIcon icon={File} delay={2} x={80} y={200} rotate={10} />

                        {/* AI Bot Representation */}
                        <motion.div
                            animate={{ y: [0, -20, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute bottom-0 right-32"
                        >
                            <div className="relative">
                                <div className="absolute -inset-10 bg-white/5 blur-3xl rounded-full" />
                                <Bot size={120} className="text-white relative z-10 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]" />
                                {/* Eyes glow */}
                                <div className="absolute top-[38px] left-[35px] w-3 h-3 bg-cyan-400 rounded-full blur-[2px] animate-pulse" />
                                <div className="absolute top-[38px] right-[35px] w-3 h-3 bg-cyan-400 rounded-full blur-[2px] animate-pulse" />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Stats Cards Fade In */}
            {stats && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-2 gap-8 mt-16 z-20 w-full max-w-2xl"
                >
                    <GlassCard className="flex items-center gap-6 p-6 border-zinc-800 bg-black/60">
                        <div className="w-14 h-14 rounded-2xl bg-zinc-900/80 border border-zinc-700 flex items-center justify-center text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                            <FileText size={28} />
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-white mb-1">{stats.files}</div>
                            <div className="text-sm text-zinc-400 uppercase tracking-widest font-semibold">Files</div>
                        </div>
                    </GlassCard>

                    <GlassCard className="flex items-center gap-6 p-6 border-zinc-800 bg-black/60">
                        <div className="w-14 h-14 rounded-2xl bg-zinc-900/80 border border-zinc-700 flex items-center justify-center text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                            <Database size={28} />
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-white mb-1">{stats.projects}</div>
                            <div className="text-sm text-zinc-400 uppercase tracking-widest font-semibold">Projects</div>
                        </div>
                    </GlassCard>
                </motion.div>
            )}

            {/* Background elements (Orbits/Lines) handled by StarBackground, but we can add some local glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl -z-10 pointer-events-none opacity-20" />
        </div>
    );
};
