import { motion } from "framer-motion";
import { Home, FolderSearch, Settings, History } from "lucide-react";
import { cn } from "../../lib/utils";

interface SidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
    const navItems = [
        { id: "dashboard", label: "Dashboard", icon: Home },
        { id: "scan", label: "Scan & Plan", icon: FolderSearch },
        { id: "history", label: "History", icon: History },
        { id: "settings", label: "Settings", icon: Settings },
    ];

    return (
        <motion.aside
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="w-64 h-screen fixed left-0 top-0 border-r border-zinc-800 bg-black/80 backdrop-blur-xl flex flex-col z-50"
        >
            <div className="p-6">
                <h1 className="text-xl font-bold text-white tracking-tight">
                    Desktop Zero
                </h1>
                <p className="text-xs text-zinc-500 mt-1">AI-Powered Organizer</p>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-white/10 text-white border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                                    : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
                            )}
                        >
                            <Icon size={18} />
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-zinc-800">
                <div className="text-xs text-center text-zinc-600">
                    v1.0.0 • Early Access
                </div>
            </div>
        </motion.aside >
    );
};
