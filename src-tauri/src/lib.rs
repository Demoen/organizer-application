pub mod models;
pub mod config;
pub mod projects;
pub mod scanner;
pub mod classifier;
pub mod planner;
pub mod executor;
pub mod commands;
pub mod ai;

use commands::*;
use std::sync::Mutex;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .manage(commands::AppState {
        undo_stack: Mutex::new(Vec::new()),
    })
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
        get_default_config,
        scan_directory,
        create_plan,
        apply_plan,
        undo_last_operation,
        load_config_file,
        save_config_file,
        suggest_project_name,
        get_history,
        open_config_folder
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
