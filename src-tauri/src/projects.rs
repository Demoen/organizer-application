use std::path::Path;
use glob::glob;

pub fn search_for_marker(dir: &Path, marker: &str) -> bool {
    if marker.contains('*') || marker.contains('?') {
        let pattern = dir.join(marker).to_string_lossy().to_string();
        if let Ok(paths) = glob(&pattern) {
            for _ in paths {
                return true;
            }
        }
        false
    } else {
        dir.join(marker).exists()
    }
}





pub fn extract_internal_name(dir: &Path, type_guess: &str) -> Option<String> {
    match type_guess {
        "package.json" => {
            let path = dir.join("package.json");
            if let Ok(content) = std::fs::read_to_string(path) {
                if let Ok(json) = serde_json::from_str::<serde_json::Value>(&content) {
                    return json["name"].as_str().map(|s| s.to_string());
                }
            }
        },
        "Cargo.toml" => {
             let path = dir.join("Cargo.toml");
             if let Ok(content) = std::fs::read_to_string(path) {
                 // Simple regex or parse. Regex is lighter than pulling full toml crate for just this.
                 // [package] ... name = "foo"
                 if let Ok(re) = regex::Regex::new(r#"(?m)^name\s*=\s*"([^"]+)""#) {
                     if let Some(cap) = re.captures(&content) {
                         return Some(cap[1].to_string());
                     }
                 }
             }
        },
        "pyproject.toml" => {
             let path = dir.join("pyproject.toml");
             if let Ok(content) = std::fs::read_to_string(path) {
                 if let Ok(re) = regex::Regex::new(r#"(?m)^name\s*=\s*"([^"]+)""#) {
                      if let Some(cap) = re.captures(&content) {
                          return Some(cap[1].to_string());
                      }
                 }
             }
        },
        _ => {}
    }
    None
}
