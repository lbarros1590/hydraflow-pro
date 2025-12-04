import { Link } from 'react-router-dom';
import { HydraulicCalculator } from '@/components/HydraulicSystem/HydraulicCalculator';
import { Button } from '@/components/ui/button';
import { FileText, Building2 } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';
import { Badge } from '@/components/ui/badge';

const Index = () => {
  const { projectData } = useProject();

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {projectData && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            {projectData.projectName}
          </Badge>
        )}
        <Link to="/projeto">
          <Button variant="outline" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {projectData ? 'Editar Projeto' : 'Cadastro PSCIP'}
          </Button>
        </Link>
      </div>
      <HydraulicCalculator />
    </div>
  );
};

export default Index;
