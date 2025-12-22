use serde::{Deserialize, Serialize};
use crate::models::Project;
use std::path::Path;
use std::fs;

#[derive(Serialize, Deserialize)]
struct OpenAIMessage {
    role: String,
    content: String,
}

#[derive(Serialize)]
struct OpenAIRequest {
    model: String,
    messages: Vec<OpenAIMessage>,
    temperature: f32,
}

#[derive(Deserialize)]
struct OpenAIResponse {
    choices: Vec<OpenAIChoice>,
}

#[derive(Deserialize)]
struct OpenAIChoice {
    message: OpenAIMessage,
}

pub async fn suggest_name(project: &Project, api_key: &str) -> Option<String> {
    if api_key.is_empty() {
        return None;
    }

    // 1. Gather context
    let context = gather_project_context(&project.path);
    if context.trim().is_empty() {
        return None;
    }

    // 2. Prepare Prompt
    let prompt = format!(
        "I have a coding project. Based on the following file snippets, suggest a short, descriptive name for the project folder (kebab-case). \
        Only return the name, nothing else. \
        \n\nContext:\n{}", 
        context
    );

    // 3. Call API
    let client = reqwest::Client::new();
    let req = OpenAIRequest {
        model: "gpt-4o-mini".to_string(), 
        messages: vec![
            OpenAIMessage { role: "system".to_string(), content: "You are a helpful assistant that renames coding projects.".to_string() },
            OpenAIMessage { role: "user".to_string(), content: prompt },
        ],
        temperature: 0.3,
    };

    let res = client.post("https://api.openai.com/v1/chat/completions")
        .header("Authorization", format!("Bearer {}", api_key))
        .json(&req)
        .send()
        .await;

    if let Ok(resp) = res {
        if let Ok(json) = resp.json::<OpenAIResponse>().await {
            if let Some(choice) = json.choices.first() {
                let name = choice.message.content.trim().to_string();
                // Sanity check: remove quotes, Ensure it's not a sentence
                let cleaned = name.replace("\"", "").replace("'", "").replace("\n", "");
                return Some(cleaned);
            }
        }
    }

    None
}

fn gather_project_context(path: &Path) -> String {
    let mut context = String::new();
    
    // 1. content-heavy files
    let candidates = [
        "README.md", "package.json", "Cargo.toml", "pyproject.toml", 
        "requirements.txt", "app.py", "main.py", "index.html", "index.ts",
        "go.mod", "Makefile", "Pipfile", "composer.json", "mix.exs",
        ".git/config" // Often contains "url = git@github.com:User/RepoName.git"
    ];
    
    for filename in candidates {
        let p = path.join(filename);
        if p.exists() {
            if let Ok(content) = fs::read_to_string(&p) {
                // Truncate content to avoid huge tokens (first 1000 chars)
                let snippet: String = content.chars().take(1000).collect();
                context.push_str(&format!("--- File: {} ---\n{}\n\n", filename, snippet));
            }
        }
    }

    // 2. Fallback: If context is weak, add file structure
    if context.len() < 50 {
        context.push_str("--- Project Structure ---\n");
        if let Ok(entries) = fs::read_dir(path) {
            for entry in entries.flatten() {
                if let Ok(file_type) = entry.file_type() {
                    let name = entry.file_name().to_string_lossy().to_string();
                    if name.starts_with(".") { continue; } // skip hidden
                    let marker = if file_type.is_dir() { "/" } else { "" };
                    context.push_str(&format!("{}{}\n", name, marker));
                }
            }
        }
    }

    context
}
