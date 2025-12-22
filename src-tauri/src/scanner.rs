use crate::models::{FileItem, Project, Config};
use std::fs;
use std::path::Path;
use std::time::UNIX_EPOCH;
use glob::Pattern;

pub struct Scanner {
    config: Config,
    file_items: Vec<FileItem>,
    projects: Vec<Project>,
    ignore_patterns: Vec<Pattern>,
}

impl Scanner {
    pub fn new(config: Config) -> Self {
        let ignore_patterns = config.ignore_patterns.iter()
            .filter_map(|p| Pattern::new(p).ok())
            .collect();
        Scanner {
            config,
            file_items: Vec::new(),
            projects: Vec::new(),
            ignore_patterns,
        }
    }

    fn is_ignored(&self, path: &Path, root: &Path) -> bool {
         // Get relative path for matching
         let relative = match path.strip_prefix(root) {
             Ok(p) => p,
             Err(_) => return false,
         };
         let relative_str = relative.to_string_lossy();
         
         for pattern in &self.ignore_patterns {
             if pattern.matches(&relative_str) {
                 return true;
             }
             // Handle "name-only" matches for convenience
             if let Some(file_name) = path.file_name() {
                 if pattern.matches(&file_name.to_string_lossy()) {
                     return true;
                 }
             }
         }
         false
    }

    pub fn scan(&mut self, root: &Path) {
        self.scan_recursive(root, root);
    }

    fn scan_recursive(&mut self, dir: &Path, root: &Path) {
        if self.is_ignored(dir, root) {
            return;
        }

        // CLASSIFICATION (Smart + Easy)
        // We ask the classifier what this folder is.
        use crate::classifier::{classify_folder, Category};

        if dir != root {
            let classification = classify_folder(dir, &self.config.project_markers);
            
            match classification.category {
                Category::Project => {
                    // Confirmed Project.
                    if let Some(ptype) = classification.project_type {
                        let internal_name = crate::projects::extract_internal_name(dir, &ptype);
                        self.projects.push(Project {
                            path: dir.to_path_buf(),
                            name: dir.file_name().unwrap_or_default().to_string_lossy().to_string(),
                            type_guess: ptype,
                            internal_name,
                        });
                        return; // Stop recursion for projects
                    }
                }
                Category::InstalledProgram | Category::AppData => {
                    // Safety: Do not touch installed software or game data.
                    return; // Stop recursion
                }
                Category::LooseFiles => {
                    // Continue scanning this folder for more sub-folders
                }
            }
        }

        if let Ok(entries) = fs::read_dir(dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                if self.is_ignored(&path, root) {
                    continue;
                }

                if path.is_dir() {
                    self.scan_recursive(&path, root);
                } else {
                    // It's a file
                    // GENERAL SAFETY: Only collect "loose files" if we are in the ROOT directory.
                    if dir == root {
                        let metadata = entry.metadata().ok();
                        let size = metadata.as_ref().map(|m| m.len()).unwrap_or(0);
                        let created = metadata.as_ref().and_then(|m| m.created().ok())
                            .and_then(|t| t.duration_since(UNIX_EPOCH).ok())
                            .map(|d| d.as_secs())
                            .unwrap_or(0);
                        let modified = metadata.as_ref().and_then(|m| m.modified().ok())
                            .and_then(|t| t.duration_since(UNIX_EPOCH).ok())
                            .map(|d| d.as_secs())
                            .unwrap_or(0);
                        
                        self.file_items.push(FileItem {
                            path: path.clone(),
                            name: path.file_name().unwrap_or_default().to_string_lossy().to_string(),
                            extension: path.extension().map(|e| e.to_string_lossy().to_string()),
                            size,
                            is_dir: false,
                            created,
                            modified,
                            project_root: None,
                        });
                    }
                }
            }
        }
    }
    
    pub fn get_results(self) -> (Vec<FileItem>, Vec<Project>) {
        (self.file_items, self.projects)
    }
}
