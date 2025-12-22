use crate::models::{Config, Rule};

pub fn default_config() -> Config {
    Config {
        ignore_patterns: vec![
            "**/node_modules/**".to_string(),
            "**/.git/**".to_string(),
            "**/target/**".to_string(),
            "**/.vscode/**".to_string(),
            "**/dist/**".to_string(),
            "**/build/**".to_string(),
            "**/games/**".to_string(),
            "**/Games/**".to_string(),
            "**/site-packages/**".to_string(),
            "**/.obsidian/**".to_string(), // Obsidian vault config
            "**/.idea/**".to_string(), // JetBrains config
            "**/venv/**".to_string(),
            "**/.venv/**".to_string(),
            "**/__pycache__/**".to_string(),
            "**/__MACOSX/**".to_string(),
            "**/static/**".to_string(), // Web app static assets
            "**/templates/**".to_string(), // Web app templates
            "**/assets/**".to_string(), // Common assets folder
            "**/public/**".to_string(), // Common public folder
        ],
        project_markers: vec![
            // Frameworks (Specific) - Match these before generic language markers
            "next.config.js".to_string(), // Next.js
            "next.config.mjs".to_string(), // Next.js
            "remix.config.js".to_string(), // Remix
            "angular.json".to_string(), // Angular
            "vue.config.js".to_string(), // Vue
            "vite.config.js".to_string(), // Vite (React/Vue/Svelte)
            "vite.config.ts".to_string(), // Vite
            "nest-cli.json".to_string(), // NestJS
            "manage.py".to_string(), // Django
            "src-tauri/tauri.conf.json".to_string(), // Tauri (v1)
            "src-tauri/tauri.conf.json5".to_string(), // Tauri (v2)
            
            // Languages (Generic)
            "package.json".to_string(),
            "Cargo.toml".to_string(),
            "pyproject.toml".to_string(),
            "pyvenv.cfg".to_string(), // Detects venvs
            ".git".to_string(),
            "go.mod".to_string(),
            "pom.xml".to_string(),
            "build.gradle".to_string(),
            "*.sln".to_string(),
            "requirements.txt".to_string(),
            "app.py".to_string(), // Common single-file python app
            "main.py".to_string(), // Common entry point
            "Makefile".to_string(),
            "CMakeLists.txt".to_string(),
            "steam_settings".to_string(),
            // "*.exe".to_string(), // REMOVED: Too zealous for Documents/Program Files
            "*.py".to_string(), // Loose python project
            "*.js".to_string(), // Loose node project (check validity?)
            "*.ts".to_string(), // Loose TS project
            "index.html".to_string(), // Static web project
            ".obsidian".to_string(), // Obsidian Vault
            // PHP / Laravel
            "composer.json".to_string(),
            "index.php".to_string(),
            "artisan".to_string(), 
            // Ruby
            "Gemfile".to_string(),
            // JavaScript / Mobile
            "package.json".to_string(), 
            "ionic.config.json".to_string(),
            // Flutter / Dart
            "pubspec.yaml".to_string(),
            // Java / Kotlin / Android
            "pom.xml".to_string(),
            "build.gradle".to_string(),
            "build.gradle.kts".to_string(),
            "AndroidManifest.xml".to_string(),
            // iOS / Swift
            "*.xcodeproj".to_string(),
            "*.xcworkspace".to_string(),
            "Package.swift".to_string(),
            // Docker / DevOps
            "Dockerfile".to_string(),
            "docker-compose.yml".to_string(),
            "Containerfile".to_string(),
            // Terraform
            "*.tf".to_string(),
            // Unity
            "ProjectSettings".to_string(), // Unity project root usually has this folder
            "Assets".to_string(), // Unity
            // R
            "*.Rproj".to_string(),
            // Elixir
            "mix.exs".to_string(),
            // Julia
            "Project.toml".to_string(),
            // Jupyter
            "*.ipynb".to_string(), 
        ],
        rules: vec![
            Rule {
                name: "Images".to_string(),
                patterns: vec!["*.jpg".to_string(), "*.jpeg".to_string(), "*.png".to_string(), "*.gif".to_string(), "*.svg".to_string(), "*.webp".to_string(), "*.bmp".to_string(), "*.tiff".to_string()],
                destination: "Media/Images".to_string(),
                active: true,
            },
            Rule {
                name: "Videos".to_string(),
                patterns: vec!["*.mp4".to_string(), "*.mkv".to_string(), "*.mov".to_string(), "*.avi".to_string(), "*.webm".to_string()],
                destination: "Media/Videos".to_string(),
                active: true,
            },
            Rule {
                name: "Audio".to_string(),
                patterns: vec!["*.mp3".to_string(), "*.wav".to_string(), "*.flac".to_string(), "*.aac".to_string(), "*.ogg".to_string()],
                destination: "Media/Audio".to_string(),
                active: true,
            },
            Rule {
                name: "Documents".to_string(),
                patterns: vec!["*.pdf".to_string(), "*.docx".to_string(), "*.doc".to_string(), "*.txt".to_string(), "*.xlsx".to_string(), "*.pptx".to_string(), "*.csv".to_string(), "*.md".to_string()],
                destination: "Documents".to_string(),
                active: true,
            },
            Rule {
                name: "Installers".to_string(),
                patterns: vec!["*.exe".to_string(), "*.msi".to_string()],
                destination: "Downloads/Installers".to_string(),
                active: true,
            },
            Rule {
                name: "Archives".to_string(),
                patterns: vec!["*.zip".to_string(), "*.rar".to_string(), "*.7z".to_string(), "*.tar.gz".to_string()],
                destination: "Downloads/Archives".to_string(),
                active: true,
            },
            Rule {
                name: "Shortcuts".to_string(),
                patterns: vec!["*.lnk".to_string(), "*.url".to_string()],
                destination: "Shortcuts".to_string(),
                active: true,
            },
        ],
    }
}
