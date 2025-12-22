import { Search, Undo2 } from "lucide-react";

interface TopbarProps {
    stats?: { files: number; projects: number };
    onUndo?: () => void;
    canUndo?: boolean;
    searchQuery: string;
    onSearch: (query: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({ stats, onUndo, canUndo, searchQuery, onSearch }) => {
    return (
        <header className="h-16 fixed top-0 right-0 left-64 border-b border-zinc-700/50 bg-zinc-900/50 backdrop-blur-md z-40 flex items-center justify-between px-8">
            {/* Search Bar */}
            <div className="flex items-center gap-4 flex-1 max-w-xl">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearch(e.target.value)}
                        placeholder="Search operations, files, or projects..."
                        className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-zinc-600"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <span className="text-[10px] bg-zinc-700 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-600">Ctrl</span>
                        <span className="text-[10px] bg-zinc-700 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-600">K</span>
                    </div>
                </div>
            </div>

            {/* Right Side: Stats & Actions */}
            <div className="flex items-center gap-6">
                {stats && (
                    <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
                        <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />
                            {stats.files} Scanned Files
                        </span>
                        <span>|</span>
                        <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                            {stats.projects} Projects Detected
                        </span>
                    </div>
                )}

                <div className="h-6 w-px bg-zinc-700" />

                <div className="flex items-center gap-2">
                    <button
                        onClick={onUndo}
                        disabled={!canUndo}
                        className="p-2 text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"
                        title="Undo Last Action"
                    >
                        <Undo2 size={18} />
                    </button>
                    {/* Redo could go here */}
                </div>
            </div>
        </header>
    );
};
