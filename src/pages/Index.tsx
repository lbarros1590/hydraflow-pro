import { Link } from 'react-router-dom';
import { HydraulicCalculator } from '@/components/HydraulicSystem/HydraulicCalculator';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

const Index = () => {
  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-10">
        <Link to="/projeto">
          <Button variant="outline" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Cadastro PSCIP
          </Button>
        </Link>
      </div>
      <HydraulicCalculator />
    </div>
  );
};

export default Index;
