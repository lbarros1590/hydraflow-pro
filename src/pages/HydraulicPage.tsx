/**
 * Hydraulic Calculator Page - With project context
 */
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProject, extractHydraulicConfig } from '@/contexts/ProjectContext';
import { HydraulicCalculator } from '@/components/HydraulicSystem/HydraulicCalculator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Building2, 
  FileEdit, 
  ChevronLeft,
  Flame
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function HydraulicPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProjectById, currentProject, setCurrentProject } = useProject();
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [hydraulicConfig, setHydraulicConfig] = useState<ReturnType<typeof extractHydraulicConfig> | null>(null);

  useEffect(() => {
    if (id) {
      const project = getProjectById(id);
      if (project) {
        setCurrentProject(project);
        const config = extractHydraulicConfig(project);
        setHydraulicConfig(config);
        setShowImportDialog(true);
      } else {
        navigate('/');
      }
    }
  }, [id, getProjectById, setCurrentProject, navigate]);

  const project = currentProject;

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando projeto...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="font-semibold">{project.data.projectName}</h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary" className="text-xs">
                      {project.data.sectors?.[0]?.occupancyCode || 'N/A'}
                    </Badge>
                    <span>{project.data.totalArea?.toLocaleString()} m²</span>
                    <span>{project.data.totalHeight}m</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Link to={`/wizard/${project.id}`}>
                <Button variant="outline" size="sm" className="gap-2">
                  <FileEdit className="h-4 w-4" />
                  Editar Projeto
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Calculator */}
      <HydraulicCalculator />

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dados do Projeto Carregados</DialogTitle>
            <DialogDescription>
              Os parâmetros do projeto foram importados para a calculadora hidráulica.
            </DialogDescription>
          </DialogHeader>
          
          {hydraulicConfig && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Ocupação</p>
                <p className="font-medium">{hydraulicConfig.occupancyCode}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Carga de Incêndio</p>
                <p className="font-medium flex items-center gap-1">
                  <Flame className="h-4 w-4 text-orange-500" />
                  {hydraulicConfig.fireLoadMJm2} MJ/m²
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Área Total</p>
                <p className="font-medium">{hydraulicConfig.totalAreaM2.toLocaleString()} m²</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Altura</p>
                <p className="font-medium">{hydraulicConfig.buildingHeight} m</p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setShowImportDialog(false)}>
              Continuar para Cálculo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
