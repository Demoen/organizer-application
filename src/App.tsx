import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { FileItem, Project, Config, Plan, Operation } from "./types";
import { Overview } from "./components/dashboard/Overview";
import { OperationsList } from "./components/operations/OperationsList";
import { HistoryView } from "./components/dashboard/HistoryView";
import { SettingsView } from "./components/dashboard/SettingsView";
import { NeonButton } from "./components/ui/NeonButton";
import { Sidebar } from "./components/layout/Sidebar";
import { Topbar } from "./components/layout/Topbar";

import { StarBackground } from "./components/ui/StarBackground";

function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [rootPath, setRootPath] = useState("C:\\Users\\Yannick\\Desktop");
  const [config, setConfig] = useState<Config | null>(null);
  const [scanResults, setScanResults] = useState<{ files: FileItem[], projects: Project[] } | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [history, setHistory] = useState<Operation[][]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Try to load saved config, fallback to default
    invoke<Config>("load_config_file")
      .then(setConfig)
      .catch(async (e) => {
        console.error("Failed to load config:", e);
        // Fallback to default config
        const defaultConfig = await invoke<Config>("get_default_config");
        setConfig(defaultConfig);
      });
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const hist = await invoke<Operation[][]>("get_history");
      setHistory(hist);
    } catch (e) {
      console.error("Failed to fetch history:", e);
    }
  };

  const handleScan = async () => {
    if (!config) return;
    setIsScanning(true);
    try {
      const [files, projects] = await invoke<[FileItem[], Project[]]>("scan_directory", { path: rootPath, config });
      setScanResults({ files, projects });

      const generatedPlan = await invoke<Plan>("create_plan", { files, projects, config, root: rootPath });
      setPlan(generatedPlan);
      setActiveTab("scan");
    } catch (e) {
      console.error(`Error: ${e}`);
    } finally {
      setIsScanning(false);
    }
  };

  const handleApply = async () => {
    if (!plan) return;
    if (!confirm(`Are you sure you want to apply ${plan.operations.length} operations?`)) return;

    try {
      await invoke<string>("apply_plan", { plan });
      setPlan(null);
      setScanResults(null);
      setActiveTab("dashboard");
    } catch (e) {
      console.error(`Error applying: ${e}`);
    }
  };

  const handleUndo = async () => {
    try {
      await invoke<string>("undo_last_operation");
      fetchHistory(); // Update history
    } catch (e) {
      console.error(`Error undoing: ${e}`);
    }
  };

  const handleOpenConfig = async () => {
    try {
      await invoke("open_config_folder");
    } catch (e) {
      console.error(`Error opening config: ${e}`);
    }
  };

  const handleRemoveOperation = (index: number) => {
    if (!plan) return;
    const newOperations = plan.operations.filter((_, i) => i !== index);
    setPlan({ ...plan, operations: newOperations });
  };

  // Auto-save config when it changes (e.g., API key)
  useEffect(() => {
    if (config && apiKey) {
      // Save config with API key (though API key isn't persisted in config file)
      invoke("save_config_file", { config })
        .catch(e => console.error("Failed to save config:", e));
    }
  }, [config, apiKey]);

  // Filter Logic in global scope
  const filteredOperations = plan?.operations.filter(op =>
    (op.source && op.source.toLowerCase().includes(searchQuery.toLowerCase())) ||
    op.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
    op.op_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen text-zinc-200 font-sans selection:bg-white/20 relative">
      <StarBackground />
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <Topbar
        stats={scanResults ? { files: scanResults.files.length, projects: scanResults.projects.length } : undefined}
        canUndo={history.length > 0}
        onUndo={handleUndo}
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
      />

      <main className="pl-64 pt-16 min-h-screen">
        <div className="p-8 max-w-7xl mx-auto">
          {activeTab === "dashboard" && (
            <Overview
              rootPath={rootPath}
              setRootPath={setRootPath}
              onScan={handleScan}
              isScanning={isScanning}
              stats={scanResults ? { files: scanResults.files.length, projects: scanResults.projects.length } : null}
            />
          )}

          {activeTab === "scan" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Planned Operations</h2>
                <div className="flex gap-2">
                  {plan && apiKey && (
                    <NeonButton
                      onClick={async () => {
                        if (!plan || !scanResults) return;
                        setIsAiProcessing(true);

                        const newOps = [...(filteredOperations || plan.operations)];
                        const usedDestinations = new Set<string>();
                        newOps.forEach(op => usedDestinations.add(op.destination.toLowerCase()));
                        let changed = 0;

                        for (let i = 0; i < newOps.length; i++) {
                          const op = newOps[i];
                          if (op.reason.startsWith("Project detected") && op.source) {
                            usedDestinations.delete(op.destination.toLowerCase());
                            const proj = scanResults.projects.find(p => p.path === op.source);
                            if (proj) {
                              const aiName = await triggerAiRename(proj, apiKey);
                              let targetName = aiName || op.destination.split('\\').pop() || "";
                              const parentDir = op.destination.substring(0, op.destination.lastIndexOf('\\'));
                              let candidate = `${parentDir}\\${targetName}`;
                              let finalDest = candidate;
                              let counter = 1;
                              while (usedDestinations.has(finalDest.toLowerCase())) {
                                finalDest = `${candidate} (${counter})`;
                                counter++;
                              }
                              usedDestinations.add(finalDest.toLowerCase());
                              if (finalDest !== op.destination) {
                                newOps[i] = { ...op, destination: finalDest, reason: aiName ? `${op.reason} + AI Rename` : op.reason };
                                changed++;
                              }
                            } else {
                              usedDestinations.add(op.destination.toLowerCase());
                            }
                          }
                        }
                        setPlan({ ...plan, operations: newOps });
                        setIsAiProcessing(false);
                      }}
                      variant="secondary"
                      disabled={isAiProcessing}
                      className="flex items-center gap-2"
                    >
                      {isAiProcessing ? "Thinking..." : "✨ AI Enhance"}
                    </NeonButton>
                  )}
                  {plan && (
                    <NeonButton onClick={handleApply} variant="primary">
                      Apply {plan.operations.length} Changes
                    </NeonButton>
                  )}
                </div>
              </div>

              {plan ? (
                <OperationsList
                  operations={filteredOperations || plan.operations}
                  onRemoveOperation={handleRemoveOperation}
                />
              ) : (
                <div className="text-center py-20 text-zinc-500">
                  No plan generated yet. Go to Dashboard and Scan.
                </div>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <HistoryView history={history} onUndo={handleUndo} />
          )}

          {activeTab === "settings" && (
            <SettingsView
              config={config}
              apiKey={apiKey}
              setApiKey={setApiKey}
              onOpenConfig={handleOpenConfig}
            />
          )}
        </div>
      </main>
    </div>
  );
}

async function triggerAiRename(project: Project, apiKey: string) {
  try {
    const newName = await invoke<string>("suggest_project_name", { project, apiKey });
    console.log("AI Suggested:", newName);
    return newName;
  } catch (e) {
    console.error("AI Error:", e);
    return null;
  }
}

export default App;
