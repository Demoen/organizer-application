use std::path::Path;
use std::fs;

#[derive(Debug, Clone, PartialEq)]
pub enum Category {
    Project,
    InstalledProgram,
    AppData,
    LooseFiles,
}

#[derive(Debug, Clone)]
pub struct Classification {
    pub category: Category,
    pub confidence: f32, // 0.0 to 1.0
    pub reason: String,
    pub project_type: Option<String>,
}

impl Default for Classification {
    fn default() -> Self {
        Self {
            category: Category::LooseFiles,
            confidence: 0.0,
            reason: "Default".to_string(),
            project_type: None,
        }
    }
}

pub fn classify_folder(path: &Path, project_markers: &[String]) -> Classification {
    // 1. Check for Installed Software (High Confidence Safety)
    if is_installed_software(path) {
        return Classification {
            category: Category::InstalledProgram,
            confidence: 0.9,
            reason: "Contains software binary indicators (Uninstall.exe, DLL+EXE)".to_string(),
            project_type: None,
        };
    }

    // 2. Check for App Data / Games (Medium-High)
    if is_app_data(path) {
        return Classification {
            category: Category::AppData,
            confidence: 0.8,
            reason: "Contains game data folder signatures".to_string(),
            project_type: None,
        };
    }

    // 3. Check for Project (Strong Markers vs Weak Markers)
    if let Some((ptype, confidence)) = detect_project(path, project_markers) {
        // If confidence is low (Weak Marker) and it looks slightly 'software-ish' (e.g. has a random DLL),
        // we might want to downgrade or reject? 
        // For now, if detect_project returns something, we trust it, but we can refine confidence.
        return Classification {
            category: Category::Project,
            confidence,
            reason: format!("Detected marker: {}", ptype),
            project_type: Some(ptype),
        };
    }

    // 4. Fallback
    Classification::default()
}

fn is_installed_software(dir: &Path) -> bool {
    let indicators = [
        "Uninstall.exe", "unins000.exe", "unins001.exe", "setup.exe",
        "UnityCrashHandler64.exe", "UnityPlayer.dll",
        "d3dcompiler_47.dll", "opengl32.dll",
        "steam_api.dll", "steam_api64.dll",
        "Galaxy64.dll", "tier0.dll",
        "adb.exe", "AdbWinApi.dll", // Tools
    ];

    for indicator in indicators {
        if dir.join(indicator).exists() {
            return true;
        }
    }

    // Generic Exe + Dll Check
    if let Ok(entries) = fs::read_dir(dir) {
        let mut has_exe = false;
        let mut has_dll = false;
        for entry in entries.flatten().take(50) {
            let path = entry.path();
            if let Some(ext) = path.extension().and_then(|e| e.to_str()) {
                match ext.to_lowercase().as_str() {
                    "exe" => has_exe = true,
                    "dll" => has_dll = true,
                    _ => {}
                }
            }
        }
        if has_exe && has_dll {
            return true;
        }
    }
    
    false
}

fn is_app_data(dir: &Path) -> bool {
    // Check for "Data" folders often found in games
    if let Ok(entries) = fs::read_dir(dir) {
        let mut pak_count = 0;
        let mut dat_count = 0;
        for entry in entries.flatten().take(50) {
            let path = entry.path();
            if let Some(ext) = path.extension().and_then(|e| e.to_str()) {
                match ext.to_lowercase().as_str() {
                    "pak" => pak_count += 1,
                    "vpk" => pak_count += 1,
                    "dat" => dat_count += 1,
                    _ => {}
                }
            }
        }
        if pak_count >= 1 || dat_count >= 5 {
            return true;
        }
    }
    false
}

fn detect_project(dir: &Path, markers: &[String]) -> Option<(String, f32)> {
    // Returns (ProjectType, Confidence)
    
    // 1. Strong Markers (Confidence 1.0)
    // These define a project root clearly.
    let strong_markers = [
        "package.json", "Cargo.toml", "pom.xml", "build.gradle", "go.mod", 
        "requirements.txt", "Gemfile", "composer.json", "mix.exs", 
        "lines", "CMakeLists.txt", "Makefile", ".git", ".hg", ".svn", 
        ".vscode", ".idea", "*.sln", "*.csproj", "*.xcodeproj"
    ];

    for marker in strong_markers {
        // Handle glob markers in strong list
        if marker.starts_with('*') {
             // simplified glob check for strong markers if needed
             if crate::projects::search_for_marker(dir, marker) {
                 return Some((marker.to_string(), 1.0));
             }
        } else {
             if dir.join(marker).exists() {
                 return Some((marker.to_string(), 1.0));
             }
        }
    }

    // 2. Config Provided Markers (Variable Confidence)
    // The config contains both strong and weak markers. We need to distinguish.
    for marker in markers {
         if crate::projects::search_for_marker(dir, marker) {
             // Is it a weak marker?
             if marker.starts_with('*') || marker.ends_with(".js") || marker.ends_with(".py") || marker.ends_with(".ts") {
                 // Weak marker found.
                 // Confirm it's not just a single script in a random folder?
                 // For now, give it lower confidence.
                 return Some((marker.clone(), 0.6));
             } else {
                 return Some((marker.clone(), 1.0));
             }
         }
    }

    None
}
