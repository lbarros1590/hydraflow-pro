/**
 * Hydraulic Page - Calculator with project context
 */
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import HydraulicCalculator from '@/components/HydraulicSystem/HydraulicCalculator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Building2, FileEdit, Flame } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ProjectFormData, ProjectStatus } from '@/components/Wizard/types';

interface Project {
  id: string;
  data: ProjectFormData;
  status: ProjectStatus;
  risk_class: string;
}

function extractHydraulicConfig(project: Project) {
  const data = project.data;
  const mainSector = data.sectors?.reduce((main, sector) => 
    sector.area > (main?.area || 0) ? sector : main
  , data.sectors?.[0]);

  const totalArea = data.sectors?.reduce((sum, s) => sum + s.area, 0) || 0;
  const avgFireLoad = data.sectors?.reduce((sum, s) => 
    sum + (s.fireLoad || 0) * s.area, 0
  ) / (totalArea || 1);

  return {
    occupancyCode: mainSector?.occupancyCode || 'A-2',
    fireLoadMJm2: Math.round(avgFireLoad) || 300,
    totalAreaM2: data.totalArea || totalArea,
    buildingHeight: data.totalHeight || 0,
  };
}

export default function HydraulicPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [hydraulicConfig, setHydraulicConfig] = useState<ReturnType<typeof extractHydraulicConfig> | null>(null);

  useEffect(() => {
    if (id) fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      const proj = data as Project;
      setProject(proj);
      const config = extractHydraulicConfig(proj);
      setHydraulicConfig(config);
      setShowImportDialog(true);
    } catch (error) {
      console.error('Error fetching project:', error);
      toast({
        title: 'Erro',
        description: 'Projeto não encontrado.',
        variant: 'destructive',
      });
      navigate('/app/projects');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[600px]" />
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(`/app/projects/${id}`)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
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
            
            <Link to={`/app/projects/${project.id}/edit`}>
              <Button variant="outline" size="sm" className="gap-2">
                <FileEdit className="h-4 w-4" />
                Editar Projeto
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Calculator */}
      <div className="p-4">
        <HydraulicCalculator initialConfig={hydraulicConfig || undefined} />
      </div>

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