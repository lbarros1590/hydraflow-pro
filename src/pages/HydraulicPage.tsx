/**
 * Hydraulic Page - Calculator with project context
 */
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import HydraulicCalculator from '@/components/HydraulicSystem/HydraulicCalculator';
import { SavedCalculations } from '@/components/HydraulicSystem/SavedCalculations';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Building2, FileEdit, Flame, History } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import type { ProjectFormData, ProjectStatus } from '@/components/Wizard/types';

interface Project {
  id: string;
  data: ProjectFormData;
  status: ProjectStatus;
  risk_class: string;
}

interface HydraulicCalculation {
  id: string;
  project_id: string;
  name: string;
  version: number;
  is_active: boolean;
  network_data: any;
  results: any;
  accessories: any;
  connections: any;
  report_data: any;
  created_at: string;
}

// Extrai configuração hidráulica usando a CLASSIFICAÇÃO PRINCIPAL do projeto
function extractHydraulicConfig(project: Project) {
  const data = project.data;
  
  // PRIORIDADE 1: Usa a classificação PRINCIPAL do projeto (TABELA 3)
  const mainClass = data.mainClassification;
  if (mainClass?.division && mainClass?.fireLoad) {
    return {
      occupancyCode: mainClass.division,
      fireLoadMJm2: mainClass.fireLoad,
      totalAreaM2: data.totalArea || 0,
      buildingHeight: data.totalHeight || 0,
    };
  }

  // PRIORIDADE 2 (Fallback): Busca nos setores com maior área
  let maxFireLoad = 300;
  let mainOccupancy = 'A-2';
  let totalArea = 0;

  data.buildings?.forEach(building => {
    building.floors?.forEach(floor => {
      floor.sectors?.forEach(sector => {
        totalArea += sector.area || 0;
        if (sector.fireLoad && sector.fireLoad > maxFireLoad) {
          maxFireLoad = sector.fireLoad;
          mainOccupancy = sector.occupancyCode || 'A-2';
        }
      });
    });
  });

  // Fallback legado para projetos antigos com setores no nível raiz
  if (data.sectors && data.sectors.length > 0) {
    const legacyTotalArea = data.sectors.reduce((sum, s) => sum + s.area, 0);
    const avgFireLoad = data.sectors.reduce((sum, s) => 
      sum + (s.fireLoad || 0) * s.area, 0
    ) / (legacyTotalArea || 1);
    
    const mainSector = data.sectors.reduce((main, sector) => 
      sector.area > (main?.area || 0) ? sector : main
    , data.sectors[0]);

    return {
      occupancyCode: mainSector?.occupancyCode || mainOccupancy,
      fireLoadMJm2: Math.round(avgFireLoad) || maxFireLoad,
      totalAreaM2: data.totalArea || legacyTotalArea || totalArea,
      buildingHeight: data.totalHeight || 0,
    };
  }

  return {
    occupancyCode: mainOccupancy,
    fireLoadMJm2: maxFireLoad,
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
  const [loadedCalculation, setLoadedCalculation] = useState<HydraulicCalculation | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

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

  const handleSaveToProject = useCallback(async (data: {
    network_data: any;
    results: any;
    accessories: any;
    connections: any;
  }) => {
    if (!id) return;

    // Get current version count
    const { data: existing } = await supabase
      .from('hydraulic_calculations')
      .select('version')
      .eq('project_id', id)
      .order('version', { ascending: false })
      .limit(1);

    const nextVersion = (existing?.[0]?.version || 0) + 1;

    // Deactivate all previous calculations
    await supabase
      .from('hydraulic_calculations')
      .update({ is_active: false })
      .eq('project_id', id);

    // Insert new calculation
    const { error } = await supabase
      .from('hydraulic_calculations')
      .insert({
        project_id: id,
        name: `Cálculo v${nextVersion}`,
        version: nextVersion,
        is_active: true,
        network_data: data.network_data,
        results: data.results,
        accessories: data.accessories,
        connections: data.connections,
      });

    if (error) throw error;

    // Refresh saved calculations list
    setRefreshKey(prev => prev + 1);
  }, [id]);

  const handleLoadCalculation = useCallback((calc: HydraulicCalculation) => {
    setLoadedCalculation(calc);
    toast({
      title: 'Carregando...',
      description: `Restaurando "${calc.name}"`,
    });
  }, [toast]);

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
            
            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <History className="h-4 w-4" />
                    Cálculos Salvos
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-[400px] sm:w-[540px]">
                  <SheetHeader>
                    <SheetTitle>Histórico de Cálculos</SheetTitle>
                    <SheetDescription>
                      Cálculos salvos neste projeto
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    <SavedCalculations 
                      key={refreshKey}
                      projectId={id!} 
                      onLoad={handleLoadCalculation} 
                    />
                  </div>
                </SheetContent>
              </Sheet>
              <Link to={`/app/projects/${project.id}/edit`}>
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
      <div className="p-4">
        <HydraulicCalculator 
          initialConfig={hydraulicConfig || undefined}
          projectId={id}
          onSaveToProject={handleSaveToProject}
          loadedCalculation={loadedCalculation}
        />
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
