use crate::models::{Config, FileItem, Project, FileOperation, OperationType, Plan};
use std::collections::HashSet;
use std::path::Path;
use glob::Pattern;
use uuid::Uuid;

pub fn generate_plan(files: &[FileItem], projects: &[Project], config: &Config, root: &Path) -> Plan {
    let mut operations = Vec::new();
    let mut intended_paths = HashSet::new(); // To detect internal collisions within the plan
    
    // Check for existence of destination folders (CreateDir operations implied or explicit?)
    // Usually "Move" implies "Create parent dirs if missing".
    // We can add "CreateDir" operations if we want to be explicit.
    
    // 1. Handle Projects
    for project in projects {
        // Find if any rule matches the Project TYPE (we only have marker name now, e.g. "package.json")
        // We might want to add a mapping for markers -> Folder Names.
        // For now, let's just group by "Projects/<Type>" where Type is mapped from marker.
        
        let subfolder = match project.type_guess.as_str() {
            // Frameworks
            "next.config.js" | "next.config.mjs" => "Projects/NextJS",
            "remix.config.js" => "Projects/Remix",
            "angular.json" => "Projects/Angular",
            "vue.config.js" => "Projects/Vue",
            "vite.config.js" | "vite.config.ts" => "Projects/Vite",
            "nest-cli.json" => "Projects/NestJS",
            "manage.py" => "Projects/Django",
            "src-tauri/tauri.conf.json" | "src-tauri/tauri.conf.json5" => "Projects/Tauri",

            // General Languages
            "package.json" | "node_modules" | "*.js" | "*.ts" => "Projects/Node",
            "Cargo.toml" => "Projects/Rust",
            "pyproject.toml" | "requirements.txt" | "venv" | "app.py" | "main.py" | "*.py" => "Projects/Python",
            "index.html" => "Projects/Web",
            ".obsidian" => "Documents/Vaults", // Safer to keep vaults in Docs
            "go.mod" => "Projects/Go",
            "pom.xml" | "build.gradle" => "Projects/Java",
            "*.sln" => "Projects/DotNet",
            ".git" => "Projects/Git",
            "Makefile" | "CMakeLists.txt" => "Projects/Cpp",
            "steam_settings" | "*.exe" | "Assets" | "ProjectSettings" => "Games",
            "composer.json" | "index.php" | "artisan" => "Projects/PHP",
            "Gemfile" => "Projects/Ruby",
            "pubspec.yaml" => "Projects/Flutter",
            "AndroidManifest.xml" | "build.gradle.kts" | "*.xcodeproj" | "*.xcworkspace" | "Package.swift" | "ionic.config.json" => "Projects/Mobile",
            "Dockerfile" | "docker-compose.yml" | "Containerfile" | "*.tf" => "Projects/DevOps",
            "*.Rproj" => "Projects/Data",
            "*.ipynb" => "Projects/Jupyter",
            "mix.exs" => "Projects/Elixir",
            "Project.toml" => "Projects/Julia",
            _ => "Projects/Other", // Fallback
        };
        
        // Destination: Root / Projects / Node / <ProjectName>
        let base_dest = root.join(subfolder);
        // Rename logic: Check if internal_name exists (and is valid filename)
        let safe_name = project.internal_name.as_ref().map(|s| sanitize_filename(s)).unwrap_or_else(|| project.name.clone());
        
        let mut dest_path = base_dest.join(&safe_name);
        
        let mut counter = 1;
        
        // Collision check
         while dest_path.exists() || intended_paths.contains(&dest_path) || dest_path == project.path {
            // Note: if dest_path == project.path, we usually break, 
            // BUT if we are renaming (e.g. folder "my-app" -> "cool-app"), we should NOT break just because strict path match if names differ.
            // Actually, if paths match, it means source == dest. 
            // If source == dest, we can stop if names match.
            // If names differ (rename in place?), we wouldn't be in this branch unless dest already exists? 
            // Wait, if I rename "my-app" to "cool-app", dest_path is ".../cool-app". If that doesn't exist, we are good.
            
            if dest_path == project.path {
                break;
            }
            let final_name = format!("{} ({})", safe_name, counter);
            dest_path = base_dest.join(&final_name);
            counter += 1;
        }

        if project.path != dest_path {
             intended_paths.insert(dest_path.clone());
             operations.push(FileOperation {
                 id: Uuid::new_v4().to_string(),
                 op_type: OperationType::Move,
                 source: Some(project.path.clone()),
                 destination: dest_path,
                 reason: format!("Project detected: {}", project.type_guess),
             });
        }
    }

    // 2. Handle Files
    for file in files {
        let mut matched_rule_name = None;
        let mut dest_subdir = None;

        for rule in &config.rules {
            if !rule.active { continue; }
            for pattern_str in &rule.patterns {
                if let Ok(pattern) = Pattern::new(pattern_str) {
                    // Check strict filename first
                    if pattern.matches(&file.name) {
                        matched_rule_name = Some(rule.name.clone());
                        dest_subdir = Some(rule.destination.clone());
                        break;
                    }
                }
            }
            if matched_rule_name.is_some() { break; }
        }

        if let Some(subdir) = dest_subdir {
            let base_dest = root.join(&subdir);
            let mut dest_path = base_dest.join(&file.name);
            
            // Collision handling: Rename
            let stem = Path::new(&file.name).file_stem().unwrap_or_default().to_string_lossy();
            let ext = Path::new(&file.name).extension()
                        .map(|e| format!(".{}", e.to_string_lossy()))
                        .unwrap_or_default();
            let mut counter = 1;

            // Collision check loop
            while dest_path.exists() || intended_paths.contains(&dest_path) || dest_path == file.path {
                if dest_path == file.path {
                    // It's already there! No op needed.
                    break;
                }
                
                let final_name = format!("{} ({}){}", stem, counter, ext);
                dest_path = base_dest.join(&final_name);
                counter += 1;
            }
            
            // Avoid moving if source == dest (already broke loop above if so, but double check)
            if file.path != dest_path {
                 intended_paths.insert(dest_path.clone());
                 operations.push(FileOperation {
                     id: Uuid::new_v4().to_string(),
                     op_type: OperationType::Move,
                     source: Some(file.path.clone()),
                     destination: dest_path,
                     reason: format!("Rule: {}", matched_rule_name.unwrap()),
                 });
            }
        }
    }

    let count = operations.len();
    Plan {
        operations,
        summary: format!("Planned {} operations", count),
    }
}

fn sanitize_filename(name: &str) -> String {
    name.replace(|c: char| !c.is_alphanumeric() && c != '-' && c != '_' && c != ' ', "_")
}
