/**
 * Project Page - Building Registration Wizard
 */
import { useNavigate } from 'react-router-dom';
import { ProjectInputWizard } from '@/components/Wizard/ProjectInputWizard';
import { ProjectFormData } from '@/components/Wizard/types';
import { useProject } from '@/contexts/ProjectContext';
import { toast } from 'sonner';

export default function ProjectPage() {
  const navigate = useNavigate();
  const { setProjectData } = useProject();

  const handleComplete = (data: ProjectFormData) => {
    setProjectData(data);
    toast.success('Projeto salvo! Redirecionando para calculador hidráulico...');
    setTimeout(() => navigate('/'), 500);
  };

  return (
    <div className="min-h-screen bg-background">
      <ProjectInputWizard onComplete={handleComplete} />
    </div>
  );
}
