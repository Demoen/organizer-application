import { GlassCard } from "../ui/GlassCard";
import type { Config } from "../../types";
import { Shield, FileCode, FolderGit2, FolderOpen } from "lucide-react";
import { NeonButton } from "../ui/NeonButton";

interface SettingsViewProps {
    config: Config | null;
    apiKey: string;
    setApiKey: (key: string) => void;
    onOpenConfig: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ config, apiKey, setApiKey, onOpenConfig }) => {
    return (
        <div className="space-y-8 max-w-4xl mx-auto pb-10">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Configuration</h2>
                    <p className="text-zinc-400">Manage your markers, API keys, and safety rules.</p>
                </div>
                <NeonButton onClick={onOpenConfig} variant="secondary" className="flex items-center gap-2">
                    <FolderOpen size={18} />
                    Open Config Folder
                </NeonButton>
            </div>

            {/* API Key Section */}
            <GlassCard className="p-6 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-white/10 text-white">
                        <Shield size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">AI Integration</h3>
                        <p className="text-xs text-zinc-400">Required for smart project renaming</p>
                    </div>
                </div>

                <div className="bg-zinc-950/50 rounded-lg p-2 border border-zinc-800 focus-within:border-white/20 transition-colors">
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="sk-..."
                        className="w-full bg-transparent border-none focus:ring-0 text-zinc-200 text-sm font-mono placeholder:text-zinc-700"
                    />
                </div>
                <div className="text-[10px] text-zinc-500 flex gap-2">
                    <span className="text-amber-500/80">⚠ Keys are not saved to disk.</span>
                </div>
            </GlassCard>

            {/* Config Markers Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GlassCard className="p-6">
                    <div className="flex items-center gap-2 mb-4 text-white">
                        <FolderGit2 size={20} />
                        <h3 className="font-bold">Project Markers</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {config?.project_markers.slice(0, 15).map((marker) => (
                            <span key={marker} className="px-2 py-1 rounded bg-white/10 border border-white/20 text-white text-xs font-mono">
                                {marker}
                            </span>
                        ))}
                        {(config?.project_markers.length || 0) > 15 && (
                            <span className="px-2 py-1 rounded bg-zinc-800 text-zinc-500 text-xs">...</span>
                        )}
                    </div>
                </GlassCard>

                <GlassCard className="p-6">
                    <div className="flex items-center gap-2 mb-4 text-white">
                        <FileCode size={20} />
                        <h3 className="font-bold">Ignore Patterns</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {config?.ignore_patterns.map((pattern) => (
                            <span key={pattern} className="px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-mono">
                                {pattern}
                            </span>
                        ))}
                    </div>
                </GlassCard>
            </div>

            {/* Raw Config Dump (Collapsed/Small) */}
            <div className="bg-zinc-950/30 p-4 rounded-xl border border-zinc-800/50">
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Diagnostic Configuration</h4>
                <pre className="font-mono text-[10px] text-zinc-600 overflow-auto max-h-40">
                    {JSON.stringify(config, null, 2)}
                </pre>
            </div>
        </div>
    );
};
