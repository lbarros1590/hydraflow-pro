/**
 * Step 3 - Intelligent Classification (Occupancy)
 * Now uses BuildingEditor for hierarchical structure
 */
import { UseFormReturn } from 'react-hook-form';
import { ProjectFormData } from '../types';
import { BuildingEditor } from '@/components/Project/BuildingEditor';
import FloatingChatbot from '@/components/FloatingChatbot';

interface ClassificationStepProps {
  form: UseFormReturn<ProjectFormData>;
}

export function ClassificationStep({ form }: ClassificationStepProps) {
  return (
    <div className="space-y-6">
      <BuildingEditor form={form} />
      <FloatingChatbot />
    </div>
  );
}
