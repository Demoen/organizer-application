export interface FileItem {
    path: string;
    name: string;
    extension?: string;
    size: number;
    is_dir: boolean;
    project_root?: string;
}

export interface Project {
    path: string;
    name: string;
    type_guess: string;
    internal_name?: string;
}

export interface Config {
    ignore_patterns: string[];
    project_markers: string[];
}

export interface Plan {
    summary: string;
    operations: Operation[];
}

export interface Operation {
    id: string; // generated
    op_type: "Move" | "CreateDir" | "Copy" | "Delete" | "Ignore";
    source?: string;
    destination: string;
    reason: string;
}
