use crate::models::{Config, FileItem, Project, Plan, FileOperation};
use crate::scanner::Scanner;
use crate::planner::generate_plan;
use crate::executor::{execute_plan, undo_single_op};
use tauri::{State, Manager};
use std::sync::Mutex;
use std::path::PathBuf;

pub struct AppState {
    pub undo_stack: Mutex<Vec<Vec<FileOperation>>>,
}

#[tauri::command]
pub fn get_default_config() -> Config {
    crate::config::default_config()
}

#[tauri::command]
pub fn scan_directory(path: String, config: Config) -> (Vec<FileItem>, Vec<Project>) {
    let mut scanner = Scanner::new(config);
    scanner.scan(&PathBuf::from(path));
    scanner.get_results()
}

#[tauri::command]
pub fn create_plan(files: Vec<FileItem>, projects: Vec<Project>, config: Config, root: String) -> Plan {
    generate_plan(&files, &projects, &config, &PathBuf::from(&root))
}

#[tauri::command]
pub fn apply_plan(plan: Plan, state: State<AppState>) -> Result<String, String> {
    let executed = execute_plan(&plan)?;
    state.undo_stack.lock().unwrap().push(executed);
    Ok("Plan applied successfully".to_string())
}

#[tauri::command]
pub fn undo_last_operation(state: State<AppState>) -> Result<String, String> {
    let mut stack = state.undo_stack.lock().unwrap();
    if let Some(ops) = stack.pop() {
        for op in ops.iter().rev() {
            undo_single_op(op).map_err(|e| format!("Undo error: {}", e))?;
        }
        Ok("Undo successful".to_string())
    } else {
        Err("Nothing to undo".to_string())
    }
}

#[tauri::command]
pub fn load_config_file(app: tauri::AppHandle) -> Result<Config, String> {
    let config_dir = app.path().app_config_dir()
        .map_err(|e| e.to_string())?;
    let path = config_dir.join("config.json");
    
    if path.exists() {
        let content = std::fs::read_to_string(path).map_err(|e| e.to_string())?;
        serde_json::from_str(&content).map_err(|e| e.to_string())
    } else {
        Ok(crate::config::default_config())
    }
}

#[tauri::command]
pub fn save_config_file(app: tauri::AppHandle, config: Config) -> Result<(), String> {
    let config_dir = app.path().app_config_dir()
        .map_err(|e| e.to_string())?;
    std::fs::create_dir_all(&config_dir).map_err(|e| e.to_string())?;
    
    let path = config_dir.join("config.json");
    let content = serde_json::to_string_pretty(&config).map_err(|e| e.to_string())?;
    std::fs::write(path, content).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn suggest_project_name(project: Project, api_key: String) -> Result<String, String> {
    crate::ai::suggest_name(&project, &api_key).await.ok_or_else(|| "Failed to generate name".to_string())
}
#[tauri::command]
pub fn get_history(state: State<AppState>) -> Vec<Vec<FileOperation>> {
    let stack = state.undo_stack.lock().unwrap();
    stack.clone()
}

#[tauri::command]
pub fn open_config_folder(app: tauri::AppHandle) -> Result<(), String> {
    let config_dir = app.path().app_config_dir()
        .map_err(|e| e.to_string())?;
    std::fs::create_dir_all(&config_dir).map_err(|e| e.to_string())?;
    
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .arg(&config_dir)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(&config_dir)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(&config_dir)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}
