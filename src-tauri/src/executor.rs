use crate::models::{FileOperation, OperationType, Plan};
use std::fs;

pub fn execute_plan(plan: &Plan) -> Result<Vec<FileOperation>, String> {
    let mut executed = Vec::new();
    
    for op in &plan.operations {
        if let Err(e) = execute_single_op(op) {
            // Rollback!
            // We must undo all `executed` ops in reverse order
            for done_op in executed.iter().rev() {
                let _ = undo_single_op(done_op);
            }
            return Err(format!("Failed at {}: {}. Rolled back.", op.destination.display(), e));
        }
        executed.push(op.clone());
    }
    
    Ok(executed)
}

fn execute_single_op(op: &FileOperation) -> Result<(), String> {
    match op.op_type {
        OperationType::Move => {
            if let Some(src) = &op.source {
                if let Some(parent) = op.destination.parent() {
                    fs::create_dir_all(parent).map_err(|e| e.to_string())?;
                }
                fs::rename(src, &op.destination).map_err(|e| e.to_string())?;
            }
        },
        OperationType::CreateDir => {
            fs::create_dir_all(&op.destination).map_err(|e| e.to_string())?;
        },
        _ => {}
    }
    Ok(())
}

pub fn undo_single_op(op: &FileOperation) -> Result<(), String> {
    match op.op_type {
        OperationType::Move => {
            if let Some(src) = &op.source {
               // Inverse: Move Destination back to Source
               if op.destination.exists() {
                   // Ensure parent of source exists (it should, unless we deleted it?)
                   if let Some(parent) = src.parent() {
                        let _ = fs::create_dir_all(parent);
                   }
                   fs::rename(&op.destination, src).map_err(|e| e.to_string())?;
               }
            }
        },
        OperationType::CreateDir => {
             // Inverse: Delete dir if empty
             let _ = fs::remove_dir(&op.destination);
        },
        _ => {}
    }
    Ok(())
}
