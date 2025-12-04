/**
 * Project Page - Building Registration Wizard
 */
import { useNavigate } from 'react-router-dom';
import { ProjectInputWizard } from '@/components/Wizard/ProjectInputWizard';
import { ProjectFormData } from '@/components/Wizard/types';
import { toast } from 'sonner';

export default function ProjectPage() {
  const navigate = useNavigate();

  const handleComplete = (data: ProjectFormData) => {
    console.log('Project Data:', data);
    toast.success('Projeto salvo! Redirecionando para relatório...');
    // TODO: Navigate to report page or store data
    // navigate('/report');
  };

  return (
    <div className="min-h-screen bg-background">
      <ProjectInputWizard onComplete={handleComplete} />
    </div>
  );
}
