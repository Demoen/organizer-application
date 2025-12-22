use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FileItem {
    pub path: PathBuf,
    pub name: String,
    pub extension: Option<String>,
    pub size: u64,
    pub is_dir: bool,
    pub created: u64, // timestamp
    pub modified: u64,
    pub project_root: Option<PathBuf>, // If it belongs to a project
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Project {
    pub path: PathBuf,
    pub name: String,
    pub type_guess: String, // e.g., "node", "rust", "python"
    pub internal_name: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum OperationType {
    Move,
    Copy,
    Delete, 
    CreateDir,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FileOperation {
    pub id: String,
    pub op_type: OperationType,
    pub source: Option<PathBuf>,
    pub destination: PathBuf,
    pub reason: String, // "Rule: Images", "Project: MyProject"
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Plan {
    pub operations: Vec<FileOperation>,
    pub summary: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Config {
    pub rules: Vec<Rule>,
    pub ignore_patterns: Vec<String>,
    pub project_markers: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Rule {
    pub name: String,
    pub patterns: Vec<String>, // glob patterns
    pub destination: String, // Relative to root
    pub active: bool,
}
