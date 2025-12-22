import { OperationCard } from "./OperationCard";
import type { Operation } from "../../types";
import { motion } from "framer-motion";

interface OperationsListProps {
    operations: Operation[];
    onRemoveOperation?: (index: number) => void;
}

export const OperationsList: React.FC<OperationsListProps> = ({ operations, onRemoveOperation }) => {
    return (
        <div className="space-y-3 pb-20">
            {operations.map((op, index) => (
                <OperationCard
                    key={op.id || index}
                    operation={op}
                    index={index}
                    onRemove={onRemoveOperation ? () => onRemoveOperation(index) : undefined}
                />
            ))}

            {operations.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20 text-zinc-500"
                >
                    No operations planned.
                </motion.div>
            )}
        </div>
    );
};
