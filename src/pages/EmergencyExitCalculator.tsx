/**
 * Calculadora de Saídas de Emergência - NTCB 13/2020
 * Módulo completo com estrutura hierárquica: Edificação → Pavimento → Setor
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Building2,
  Calculator,
  DoorOpen,
  Users,
  Plus,
  Trash2,
  ArrowLeft,
  RefreshCw,
  FileText,
  CheckCircle,
  XCircle,
  Printer,
  Download,
  ChevronDown,
  ChevronRight,
  Layers,
  LayoutGrid,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type { ProjectFormData } from '@/components/Wizard/types';
import {
  type EmergencyBuilding,
  type EmergencyFloor,
  type EmergencySector,
  type Door,
  type BuildingCalculationResult,
  calculateBuilding,
  OCCUPANCY_DENSITIES,
  getOccupancyDensity,
  openEmergencyExitReportForPrint,
  downloadEmergencyExitReportHTML,
} from '@/lib/emergencyExit';

interface Project {
  id: string;
  data: ProjectFormData;
}

const createId = () => crypto.randomUUID();

const defaultDoor: Omit<Door, 'id'> = {
  width: 0.80,
  height: 2.10,
  quantity: 1,
  observation: '',
};

const defaultSector: Omit<EmergencySector, 'id'> = {
  name: '',
  occupancyCode: 'C-2',
  densityM2PerPerson: 5,
  area: 0,
  doors: [],
};

const defaultFloor: Omit<EmergencyFloor, 'id'> = {
  name: 'Pavimento 01',
  sectors: [],
};

const defaultBuilding: Omit<EmergencyBuilding, 'id'> = {
  name: '',
  floors: [],
};

export default function EmergencyExitCalculator() {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [loadingProject, setLoadingProject] = useState(!!projectId);
  const [buildings, setBuildings] = useState<EmergencyBuilding[]>([]);
  const [results, setResults] = useState<Map<string, BuildingCalculationResult>>(new Map());
  const [expandedBuildings, setExpandedBuildings] = useState<Set<string>>(new Set());
  const [expandedFloors, setExpandedFloors] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (projectId) {
      fetchProject();
    } else {
      // Criar uma edificação de exemplo
      const exampleBuilding: EmergencyBuilding = {
        id: createId(),
        name: 'Edificação Principal',
        floors: [{
          id: createId(),
          name: 'Pavimento 01',
          sectors: [
            {
              id: createId(),
              name: 'Conveniência',
              occupancyCode: 'C-2',
              densityM2PerPerson: 5,
              area: 115.35,
              doors: [
                { id: createId(), width: 1.80, height: 2.00, quantity: 1, observation: '' },
                { id: createId(), width: 1.00, height: 2.10, quantity: 1, observation: '' },
              ],
            },
            {
              id: createId(),
              name: 'Despensa',
              occupancyCode: 'J-1',
              densityM2PerPerson: 30,
              area: 5.4,
              doors: [
                { id: createId(), width: 0.80, height: 2.15, quantity: 1, observation: '' },
              ],
            },
          ],
        }],
      };
      setBuildings([exampleBuilding]);
      setExpandedBuildings(new Set([exampleBuilding.id]));
      setExpandedFloors(new Set([exampleBuilding.floors[0].id]));
    }
  }, [projectId]);

  const fetchProject = async () => {
    try {
      setLoadingProject(true);
      const { data, error } = await supabase
        .from('projects')
        .select('id, data')
        .eq('id', projectId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProject(data as Project);
        const projectData = data.data as ProjectFormData;
        
        // Converter setores do projeto para estrutura de edificações
        if (projectData.sectors && projectData.sectors.length > 0) {
          const building: EmergencyBuilding = {
            id: createId(),
            name: projectData.projectName || 'Edificação do Projeto',
            floors: [{
              id: createId(),
              name: 'Pavimento 01',
              sectors: projectData.sectors.map(sector => ({
                id: sector.id,
                name: sector.name,
                occupancyCode: sector.occupancyCode || 'C-2',
                densityM2PerPerson: getOccupancyDensity(sector.occupancyCode || 'C-2')?.densityM2PerPerson || 5,
                area: sector.area || 0,
                doors: [],
              })),
            }],
          };
          setBuildings([building]);
          setExpandedBuildings(new Set([building.id]));
          setExpandedFloors(new Set([building.floors[0].id]));
          
          toast({
            title: 'Setores carregados',
            description: `${projectData.sectors.length} setor(es) importados do projeto. Adicione as portas existentes.`,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o projeto',
        variant: 'destructive',
      });
    } finally {
      setLoadingProject(false);
    }
  };

  // ========================================
  // Funções de manipulação de edificações
  // ========================================

  const addBuilding = () => {
    const newBuilding: EmergencyBuilding = {
      id: createId(),
      ...defaultBuilding,
      name: `Edificação ${buildings.length + 1}`,
    };
    setBuildings(prev => [...prev, newBuilding]);
    setExpandedBuildings(prev => new Set(prev).add(newBuilding.id));
  };

  const updateBuilding = (buildingId: string, updates: Partial<EmergencyBuilding>) => {
    setBuildings(prev => prev.map(b => b.id === buildingId ? { ...b, ...updates } : b));
    setResults(prev => {
      const newResults = new Map(prev);
      newResults.delete(buildingId);
      return newResults;
    });
  };

  const removeBuilding = (buildingId: string) => {
    setBuildings(prev => prev.filter(b => b.id !== buildingId));
    setResults(prev => {
      const newResults = new Map(prev);
      newResults.delete(buildingId);
      return newResults;
    });
  };

  // ========================================
  // Funções de manipulação de pavimentos
  // ========================================

  const addFloor = (buildingId: string) => {
    const building = buildings.find(b => b.id === buildingId);
    if (!building) return;

    const newFloor: EmergencyFloor = {
      id: createId(),
      name: `Pavimento ${String(building.floors.length + 1).padStart(2, '0')}`,
      sectors: [],
    };

    updateBuilding(buildingId, {
      floors: [...building.floors, newFloor],
    });
    setExpandedFloors(prev => new Set(prev).add(newFloor.id));
  };

  const updateFloor = (buildingId: string, floorId: string, updates: Partial<EmergencyFloor>) => {
    const building = buildings.find(b => b.id === buildingId);
    if (!building) return;

    updateBuilding(buildingId, {
      floors: building.floors.map(f => f.id === floorId ? { ...f, ...updates } : f),
    });
  };

  const removeFloor = (buildingId: string, floorId: string) => {
    const building = buildings.find(b => b.id === buildingId);
    if (!building) return;

    updateBuilding(buildingId, {
      floors: building.floors.filter(f => f.id !== floorId),
    });
  };

  // ========================================
  // Funções de manipulação de setores
  // ========================================

  const addSector = (buildingId: string, floorId: string) => {
    const building = buildings.find(b => b.id === buildingId);
    if (!building) return;

    const floor = building.floors.find(f => f.id === floorId);
    if (!floor) return;

    const newSector: EmergencySector = {
      id: createId(),
      ...defaultSector,
      name: `Setor ${floor.sectors.length + 1}`,
    };

    updateFloor(buildingId, floorId, {
      sectors: [...floor.sectors, newSector],
    });
  };

  const updateSector = (buildingId: string, floorId: string, sectorId: string, updates: Partial<EmergencySector>) => {
    const building = buildings.find(b => b.id === buildingId);
    if (!building) return;

    const floor = building.floors.find(f => f.id === floorId);
    if (!floor) return;

    // Se mudou a ocupação, atualizar a densidade
    if (updates.occupancyCode) {
      const density = getOccupancyDensity(updates.occupancyCode);
      if (density) {
        updates.densityM2PerPerson = density.densityM2PerPerson;
      }
    }

    updateFloor(buildingId, floorId, {
      sectors: floor.sectors.map(s => s.id === sectorId ? { ...s, ...updates } : s),
    });
  };

  const removeSector = (buildingId: string, floorId: string, sectorId: string) => {
    const building = buildings.find(b => b.id === buildingId);
    if (!building) return;

    const floor = building.floors.find(f => f.id === floorId);
    if (!floor) return;

    updateFloor(buildingId, floorId, {
      sectors: floor.sectors.filter(s => s.id !== sectorId),
    });
  };

  // ========================================
  // Funções de manipulação de portas
  // ========================================

  const addDoor = (buildingId: string, floorId: string, sectorId: string) => {
    const building = buildings.find(b => b.id === buildingId);
    if (!building) return;

    const floor = building.floors.find(f => f.id === floorId);
    if (!floor) return;

    const sector = floor.sectors.find(s => s.id === sectorId);
    if (!sector) return;

    const newDoor: Door = {
      id: createId(),
      ...defaultDoor,
    };

    updateSector(buildingId, floorId, sectorId, {
      doors: [...sector.doors, newDoor],
    });
  };

  const updateDoor = (buildingId: string, floorId: string, sectorId: string, doorId: string, updates: Partial<Door>) => {
    const building = buildings.find(b => b.id === buildingId);
    if (!building) return;

    const floor = building.floors.find(f => f.id === floorId);
    if (!floor) return;

    const sector = floor.sectors.find(s => s.id === sectorId);
    if (!sector) return;

    updateSector(buildingId, floorId, sectorId, {
      doors: sector.doors.map(d => d.id === doorId ? { ...d, ...updates } : d),
    });
  };

  const removeDoor = (buildingId: string, floorId: string, sectorId: string, doorId: string) => {
    const building = buildings.find(b => b.id === buildingId);
    if (!building) return;

    const floor = building.floors.find(f => f.id === floorId);
    if (!floor) return;

    const sector = floor.sectors.find(s => s.id === sectorId);
    if (!sector) return;

    updateSector(buildingId, floorId, sectorId, {
      doors: sector.doors.filter(d => d.id !== doorId),
    });
  };

  // ========================================
  // Cálculos
  // ========================================

  const calculateAll = () => {
    const newResults = new Map<string, BuildingCalculationResult>();
    
    buildings.forEach(building => {
      const result = calculateBuilding(building);
      newResults.set(building.id, result);
    });

    setResults(newResults);
    toast({
      title: 'Cálculos concluídos',
      description: `${buildings.length} edificação(ões) calculada(s)`,
    });
  };

  const handleExportPDF = (buildingId: string) => {
    const result = results.get(buildingId);
    if (result) {
      openEmergencyExitReportForPrint(result, project?.data.projectName);
    }
  };

  const handleDownloadReport = (buildingId: string) => {
    const result = results.get(buildingId);
    if (result) {
      const building = buildings.find(b => b.id === buildingId);
      const filename = `saidas_emergencia_${building?.name || 'edificacao'}.html`;
      downloadEmergencyExitReportHTML(result, project?.data.projectName, filename);
      toast({ title: 'Relatório baixado' });
    }
  };

  const toggleBuilding = (id: string) => {
    setExpandedBuildings(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const toggleFloor = (id: string) => {
    setExpandedFloors(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  // ========================================
  // Componente de Setor
  // ========================================

  const SectorCard = ({ 
    building, 
    floor, 
    sector 
  }: { 
    building: EmergencyBuilding; 
    floor: EmergencyFloor; 
    sector: EmergencySector;
  }) => {
    const occupancy = getOccupancyDensity(sector.occupancyCode);
    const population = sector.area > 0 ? Math.ceil(sector.area / sector.densityM2PerPerson) : 0;
    const upRequired = Math.ceil(population / 100);
    const widthRequired = upRequired * 0.55;
    const widthExisting = sector.doors.reduce((sum, d) => sum + d.width * d.quantity, 0);
    const isCompliant = widthExisting >= widthRequired;

    return (
      <div className="border rounded-lg p-4 space-y-4 bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-primary" />
            <span className="font-medium">{sector.name}</span>
            <Badge variant={isCompliant ? 'default' : 'destructive'} className="text-xs">
              {isCompliant ? 'Atende' : 'Não Atende'}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeSector(building.id, floor.id, sector.id)}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <Label className="text-xs">Nome do Setor</Label>
            <Input
              value={sector.name}
              onChange={e => updateSector(building.id, floor.id, sector.id, { name: e.target.value })}
              placeholder="Nome do setor"
            />
          </div>
          <div>
            <Label className="text-xs">Ocupação</Label>
            <Select
              value={sector.occupancyCode}
              onValueChange={code => updateSector(building.id, floor.id, sector.id, { occupancyCode: code })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {OCCUPANCY_DENSITIES.map(occ => (
                  <SelectItem key={occ.code} value={occ.code}>
                    {occ.code} - {occ.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Densidade</Label>
            <Input
              value={occupancy?.densityDescription || `1 Pessoa/${sector.densityM2PerPerson}m²`}
              disabled
              className="bg-muted"
            />
          </div>
          <div>
            <Label className="text-xs">Área Computada (m²)</Label>
            <Input
              type="number"
              step="0.01"
              value={sector.area}
              onChange={e => updateSector(building.id, floor.id, sector.id, { area: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>

        {/* Preview dos cálculos */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 p-3 bg-muted/50 rounded-lg text-sm">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">População</p>
            <p className="font-mono font-bold">{population}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Capacidade UP</p>
            <p className="font-mono font-bold">100</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">UPs Exigidas</p>
            <p className="font-mono font-bold">{upRequired}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Exigido (m)</p>
            <p className="font-mono font-bold">{widthRequired.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Existente (m)</p>
            <p className={`font-mono font-bold ${isCompliant ? 'text-green-600' : 'text-destructive'}`}>
              {widthExisting.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Portas */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium flex items-center gap-2">
              <DoorOpen className="h-4 w-4" />
              Portas Existentes ({sector.doors.length})
            </Label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addDoor(building.id, floor.id, sector.id)}
            >
              <Plus className="h-3 w-3 mr-1" />
              Porta
            </Button>
          </div>

          {sector.doors.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">Nenhuma porta cadastrada</p>
          ) : (
            <div className="space-y-2">
              {sector.doors.map((door, idx) => (
                <div key={door.id} className="flex items-center gap-2 p-2 border rounded bg-background">
                  <span className="text-xs text-muted-foreground w-6">#{idx + 1}</span>
                  <div className="flex-1 grid grid-cols-4 gap-2">
                    <div>
                      <Label className="text-xs">Qtd</Label>
                      <Input
                        type="number"
                        min="1"
                        value={door.quantity}
                        onChange={e => updateDoor(building.id, floor.id, sector.id, door.id, { quantity: parseInt(e.target.value) || 1 })}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Largura (m)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={door.width}
                        onChange={e => updateDoor(building.id, floor.id, sector.id, door.id, { width: parseFloat(e.target.value) || 0 })}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Altura (m)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={door.height}
                        onChange={e => updateDoor(building.id, floor.id, sector.id, door.id, { height: parseFloat(e.target.value) || 0 })}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Obs.</Label>
                      <Input
                        value={door.observation || ''}
                        onChange={e => updateDoor(building.id, floor.id, sector.id, door.id, { observation: e.target.value })}
                        placeholder="ABERTO"
                        className="h-8"
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeDoor(building.id, floor.id, sector.id, door.id)}
                    className="text-destructive h-8 w-8"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ========================================
  // Render
  // ========================================

  if (loadingProject) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          {projectId && (
            <Button variant="ghost" size="icon" onClick={() => navigate(`/app/projects/${projectId}`)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <DoorOpen className="h-6 w-6 text-primary" />
              Saídas de Emergência
              <Badge variant="outline" className="text-xs font-mono">NTCB 13/2020</Badge>
            </h1>
            <p className="text-muted-foreground">
              {project ? (
                <>Projeto: <span className="font-medium text-foreground">{project.data.projectName}</span></>
              ) : (
                'Dimensionamento conforme Anexo G Item 6.3'
              )}
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={addBuilding}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Edificação
          </Button>
          <Button onClick={calculateAll} disabled={buildings.length === 0}>
            <Calculator className="h-4 w-4 mr-2" />
            Calcular Todos
          </Button>
        </div>
      </div>

      {/* Edificações */}
      {buildings.map(building => {
        const result = results.get(building.id);
        const isExpanded = expandedBuildings.has(building.id);

        return (
          <Card key={building.id} className="overflow-hidden">
            <Collapsible open={isExpanded} onOpenChange={() => toggleBuilding(building.id)}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                      <Building2 className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle className="text-lg">{building.name || 'Edificação sem nome'}</CardTitle>
                        <CardDescription>
                          {building.floors.length} pavimento(s), {building.floors.reduce((sum, f) => sum + f.sectors.length, 0)} setor(es)
                        </CardDescription>
                      </div>
                      {result && (
                        <Badge variant={result.isCompliant ? 'default' : 'destructive'}>
                          {result.isCompliant ? 'Atende' : 'Não Atende'}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      {result && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => handleExportPDF(building.id)}>
                            <Printer className="h-4 w-4 mr-1" />
                            PDF
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDownloadReport(building.id)}>
                            <Download className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeBuilding(building.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="space-y-4">
                  {/* Nome da edificação */}
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label>Nome da Edificação</Label>
                      <Input
                        value={building.name}
                        onChange={e => updateBuilding(building.id, { name: e.target.value })}
                        placeholder="Nome da edificação"
                      />
                    </div>
                    <div className="flex-1">
                      <Label>Endereço (opcional)</Label>
                      <Input
                        value={building.address || ''}
                        onChange={e => updateBuilding(building.id, { address: e.target.value })}
                        placeholder="Endereço"
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Pavimentos */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Layers className="h-4 w-4" />
                        Pavimentos
                      </Label>
                      <Button variant="outline" size="sm" onClick={() => addFloor(building.id)}>
                        <Plus className="h-3 w-3 mr-1" />
                        Pavimento
                      </Button>
                    </div>

                    {building.floors.map(floor => {
                      const isFloorExpanded = expandedFloors.has(floor.id);

                      return (
                        <div key={floor.id} className="border rounded-lg overflow-hidden">
                          <Collapsible open={isFloorExpanded} onOpenChange={() => toggleFloor(floor.id)}>
                            <CollapsibleTrigger asChild>
                              <div className="flex items-center justify-between p-3 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-2">
                                  {isFloorExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                  <Layers className="h-4 w-4 text-primary" />
                                  <span className="font-medium">{floor.name}</span>
                                  <Badge variant="secondary" className="text-xs">
                                    {floor.sectors.length} setor(es)
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeFloor(building.id, floor.id)}
                                    className="text-destructive h-8 w-8"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                              <div className="p-4 space-y-4">
                                <div className="flex gap-4">
                                  <div className="flex-1">
                                    <Label className="text-xs">Nome do Pavimento</Label>
                                    <Input
                                      value={floor.name}
                                      onChange={e => updateFloor(building.id, floor.id, { name: e.target.value })}
                                      placeholder="Nome do pavimento"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">&nbsp;</Label>
                                    <Button variant="outline" onClick={() => addSector(building.id, floor.id)}>
                                      <Plus className="h-4 w-4 mr-2" />
                                      Adicionar Setor
                                    </Button>
                                  </div>
                                </div>

                                {/* Setores */}
                                <div className="space-y-3">
                                  {floor.sectors.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-4">
                                      Nenhum setor cadastrado. Clique em "Adicionar Setor" para começar.
                                    </p>
                                  ) : (
                                    floor.sectors.map(sector => (
                                      <SectorCard
                                        key={sector.id}
                                        building={building}
                                        floor={floor}
                                        sector={sector}
                                      />
                                    ))
                                  )}
                                </div>
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        </div>
                      );
                    })}

                    {building.floors.length === 0 && (
                      <p className="text-center text-muted-foreground py-4">
                        Nenhum pavimento cadastrado. Clique em "Pavimento" para adicionar.
                      </p>
                    )}
                  </div>

                  {/* Resultado da edificação */}
                  {result && (
                    <>
                      <Separator />
                      <Alert className={result.isCompliant ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-destructive bg-red-50 dark:bg-red-950'}>
                        {result.isCompliant ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-destructive" />
                        )}
                        <AlertTitle className={result.isCompliant ? 'text-green-600' : 'text-destructive'}>
                          {result.isCompliant ? 'ATENDE À NTCB 13/2020' : 'NÃO ATENDE À NTCB 13/2020'}
                        </AlertTitle>
                        <AlertDescription>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Área total:</span>
                              <p className="font-bold">{result.totalArea.toFixed(2)} m²</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">População:</span>
                              <p className="font-bold">{result.totalPopulation} pessoas</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Largura exigida:</span>
                              <p className="font-bold">{result.totalWidthRequired.toFixed(2)} m</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Largura existente:</span>
                              <p className={`font-bold ${result.isCompliant ? 'text-green-600' : 'text-destructive'}`}>
                                {result.totalWidthExisting.toFixed(2)} m
                              </p>
                            </div>
                          </div>
                          {result.warnings.length > 0 && (
                            <ul className="mt-3 text-destructive text-xs space-y-1">
                              {result.warnings.map((w, i) => (
                                <li key={i}>• {w}</li>
                              ))}
                            </ul>
                          )}
                        </AlertDescription>
                      </Alert>
                    </>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}

      {buildings.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">Nenhuma edificação cadastrada</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Clique em "Nova Edificação" para começar
            </p>
            <Button variant="outline" onClick={addBuilding} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Nova Edificação
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Info */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <Users className="h-5 w-5 text-primary mt-0.5" />
            <div className="space-y-2">
              <p className="font-medium text-foreground">Referência: NTCB 13/2020 - Saídas de Emergência (Anexo G Item 6.3)</p>
              <ul className="list-disc pl-4 space-y-1 text-xs">
                <li><strong>População</strong> = Área computada ÷ Densidade (arredondado para cima)</li>
                <li><strong>Capacidade por UP</strong> = 100 pessoas</li>
                <li><strong>UPs exigidas</strong> = População ÷ 100 (arredondado para cima)</li>
                <li><strong>Largura exigida</strong> = UPs × 0,55m</li>
                <li><strong>Largura mínima</strong> = 1,10m (2 UPs)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
