/**
 * Calculadora de Separação entre Edificações - NTCB 09/2020
 * Módulo completo com todos os cenários e geração de PDF
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
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  Building2,
  Calculator,
  ArrowLeftRight,
  Info,
  Download,
  RotateCcw,
  Plus,
  Trash2,
  ArrowLeft,
  RefreshCw,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Printer,
  Save,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { ProjectFormData, SectorFormData } from '@/components/Wizard/types';
import {
  calculateSeparation,
  determineSeverity,
  openReportForPrint,
  downloadReportHTML,
  FIRE_LOAD_TABLE,
  getFireLoadByOccupancy,
  getSeverityFromFireLoad,
  getSeverityDescription,
  type SimpleBuildingData,
  type SimpleCalculationInput,
  type SeparationCalculationResult,
  type SingleScenarioResult,
} from '@/lib/separacao';

interface RegisteredBuilding extends SimpleBuildingData {
  fromSector?: boolean;
  sectorId?: string;
  occupancyCode?: string;
  autoFireLoad?: boolean; // Se true, usa carga da ocupação
}

interface CalculationPair {
  id: string;
  expositoraId: string;
  emExposicaoId: string;
  existingDistance: number;
  reducers: {
    paredeCartaFogo: boolean;
    protecaoAberturas: 'none' | 'inferior' | 'igual';
    cortinaAgua: boolean;
  };
  result?: SeparationCalculationResult;
}

interface Project {
  id: string;
  data: ProjectFormData;
}

const defaultBuilding: RegisteredBuilding = {
  id: '',
  name: '',
  width: 20,
  height: 10,
  openingPercentage: 30,
  fireLoadMJm2: 500,
  hasSprinklers: false,
  trrf: 60,
  numberOfFloors: 1,
  totalArea: 200,
  occupancyCode: '',
  autoFireLoad: false,
};

export default function SeparationCalculator() {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [loadingProject, setLoadingProject] = useState(!!projectId);
  const [buildings, setBuildings] = useState<RegisteredBuilding[]>([]);
  const [calculations, setCalculations] = useState<CalculationPair[]>([]);
  const [hasFireDepartment, setHasFireDepartment] = useState(true);
  const [newBuilding, setNewBuilding] = useState<RegisteredBuilding>({
    ...defaultBuilding,
    id: crypto.randomUUID(),
  });
  const [globalExistingDistance, setGlobalExistingDistance] = useState<number>(70.24);
  const [saving, setSaving] = useState(false);
  const [savedCalculationId, setSavedCalculationId] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) {
      fetchProjectAndCalculation();
    } else {
      setBuildings([
        { ...defaultBuilding, id: '1', name: 'Bloco industrial', width: 46.97, height: 10, openingPercentage: 19, fireLoadMJm2: 500 },
        { ...defaultBuilding, id: '2', name: 'Alojamento funcionários', width: 14.35, height: 4.15, openingPercentage: 35, fireLoadMJm2: 300 },
      ]);
    }
  }, [projectId]);

  const fetchProjectAndCalculation = async () => {
    try {
      setLoadingProject(true);
      
      // Buscar projeto
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('id, data')
        .eq('id', projectId)
        .maybeSingle();

      if (projectError) throw projectError;

      if (projectData) {
        setProject(projectData as Project);
      }

      // Buscar cálculo salvo
      const { data: calcData, error: calcError } = await supabase
        .from('separation_calculations')
        .select('*')
        .eq('project_id', projectId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (calcError) throw calcError;

      if (calcData) {
        // Carregar cálculo salvo
        setSavedCalculationId(calcData.id);
        const savedBuildings = (calcData.buildings as unknown as RegisteredBuilding[]) || [];
        const savedCalcs = (calcData.calculations as unknown as CalculationPair[]) || [];
        const config = (calcData.config as unknown as { hasFireDepartment?: boolean; globalExistingDistance?: number }) || {};
        
        setBuildings(savedBuildings);
        setCalculations(savedCalcs);
        if (config.hasFireDepartment !== undefined) setHasFireDepartment(config.hasFireDepartment);
        if (config.globalExistingDistance !== undefined) setGlobalExistingDistance(config.globalExistingDistance);
        
        toast({
          title: 'Cálculo carregado',
          description: `${savedBuildings.length} edificação(ões) e ${savedCalcs.length} par(es) de cálculo`,
        });
      } else if (projectData) {
        // Carregar setores do projeto como edificações
        const pData = projectData.data as ProjectFormData;
        if (pData.sectors && pData.sectors.length > 0) {
          const buildingsFromSectors = pData.sectors.map((sector: SectorFormData) => ({
            ...defaultBuilding,
            id: sector.id,
            name: sector.name,
            width: Math.sqrt(sector.area || 100),
            height: (sector.floorHeight || 3) * (sector.numberOfFloors || 1),
            openingPercentage: 30,
            fireLoadMJm2: sector.fireLoad || 500,
            hasSprinklers: pData.mandatoryMeasures?.includes('spk') || false,
            trrf: 60,
            numberOfFloors: sector.numberOfFloors || 1,
            totalArea: sector.area || 100,
            fromSector: true,
            sectorId: sector.id,
          }));
          setBuildings(buildingsFromSectors);
          toast({
            title: 'Setores carregados',
            description: `${buildingsFromSectors.length} setor(es) importados do projeto`,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados',
        variant: 'destructive',
      });
    } finally {
      setLoadingProject(false);
    }
  };

  const saveCalculation = async () => {
    if (!projectId) {
      toast({ title: 'Erro', description: 'Salvar só está disponível em projetos', variant: 'destructive' });
      return;
    }

    try {
      setSaving(true);
      
      const dataToSave = {
        project_id: projectId,
        buildings: JSON.parse(JSON.stringify(buildings)),
        calculations: JSON.parse(JSON.stringify(calculations)),
        config: JSON.parse(JSON.stringify({ hasFireDepartment, globalExistingDistance })),
        is_active: true,
      };

      if (savedCalculationId) {
        // Atualizar existente
        const { error } = await supabase
          .from('separation_calculations')
          .update(dataToSave)
          .eq('id', savedCalculationId);
        
        if (error) throw error;
        toast({ title: 'Cálculo atualizado' });
      } else {
        // Criar novo
        const { data: newCalc, error } = await supabase
          .from('separation_calculations')
          .insert([dataToSave])
          .select('id')
          .single();
        
        if (error) throw error;
        setSavedCalculationId(newCalc.id);
        toast({ title: 'Cálculo salvo' });
      }
    } catch (error) {
      console.error('Error saving:', error);
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

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
        if (projectData.sectors && projectData.sectors.length > 0) {
          const buildingsFromSectors = projectData.sectors.map((sector: SectorFormData) => ({
            id: sector.id,
            name: sector.name,
            width: Math.sqrt(sector.area || 100),
            height: (sector.floorHeight || 3) * (sector.numberOfFloors || 1),
            openingPercentage: 30,
            fireLoadMJm2: sector.fireLoad || 500,
            hasSprinklers: projectData.mandatoryMeasures?.includes('spk') || false,
            trrf: 60,
            numberOfFloors: sector.numberOfFloors || 1,
            totalArea: sector.area || 100,
            fromSector: true,
            sectorId: sector.id,
          }));
          setBuildings(buildingsFromSectors);
          toast({
            title: 'Setores carregados',
            description: `${buildingsFromSectors.length} setor(es) importados do projeto`,
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

  const addBuilding = () => {
    if (!newBuilding.name.trim()) {
      toast({ title: 'Erro', description: 'Informe o nome da edificação', variant: 'destructive' });
      return;
    }
    setBuildings(prev => [...prev, { ...newBuilding, id: crypto.randomUUID() }]);
    setNewBuilding({ ...defaultBuilding, id: crypto.randomUUID() });
    toast({ title: 'Edificação adicionada' });
  };

  const removeBuilding = (id: string) => {
    setBuildings(prev => prev.filter(b => b.id !== id));
    setCalculations(prev => prev.filter(c => c.expositoraId !== id && c.emExposicaoId !== id));
  };

  const updateBuilding = (id: string, field: keyof RegisteredBuilding, value: string | number | boolean) => {
    setBuildings(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
    setCalculations(prev => prev.map(c =>
      (c.expositoraId === id || c.emExposicaoId === id) ? { ...c, result: undefined } : c
    ));
  };

  const addCalculationPair = () => {
    if (buildings.length < 2) {
      toast({ title: 'Erro', description: 'Cadastre pelo menos 2 edificações', variant: 'destructive' });
      return;
    }
    setCalculations(prev => [...prev, {
      id: crypto.randomUUID(),
      expositoraId: buildings[0].id,
      emExposicaoId: buildings[1].id,
      existingDistance: globalExistingDistance,
      reducers: {
        paredeCartaFogo: false,
        protecaoAberturas: 'none',
        cortinaAgua: false,
      },
    }]);
  };

  const removeCalculationPair = (id: string) => {
    setCalculations(prev => prev.filter(c => c.id !== id));
  };

  const updateCalculationPair = (id: string, updates: Partial<CalculationPair>) => {
    setCalculations(prev => prev.map(c =>
      c.id === id ? { ...c, ...updates, result: undefined } : c
    ));
  };

  const calculateAll = () => {
    const updatedCalculations = calculations.map(calc => {
      const expositora = buildings.find(b => b.id === calc.expositoraId);
      const emExposicao = buildings.find(b => b.id === calc.emExposicaoId);

      if (!expositora || !emExposicao) return calc;

      const input: SimpleCalculationInput = {
        expositora,
        emExposicao,
        hasFireDepartment,
        existingDistance: calc.existingDistance,
        reducers: calc.reducers,
      };

      const result = calculateSeparation(input);
      return { ...calc, result };
    });

    setCalculations(updatedCalculations);
    toast({ title: 'Cálculos concluídos', description: `${updatedCalculations.length} par(es) calculado(s)` });
  };

  const handleExportPDF = (calc: CalculationPair) => {
    if (calc.result) {
      openReportForPrint(calc.result);
    }
  };

  const handleDownloadReport = (calc: CalculationPair) => {
    if (calc.result) {
      const expositora = buildings.find(b => b.id === calc.expositoraId);
      const emExposicao = buildings.find(b => b.id === calc.emExposicaoId);
      const filename = `separacao_${expositora?.name || 'A'}_${emExposicao?.name || 'B'}.html`;
      downloadReportHTML(calc.result, filename);
      toast({ title: 'Relatório baixado' });
    }
  };

  const handleExportCSV = () => {
    const rows: string[] = [
      'Edificação Expositora,Edificação em Exposição,Severidade,Largura (m),Altura (m),Relação X,% Aberturas,Coef. a,Coef. b,Distância Separação (m),Distância Final (m),Distância Existente (m),Atende'
    ];

    calculations.forEach(calc => {
      if (calc.result) {
        const r1 = calc.result.scenario1;
        const r2 = calc.result.scenario2;

        rows.push(`${r1.expositoraName},${r1.emExposicaoName},${r1.severity},${r1.facadeWidth.toFixed(2)},${r1.facadeHeight.toFixed(2)},${r1.relationAdopted},${r1.openingPercentage},${r1.coefficientA.toFixed(2)},${r1.coefficientB},${r1.separationDistance.toFixed(2)},${r1.finalDistance.toFixed(2)},${r1.existingDistance.toFixed(2)},${r1.isCompliant ? 'SIM' : 'NÃO'}`);
        rows.push(`${r2.expositoraName},${r2.emExposicaoName},${r2.severity},${r2.facadeWidth.toFixed(2)},${r2.facadeHeight.toFixed(2)},${r2.relationAdopted},${r2.openingPercentage},${r2.coefficientA.toFixed(2)},${r2.coefficientB},${r2.separationDistance.toFixed(2)},${r2.finalDistance.toFixed(2)},${r2.existingDistance.toFixed(2)},${r2.isCompliant ? 'SIM' : 'NÃO'}`);
      }
    });

    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calculo_separacao_ntcb09${projectId ? `_${projectId}` : ''}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Exportado com sucesso' });
  };

  const handleReset = () => {
    if (project) {
      fetchProject();
    } else {
      setBuildings([
        { ...defaultBuilding, id: '1', name: 'Bloco industrial', width: 46.97, height: 10, openingPercentage: 19, fireLoadMJm2: 500 },
        { ...defaultBuilding, id: '2', name: 'Alojamento funcionários', width: 14.35, height: 4.15, openingPercentage: 35, fireLoadMJm2: 300 },
      ]);
    }
    setCalculations([]);
  };

  // Componente para exibir tabela de resultado conforme layout do print
  const ResultTable = ({ scenario, isFirst }: { scenario: SingleScenarioResult; isFirst?: boolean }) => (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      {/* Header */}
      <div className="bg-muted px-4 py-2 border-b border-border">
        <h4 className="font-semibold text-sm">3.1 CÁLCULO DE SEPARAÇÃO (NTCB 09/2020)</h4>
      </div>

      {/* Edificações */}
      <div className="grid grid-cols-2 border-b border-border">
        <div className="p-3 border-r border-border">
          <p className="text-xs text-muted-foreground">EDIFICAÇÃO EXPOSITORA:</p>
          <p className="font-semibold">{scenario.expositoraName}</p>
        </div>
        <div className="p-3">
          <p className="text-xs text-muted-foreground">EDIFICAÇÃO EM EXPOSIÇÃO:</p>
          <p className="font-semibold">{scenario.emExposicaoName}</p>
        </div>
      </div>

      {/* Dados principais */}
      <div className="grid grid-cols-6 border-b border-border text-sm">
        <div className="p-2 border-r border-border text-center">
          <p className="text-xs text-muted-foreground">Severidade da<br />carga de incêndio<br />- y</p>
          <p className="font-mono font-bold text-lg mt-1">{scenario.severity}</p>
        </div>
        <div className="p-2 border-r border-border text-center">
          <p className="text-xs text-muted-foreground">Largura<br />(Fachada)</p>
          <p className="font-mono mt-1">{scenario.facadeWidth.toFixed(2)} m</p>
        </div>
        <div className="p-2 border-r border-border text-center">
          <p className="text-xs text-muted-foreground">Altura<br />(Fachada)</p>
          <p className="font-mono mt-1">{scenario.facadeHeight.toFixed(2)} m</p>
        </div>
        <div className="p-2 border-r border-border text-center">
          <p className="text-xs text-muted-foreground">Relação largura/altura ou<br />altura/largura (fachada) - X</p>
          <p className="font-mono mt-1">{scenario.relationCalculated.toFixed(2)}( Adotado {scenario.relationAdopted})</p>
        </div>
        <div className="p-2 border-r border-border text-center col-span-2">
          <p className="text-xs text-muted-foreground">Coeficientes</p>
          <div className="flex justify-center gap-4 mt-1">
            <div>
              <span className="text-xs text-muted-foreground">a</span>
              <p className="font-mono font-bold">{scenario.coefficientA.toFixed(2)}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">b</span>
              <p className="font-mono font-bold">{scenario.coefficientB} m</p>
            </div>
          </div>
        </div>
      </div>

      {/* Porcentagem e fórmula */}
      <div className="grid grid-cols-2 border-b border-border text-sm">
        <div className="p-2 border-r border-border">
          <p className="text-xs text-muted-foreground">Porcentagem de aberturas</p>
          <p className="font-mono font-bold text-lg">{scenario.openingPercentage}%</p>
        </div>
        <div className="p-2">
          <p className="text-xs text-muted-foreground">Distância de separação - a x (largura ou altura) + b</p>
          <p className="font-mono font-bold">{scenario.coefficientA.toFixed(2)}*{scenario.dimensionValue.toFixed(2)}+{scenario.coefficientB}</p>
        </div>
      </div>

      {/* Redutor */}
      <div className="grid grid-cols-2 border-b border-border text-sm">
        <div className="p-2 border-r border-border">
          <p className="text-xs text-muted-foreground">Redutor de distância de separação de acordo com a Tabela B-1<br />(Tipo de proteção)</p>
          <p className="font-mono text-muted-foreground mt-1">
            {scenario.reducers.length > 0 ? scenario.reducers.map(r => r.description).join('; ') : '-------'}
          </p>
        </div>
        <div className="p-2">
          <p className="text-xs text-muted-foreground">Vantagens</p>
          <p className="font-mono text-muted-foreground mt-1">
            {scenario.reducers.length > 0 ? scenario.reducers.map(r => `${r.reductionPercent.toFixed(0)}%`).join(', ') : '-------'}
          </p>
        </div>
      </div>

      {/* Distância Total */}
      <div className="p-3 bg-primary/5 border-b border-border">
        <p className="text-xs text-muted-foreground">DISTÂNCIA TOTAL = Distância de separação (D) subtraída da vantagem</p>
        <p className="text-2xl font-bold font-mono text-primary">{scenario.finalDistance.toFixed(2)}</p>
      </div>

      {/* Distância Prevista */}
      <div className="p-3">
        <p className="text-xs text-muted-foreground">Distância (prevista / existente)</p>
        <p className="font-mono font-bold text-lg">{scenario.existingDistance.toFixed(2)}</p>
      </div>
    </div>
  );

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
              <ArrowLeftRight className="h-6 w-6 text-primary" />
              Separação entre Edificações
              <Badge variant="outline" className="text-xs font-mono">NTCB 09/2020</Badge>
            </h1>
            <p className="text-muted-foreground">
              {project ? (
                <>Projeto: <span className="font-medium text-foreground">{project.data.projectName}</span></>
              ) : (
                'Isolamento de risco por radiação térmica'
              )}
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Limpar
          </Button>
          {projectId && (
            <>
              <Button variant="outline" onClick={fetchProjectAndCalculation}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Recarregar
              </Button>
              <Button variant="outline" onClick={saveCalculation} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Salvando...' : savedCalculationId ? 'Atualizar' : 'Salvar'}
              </Button>
            </>
          )}
          <Button variant="outline" onClick={handleExportCSV} disabled={calculations.every(c => !c.result)}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button onClick={calculateAll} disabled={calculations.length === 0}>
            <Calculator className="h-4 w-4 mr-2" />
            Calcular Todos
          </Button>
        </div>
      </div>

      {/* Info */}
      {project && (
        <Alert>
          <Building2 className="h-4 w-4" />
          <AlertDescription>
            Edificações carregadas dos setores do projeto. Ajuste largura, altura e porcentagem de aberturas conforme as fachadas reais.
          </AlertDescription>
        </Alert>
      )}

      {/* Configuração Global */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Configurações Globais</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-6 items-end">
          <div className="flex items-center gap-3">
            <Label>Coeficiente β:</Label>
            <Select value={hasFireDepartment ? 'com' : 'sem'} onValueChange={v => setHasFireDepartment(v === 'com')}>
              <SelectTrigger className="w-[280px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="com">β₁ = 1,5m (município com CB)</SelectItem>
                <SelectItem value="sem">β₂ = 3,0m (município sem CB)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <Label>Distância Existente Padrão (m):</Label>
            <Input
              type="number"
              step="0.01"
              value={globalExistingDistance}
              onChange={e => setGlobalExistingDistance(parseFloat(e.target.value) || 0)}
              className="w-28"
            />
          </div>
        </CardContent>
      </Card>

      {/* Edificações Cadastradas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Edificações Cadastradas
          </CardTitle>
          <CardDescription>
            Cadastre as edificações com os dados das fachadas para cálculo de separação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Accordion type="multiple" defaultValue={buildings.map(b => b.id)}>
            {buildings.map(building => (
              <AccordionItem key={building.id} value={building.id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-primary" />
                    <span className="font-medium">{building.name || 'Sem nome'}</span>
                    <Badge variant="outline">Severidade {determineSeverity(building.fireLoadMJm2, building.hasSprinklers)}</Badge>
                    <Badge variant="secondary" className="text-xs">{building.width}×{building.height}m</Badge>
                    {building.fromSector && (
                      <Badge variant="secondary" className="text-xs">Do projeto</Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="p-4 space-y-4">
                    {/* Carga de Incêndio Automática - NTCB 07 */}
                    <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="flex items-center gap-2 mb-3">
                        <Switch
                          checked={building.autoFireLoad || false}
                          onCheckedChange={v => {
                            if (v && building.occupancyCode) {
                              const fireLoad = getFireLoadByOccupancy(building.occupancyCode);
                              if (fireLoad) {
                                updateBuilding(building.id, 'fireLoadMJm2', fireLoad.fireLoadMJm2);
                              }
                            }
                            updateBuilding(building.id, 'autoFireLoad', v);
                          }}
                        />
                        <Label className="text-sm font-medium">Calcular carga de incêndio pela ocupação (NTCB 07)</Label>
                      </div>
                      {building.autoFireLoad && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="md:col-span-2">
                            <Label className="text-xs">Ocupação (NTCB 07/2020)</Label>
                            <Select
                              value={building.occupancyCode || ''}
                              onValueChange={code => {
                                const fireLoad = getFireLoadByOccupancy(code);
                                updateBuilding(building.id, 'occupancyCode', code);
                                if (fireLoad) {
                                  updateBuilding(building.id, 'fireLoadMJm2', fireLoad.fireLoadMJm2);
                                }
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a ocupação" />
                              </SelectTrigger>
                              <SelectContent className="max-h-[300px]">
                                {FIRE_LOAD_TABLE.map(occ => (
                                  <SelectItem key={occ.code} value={occ.code}>
                                    {occ.code} - {occ.description} ({occ.fireLoadMJm2} MJ/m²)
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">Severidade</Label>
                            <div className="h-10 flex items-center px-3 bg-muted rounded-md text-sm font-mono">
                              {getSeverityFromFireLoad(building.fireLoadMJm2)} - {getSeverityDescription(getSeverityFromFireLoad(building.fireLoadMJm2))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      <div>
                        <Label className="text-xs">Nome/Identificação</Label>
                        <Input
                          value={building.name}
                          onChange={e => updateBuilding(building.id, 'name', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Largura Fachada (m)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={building.width}
                          onChange={e => updateBuilding(building.id, 'width', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Altura Fachada (m)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={building.height}
                          onChange={e => updateBuilding(building.id, 'height', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">% Aberturas</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={building.openingPercentage}
                          onChange={e => updateBuilding(building.id, 'openingPercentage', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Carga Incêndio (MJ/m²)</Label>
                        <Input
                          type="number"
                          value={building.fireLoadMJm2}
                          onChange={e => updateBuilding(building.id, 'fireLoadMJm2', parseFloat(e.target.value) || 0)}
                          disabled={building.autoFireLoad}
                          className={building.autoFireLoad ? 'bg-muted' : ''}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">TRRF (min)</Label>
                        <Input
                          type="number"
                          value={building.trrf || 0}
                          onChange={e => updateBuilding(building.id, 'trrf', parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={building.hasSprinklers}
                          onCheckedChange={v => updateBuilding(building.id, 'hasSprinklers', v)}
                        />
                        <Label className="text-sm">Possui Sprinklers</Label>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeBuilding(building.id)} className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remover
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <Separator />

          {/* Nova Edificação */}
          <div className="p-4 border-2 border-dashed rounded-lg space-y-3">
            <p className="font-medium text-sm text-muted-foreground">Nova Edificação</p>
            
            {/* Ocupação NTCB 07 */}
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <Switch
                  checked={newBuilding.autoFireLoad || false}
                  onCheckedChange={v => {
                    if (v && newBuilding.occupancyCode) {
                      const fireLoad = getFireLoadByOccupancy(newBuilding.occupancyCode);
                      if (fireLoad) {
                        setNewBuilding(prev => ({ ...prev, fireLoadMJm2: fireLoad.fireLoadMJm2, autoFireLoad: v }));
                        return;
                      }
                    }
                    setNewBuilding(prev => ({ ...prev, autoFireLoad: v }));
                  }}
                />
                <Label className="text-sm">Usar carga de incêndio da ocupação (NTCB 07)</Label>
              </div>
              {newBuilding.autoFireLoad && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Ocupação</Label>
                    <Select
                      value={newBuilding.occupancyCode || ''}
                      onValueChange={code => {
                        const fireLoad = getFireLoadByOccupancy(code);
                        setNewBuilding(prev => ({
                          ...prev,
                          occupancyCode: code,
                          fireLoadMJm2: fireLoad?.fireLoadMJm2 || prev.fireLoadMJm2,
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a ocupação" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {FIRE_LOAD_TABLE.map(occ => (
                          <SelectItem key={occ.code} value={occ.code}>
                            {occ.code} - {occ.description} ({occ.fireLoadMJm2} MJ/m²)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Severidade Calculada</Label>
                    <div className="h-10 flex items-center px-3 bg-muted rounded-md text-sm font-mono">
                      {getSeverityFromFireLoad(newBuilding.fireLoadMJm2)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              <div>
                <Label className="text-xs">Nome</Label>
                <Input
                  value={newBuilding.name}
                  onChange={e => setNewBuilding(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome da edificação"
                />
              </div>
              <div>
                <Label className="text-xs">Largura (m)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newBuilding.width}
                  onChange={e => setNewBuilding(prev => ({ ...prev, width: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label className="text-xs">Altura (m)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newBuilding.height}
                  onChange={e => setNewBuilding(prev => ({ ...prev, height: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label className="text-xs">% Aberturas</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={newBuilding.openingPercentage}
                  onChange={e => setNewBuilding(prev => ({ ...prev, openingPercentage: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label className="text-xs">Carga Incêndio (MJ/m²)</Label>
                <Input
                  type="number"
                  value={newBuilding.fireLoadMJm2}
                  onChange={e => setNewBuilding(prev => ({ ...prev, fireLoadMJm2: parseFloat(e.target.value) || 0 }))}
                  disabled={newBuilding.autoFireLoad}
                  className={newBuilding.autoFireLoad ? 'bg-muted' : ''}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={addBuilding} variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pares de Cálculo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Cálculos de Separação
          </CardTitle>
          <CardDescription>
            Configure os pares de edificações e redutores. A norma exige os dois cenários: Expositora→Exposição e Exposição→Expositora.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {calculations.map((calc, idx) => {
            const expositora = buildings.find(b => b.id === calc.expositoraId);
            const emExposicao = buildings.find(b => b.id === calc.emExposicaoId);

            return (
              <div key={calc.id} className="border rounded-lg overflow-hidden">
                {/* Config do par */}
                <div className="p-4 bg-muted/30 space-y-4">
                  <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex-1 min-w-[180px]">
                      <Label className="text-xs">Edificação A</Label>
                      <Select
                        value={calc.expositoraId}
                        onValueChange={v => updateCalculationPair(calc.id, { expositoraId: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {buildings.map(b => (
                            <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <ArrowLeftRight className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 min-w-[180px]">
                      <Label className="text-xs">Edificação B</Label>
                      <Select
                        value={calc.emExposicaoId}
                        onValueChange={v => updateCalculationPair(calc.id, { emExposicaoId: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {buildings.filter(b => b.id !== calc.expositoraId).map(b => (
                            <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="min-w-[140px]">
                      <Label className="text-xs">Distância Existente (m)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={calc.existingDistance}
                        onChange={e => updateCalculationPair(calc.id, { existingDistance: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeCalculationPair(calc.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  {/* Redutores */}
                  <div className="flex flex-wrap gap-4 items-center pt-2 border-t border-border">
                    <span className="text-sm font-medium">Redutores (Tabela A-2):</span>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={calc.reducers.paredeCartaFogo}
                        onCheckedChange={v => updateCalculationPair(calc.id, {
                          reducers: { ...calc.reducers, paredeCartaFogo: v }
                        })}
                      />
                      <Label className="text-xs">Parede corta-fogo</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={calc.reducers.protecaoAberturas}
                        onValueChange={(v: 'none' | 'inferior' | 'igual') => updateCalculationPair(calc.id, {
                          reducers: { ...calc.reducers, protecaoAberturas: v }
                        })}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Sem proteção aberturas</SelectItem>
                          <SelectItem value="inferior">TRRF 30min inferior à parede</SelectItem>
                          <SelectItem value="igual">TRRF igual à parede</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={calc.reducers.cortinaAgua}
                        onCheckedChange={v => updateCalculationPair(calc.id, {
                          reducers: { ...calc.reducers, cortinaAgua: v }
                        })}
                      />
                      <Label className="text-xs">Cortina d'água</Label>
                    </div>
                  </div>
                </div>

                {/* Resultado */}
                {calc.result && (
                  <div className="p-4 space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <ResultTable scenario={calc.result.scenario1} isFirst />
                      <ResultTable scenario={calc.result.scenario2} />
                    </div>

                    {/* Resumo */}
                    <Alert className={calc.result.isCompliant ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-destructive bg-red-50 dark:bg-red-950'}>
                      {calc.result.isCompliant ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                      <AlertTitle className={calc.result.isCompliant ? 'text-green-600' : 'text-destructive'}>
                        {calc.result.isCompliant ? 'ATENDE À NORMA' : 'NÃO ATENDE À NORMA'}
                      </AlertTitle>
                      <AlertDescription className="mt-2">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Distância mínima exigida:</span>
                            <p className="font-bold text-lg">{calc.result.minimumDistance.toFixed(2)} m</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Distância existente:</span>
                            <p className="font-bold text-lg">{calc.result.existingDistance.toFixed(2)} m</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Ponto mais desfavorável:</span>
                            <p className="font-medium">
                              {calc.result.mostUnfavorablePoint === 'scenario1'
                                ? `${calc.result.scenario1.expositoraName} → ${calc.result.scenario1.emExposicaoName}`
                                : `${calc.result.scenario2.expositoraName} → ${calc.result.scenario2.emExposicaoName}`}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Ponto mais favorável:</span>
                            <p className="font-medium">
                              {calc.result.mostFavorablePoint === 'scenario1'
                                ? `${calc.result.scenario1.expositoraName} → ${calc.result.scenario1.emExposicaoName}`
                                : `${calc.result.scenario2.expositoraName} → ${calc.result.scenario2.emExposicaoName}`}
                            </p>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>

                    {/* Ações do resultado */}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleExportPDF(calc)}>
                        <Printer className="h-4 w-4 mr-2" />
                        Imprimir PDF
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDownloadReport(calc)}>
                        <FileText className="h-4 w-4 mr-2" />
                        Baixar Relatório
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <Button onClick={addCalculationPair} variant="outline" className="w-full" disabled={buildings.length < 2}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Par de Cálculo
          </Button>
        </CardContent>
      </Card>

      {/* Info da norma */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-primary mt-0.5" />
            <div className="text-sm text-muted-foreground space-y-2">
              <p className="font-medium text-foreground">Referência: NTCB 09/2020 - Separação entre Edificações (Isolamento de Risco)</p>
              <p>
                Fórmula: <span className="font-mono bg-muted px-2 py-0.5 rounded">D = α × (menor dimensão) + β</span>
              </p>
              <ul className="list-disc pl-4 space-y-1 text-xs">
                <li><strong>α</strong>: coeficiente da Tabela A-1 (baseado em severidade, % aberturas e relação L/H)</li>
                <li><strong>β₁</strong> = 1,5m (município com Corpo de Bombeiros) | <strong>β₂</strong> = 3,0m (sem CB)</li>
                <li><strong>X</strong>: relação largura/altura ou altura/largura (sempre ≥ 1)</li>
                <li>O cálculo é realizado nos dois sentidos obrigatórios (Expositora→Exposição e vice-versa)</li>
                <li>A distância final é a maior entre os dois cenários</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
