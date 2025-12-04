/**
 * Calculadora Hidráulica Principal - NTCB 19/2020
 * Corpo de Bombeiros Militar do Estado de Mato Grosso
 * 
 * FUNCIONALIDADES:
 * - Cálculo hidráulico completo
 * - Salvar/Carregar rede em JSON
 * - Exportar relatório
 */

import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Calculator, RotateCcw, Download, Upload, Save, FileText } from 'lucide-react';
import { NetworkEditor } from './NetworkEditor';
import { BuildingConfig } from './BuildingConfig';
import { ResultsPanel } from './ResultsPanel';
import { NetworkVisualization } from './NetworkVisualization';
import { calculateSystem } from '@/engine/calculateSystem';
import type { Node, Pipe, SystemResult } from '@/models/types';
import { mm_to_m, m_to_mm } from '@/core/units';
import { getHazenWilliamsC, getEquivalentLength, ACCESSORY_TYPES } from '@/core/equivalentLength';
import { generateWordReport } from '@/utils/wordExport';

// Dados de exemplo para demonstração
const DEMO_NODES: Node[] = [
  { id: 'N1', type: 'source', name: 'Reservatório', elevation: 0 },
  { id: 'N2', type: 'junction', name: 'Derivação 1', elevation: 3 },
  { id: 'N3', type: 'junction', name: 'Derivação 2', elevation: 6 },
  { id: 'N4', type: 'hydrant', name: 'Hidrante 1', elevation: 9 },
  { id: 'N5', type: 'hydrant', name: 'Hidrante 2', elevation: 12 },
  { id: 'N6', type: 'hydrant', name: 'Hidrante 3', elevation: 15 },
];

const DEMO_PIPES: Pipe[] = [
  { id: 'P1', name: 'Trecho 1', startNodeId: 'N1', endNodeId: 'N2', length: 15, diameter: mm_to_m(65), roughness: getHazenWilliamsC('PVC'), material: 'PVC', accessories: [], equivalentLength: 0 },
  { id: 'P2', name: 'Trecho 2', startNodeId: 'N2', endNodeId: 'N3', length: 20, diameter: mm_to_m(65), roughness: getHazenWilliamsC('PVC'), material: 'PVC', accessories: [], equivalentLength: 0 },
  { id: 'P3', name: 'Trecho 3', startNodeId: 'N3', endNodeId: 'N4', length: 10, diameter: mm_to_m(50), roughness: getHazenWilliamsC('PVC'), material: 'PVC', accessories: [], equivalentLength: 0 },
  { id: 'P4', name: 'Trecho 4', startNodeId: 'N3', endNodeId: 'N5', length: 15, diameter: mm_to_m(50), roughness: getHazenWilliamsC('PVC'), material: 'PVC', accessories: [], equivalentLength: 0 },
  { id: 'P5', name: 'Trecho 5', startNodeId: 'N2', endNodeId: 'N6', length: 25, diameter: mm_to_m(50), roughness: getHazenWilliamsC('PVC'), material: 'PVC', accessories: [], equivalentLength: 0 },
];

// Interface para salvar/carregar JSON
interface NetworkData {
  version: string;
  projectName: string;
  createdAt: string;
  config: {
    occupancyCode: string;
    fireLoadMJm2: number;
    totalAreaM2: number;
    buildingHeight: number;
    pumpEfficiency: number;
  };
  nodes: Array<{
    id: string;
    type: string;
    name: string;
    elevation: number;
  }>;
  pipes: Array<{
    id: string;
    name: string;
    startNodeId: string;
    endNodeId: string;
    length: number;
    diameterMm: number;
    material: string;
    accessories: Array<{ type: string; quantity: number }>;
  }>;
}

export function HydraulicCalculator() {
  const [nodes, setNodes] = useState<Node[]>(DEMO_NODES);
  const [pipes, setPipes] = useState<Pipe[]>(DEMO_PIPES);
  
  // Parâmetros NTCB 19/2020
  const [occupancyCode, setOccupancyCode] = useState('A-2');
  const [fireLoadMJm2, setFireLoadMJm2] = useState(300);
  const [totalAreaM2, setTotalAreaM2] = useState(1500);
  const [buildingHeight, setBuildingHeight] = useState(15);
  const [pumpEfficiency, setPumpEfficiency] = useState(0.65);
  
  const [result, setResult] = useState<SystemResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const { toast } = useToast();
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCalculate = useCallback(() => {
    if (nodes.length < 2) {
      toast({
        title: 'Dados insuficientes',
        description: 'Adicione pelo menos 2 nós para calcular.',
        variant: 'destructive'
      });
      return;
    }

    if (pipes.length === 0) {
      toast({
        title: 'Dados insuficientes',
        description: 'Adicione pelo menos 1 trecho para calcular.',
        variant: 'destructive'
      });
      return;
    }

    const hasSource = nodes.some(n => n.type === 'source' || n.type === 'pump');
    if (!hasSource) {
      toast({
        title: 'Configuração inválida',
        description: 'Defina um nó como Fonte/Reservatório.',
        variant: 'destructive'
      });
      return;
    }

    const hasHydrant = nodes.some(n => n.type === 'hydrant');
    if (!hasHydrant) {
      toast({
        title: 'Configuração inválida',
        description: 'Adicione pelo menos um hidrante.',
        variant: 'destructive'
      });
      return;
    }

    setIsCalculating(true);
    setResult(null);

    setTimeout(() => {
      try {
        const calcResult = calculateSystem({
          nodes,
          pipes,
          pumpEfficiency,
          occupancyCode,
          fireLoadMJm2,
          totalAreaM2,
          buildingHeight,
        });

        setResult(calcResult);
        
        if (calcResult.checks.errors.length > 0) {
          toast({
            title: 'Cálculo concluído com erros',
            description: 'Verifique os resultados para detalhes.',
            variant: 'destructive'
          });
        } else if (calcResult.checks.warnings.length > 0) {
          toast({
            title: 'Cálculo concluído com avisos',
            description: 'Verifique os resultados para detalhes.',
          });
        } else {
          toast({
            title: 'Cálculo concluído',
            description: 'Sistema dimensionado conforme NTCB 19/2020!',
          });
        }
      } catch (error) {
        console.error('Calculation error:', error);
        toast({
          title: 'Erro no cálculo',
          description: error instanceof Error ? error.message : 'Erro desconhecido',
          variant: 'destructive'
        });
      } finally {
        setIsCalculating(false);
      }
    }, 500);
  }, [nodes, pipes, occupancyCode, fireLoadMJm2, totalAreaM2, buildingHeight, pumpEfficiency, toast]);

  const handleReset = () => {
    setNodes(DEMO_NODES);
    setPipes(DEMO_PIPES);
    setOccupancyCode('A-2');
    setFireLoadMJm2(300);
    setTotalAreaM2(1500);
    setBuildingHeight(15);
    setPumpEfficiency(0.65);
    setResult(null);
  };

  // Salvar rede em JSON
  const handleSaveNetwork = () => {
    const networkData: NetworkData = {
      version: '1.0',
      projectName: 'HydraFlow Pro Network',
      createdAt: new Date().toISOString(),
      config: {
        occupancyCode,
        fireLoadMJm2,
        totalAreaM2,
        buildingHeight,
        pumpEfficiency
      },
      nodes: nodes.map(n => ({
        id: n.id,
        type: n.type,
        name: n.name,
        elevation: n.elevation
      })),
      pipes: pipes.map(p => ({
        id: p.id,
        name: p.name,
        startNodeId: p.startNodeId,
        endNodeId: p.endNodeId,
        length: p.length,
        diameterMm: m_to_mm(p.diameter),
        material: p.material || 'PVC',
        accessories: p.accessories || []
      }))
    };

    const blob = new Blob([JSON.stringify(networkData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hydraflow_network_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Rede salva',
      description: 'Arquivo JSON exportado com sucesso.',
    });
  };

  // Carregar rede de JSON
  const handleLoadNetwork = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data: NetworkData = JSON.parse(e.target?.result as string);
        
        // Validação básica
        if (!data.nodes || !data.pipes) {
          throw new Error('Arquivo JSON inválido: faltam nodes ou pipes');
        }

        // Converte nodes
        const loadedNodes: Node[] = data.nodes.map(n => ({
          id: n.id,
          type: n.type as Node['type'],
          name: n.name,
          elevation: n.elevation
        }));

        // Converte pipes com recálculo de Leq
        const loadedPipes: Pipe[] = data.pipes.map(p => {
          const diamMm = p.diameterMm;
          const mat = (p.material || 'PVC') as 'PVC' | 'Metal';
          
          // Recalcula Leq para cada acessório
          const accessories = (p.accessories || []).map(a => {
            const leqUnit = getEquivalentLength(a.type as any, diamMm, mat);
            return {
              type: a.type as any,
              quantity: a.quantity,
              equivalentLengthUnit: leqUnit,
              equivalentLengthTotal: leqUnit * a.quantity
            };
          });
          
          // Soma Leq total do trecho
          const totalLeq = accessories.reduce((sum, a) => sum + a.equivalentLengthTotal, 0);
          
          return {
            id: p.id,
            name: p.name,
            startNodeId: p.startNodeId,
            endNodeId: p.endNodeId,
            length: p.length,
            diameter: mm_to_m(diamMm),
            roughness: getHazenWilliamsC(p.material || 'PVC'),
            material: p.material || 'PVC',
            accessories,
            equivalentLength: totalLeq
          };
        });

        // Carrega configurações se existirem
        if (data.config) {
          setOccupancyCode(data.config.occupancyCode || 'A-2');
          setFireLoadMJm2(data.config.fireLoadMJm2 || 300);
          setTotalAreaM2(data.config.totalAreaM2 || 1500);
          setBuildingHeight(data.config.buildingHeight || 15);
          setPumpEfficiency(data.config.pumpEfficiency || 0.65);
        }

        setNodes(loadedNodes);
        setPipes(loadedPipes);
        setResult(null);

        toast({
          title: 'Rede carregada',
          description: `${loadedNodes.length} nós e ${loadedPipes.length} trechos importados.`,
        });
      } catch (error) {
        console.error('Load error:', error);
        toast({
          title: 'Erro ao carregar',
          description: error instanceof Error ? error.message : 'Arquivo JSON inválido',
          variant: 'destructive'
        });
      }
    };
    reader.readAsText(file);
    
    // Reset input para permitir carregar mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExportReport = () => {
    if (!result) return;

    const report = generateTextReport(result, nodes, pipes);
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'relatorio_hidraulico_ntcb.txt';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Relatório exportado',
      description: 'Arquivo salvo como relatorio_hidraulico_ntcb.txt',
    });
  };

  const handleExportWord = async () => {
    if (!result) return;

    try {
      await generateWordReport({ result, nodes, pipes });
      toast({
        title: 'Relatório Word exportado',
        description: 'Memorial detalhado com Tabela 6.7 salvo com sucesso.',
      });
    } catch (error) {
      console.error('Word export error:', error);
      toast({
        title: 'Erro ao exportar Word',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen bg-background engineering-grid">
      {/* Hidden file input for loading JSON */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleLoadNetwork}
        accept=".json"
        className="hidden"
      />
      
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                <span className="text-primary">⚡</span>
                HydraFlow Pro
                <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  NTCB 19/2020
                </span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Sistema Hidráulico para Dimensionamento de Hidrantes - CBMMT (Mato Grosso)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Resetar
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Importar
              </Button>
              <Button variant="outline" size="sm" onClick={handleSaveNetwork}>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportReport}
                disabled={!result}
              >
                <Download className="h-4 w-4 mr-2" />
                Relatório
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportWord}
                disabled={!result}
              >
                <FileText className="h-4 w-4 mr-2" />
                Word
              </Button>
              <Button onClick={handleCalculate} disabled={isCalculating}>
                <Calculator className="h-4 w-4 mr-2" />
                {isCalculating ? 'Calculando...' : 'Calcular'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Input */}
          <div className="lg:col-span-1 space-y-6">
            <BuildingConfig
              occupancyCode={occupancyCode}
              fireLoadMJm2={fireLoadMJm2}
              totalAreaM2={totalAreaM2}
              buildingHeight={buildingHeight}
              pumpEfficiency={pumpEfficiency}
              onOccupancyChange={setOccupancyCode}
              onFireLoadChange={setFireLoadMJm2}
              onAreaChange={setTotalAreaM2}
              onHeightChange={setBuildingHeight}
              onEfficiencyChange={setPumpEfficiency}
            />
            <NetworkEditor
              nodes={nodes}
              pipes={pipes}
              onNodesChange={setNodes}
              onPipesChange={setPipes}
            />
          </div>

          {/* Right Column - Output */}
          <div className="lg:col-span-2 space-y-6">
            <NetworkVisualization 
              nodes={nodes}
              pipes={pipes}
              result={result}
            />
            <ResultsPanel 
              result={result}
              isCalculating={isCalculating}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 mt-12">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Cálculos baseados em Hazen-Williams | Norma: NTCB 19/2020 - CBMMT
            </span>
            <span className="font-mono">
              Sistema de dimensionamento profissional
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Função auxiliar para gerar relatório em texto
function generateTextReport(result: SystemResult, nodes: Node[], pipes: Pipe[]): string {
  const lines: string[] = [];
  const sep = '='.repeat(90);
  
  lines.push(sep);
  lines.push('RELATÓRIO DE DIMENSIONAMENTO HIDRÁULICO - NTCB 19/2020');
  lines.push('Sistema de Hidrantes / HCI - Corpo de Bombeiros MT');
  lines.push(sep);
  lines.push('');
  
  // Classificação
  lines.push('1. ENQUADRAMENTO NORMATIVO');
  lines.push('-'.repeat(50));
  lines.push(`Tipo de Sistema: ${result.config.ntcbSystemType || 'N/A'}`);
  lines.push(`Vazão por Hidrante: ${result.config.demandConfig.flowPerHydrant} L/min`);
  lines.push(`Hidrantes Simultâneos: ${result.config.demandConfig.simultaneousHydrants}`);
  lines.push(`Pressão Mín. Esguicho: ${result.config.demandConfig.minNozzlePressure} mca`);
  lines.push(`Mangueira Máx.: ${result.config.demandConfig.hoseLength} m`);
  lines.push(`Diâmetro Mangueira: ${result.config.demandConfig.hoseDiameter} mm`);
  lines.push('');
  
  // Bomba
  lines.push('2. BOMBA DE INCÊNDIO');
  lines.push('-'.repeat(50));
  lines.push(`Altura Manométrica: ${result.pump.minPressure.toFixed(2)} mca`);
  lines.push(`Vazão Total: ${result.pump.totalFlowLmin.toFixed(1)} L/min`);
  lines.push(`Potência Hidráulica: ${result.pump.hydraulicPower.toFixed(2)} kW`);
  lines.push(`Potência Motor: ${result.pump.motorPower.toFixed(2)} kW`);
  lines.push(`Potência Comercial: ${result.pump.commercialPowerCV} CV`);
  lines.push(`Rendimento: ${(result.pump.efficiency * 100).toFixed(0)}%`);
  lines.push('');
  
  // Reserva
  lines.push('3. RESERVA TÉCNICA DE INCÊNDIO (RTI)');
  lines.push('-'.repeat(50));
  lines.push(`Volume: ${result.reserve.volumeM3.toFixed(1)} m³ (${result.reserve.volumeLiters.toLocaleString()} L)`);
  lines.push('');
  
  // Hidrantes
  lines.push('4. ANÁLISE DE HIDRANTES');
  lines.push('-'.repeat(50));
  lines.push('Hidrantes Ativos (mais desfavoráveis):');
  for (const h of result.hydrants.mostUnfavorable) {
    const node = nodes.find(n => n.id === h.id);
    const status = h.nozzlePressure >= result.config.demandConfig.minNozzlePressure ? 'OK' : 'FALHA';
    lines.push(`  ${node?.name || h.id}: P.válvula=${h.pressure.toFixed(2)} mca | P.esguicho=${h.nozzlePressure.toFixed(2)} mca [${status}]`);
  }
  if (result.hydrants.mostFavorable) {
    lines.push('');
    lines.push('Hidrante Mais Favorável:');
    const node = nodes.find(n => n.id === result.hydrants.mostFavorable!.id);
    lines.push(`  ${node?.name || result.hydrants.mostFavorable.id}: P.válvula=${result.hydrants.mostFavorable.pressure.toFixed(2)} mca | P.esguicho=${result.hydrants.mostFavorable.nozzlePressure.toFixed(2)} mca`);
  }
  lines.push('');
  
  // Trechos - Memorial Detalhado
  lines.push('5. MEMORIAL DE CÁLCULO - TRECHOS');
  lines.push('-'.repeat(90));
  lines.push('TRECHO        | Nó Início (Zi)   | Nó Fim (Zf)      | Q(L/min) | V(m/s) | L(m)  | Leq(m) | J(m/m)  | ΔH(mca) | ΔZ(m)  | Pi(mca) | Pf(mca)');
  lines.push('-'.repeat(90));
  
  for (const detail of result.hydraulics.pipeDetails) {
    const pipe = pipes.find(p => p.id === detail.pipeId);
    if (!pipe) continue;
    
    const startNode = nodes.find(n => n.id === pipe.startNodeId);
    const endNode = nodes.find(n => n.id === pipe.endNodeId);
    const leq = pipe.equivalentLength || 0;
    const dZ = (endNode?.elevation || 0) - (startNode?.elevation || 0);
    
    const startInfo = `${(startNode?.name || pipe.startNodeId).substring(0,10)} (${(startNode?.elevation || 0).toFixed(1)})`;
    const endInfo = `${(endNode?.name || pipe.endNodeId).substring(0,10)} (${(endNode?.elevation || 0).toFixed(1)})`;
    
    lines.push(
      `${(pipe.name || detail.pipeId).padEnd(13)} | ${startInfo.padEnd(16)} | ${endInfo.padEnd(16)} | ${detail.flowLmin.toFixed(1).padStart(8)} | ${detail.velocity.toFixed(2).padStart(6)} | ${pipe.length.toFixed(1).padStart(5)} | ${leq.toFixed(1).padStart(6)} | ${detail.headLossUnit.toFixed(5).padStart(7)} | ${detail.headLossTotal.toFixed(2).padStart(7)} | ${dZ.toFixed(2).padStart(6)} | ${detail.startPressure.toFixed(2).padStart(7)} | ${detail.endPressure.toFixed(2).padStart(7)}`
    );
  }
  lines.push('');
  
  // Acessórios detalhados
  lines.push('6. DETALHAMENTO DE ACESSÓRIOS POR TRECHO');
  lines.push('-'.repeat(50));
  
  let hasAccessories = false;
  for (const pipe of pipes) {
    if (!pipe.accessories || pipe.accessories.length === 0) continue;
    hasAccessories = true;
    
    const diamMm = Math.round(m_to_mm(pipe.diameter));
    lines.push(`\nTrecho: ${pipe.name || pipe.id} (Ø${diamMm}mm - ${pipe.material})`);
    lines.push('  Conexão/Acessório                    | Qtd | Leq Unit.(m) | Leq Total(m)');
    lines.push('  ' + '-'.repeat(75));
    
    let totalLeq = 0;
    for (const acc of pipe.accessories) {
      const accName = (ACCESSORY_TYPES as Record<string, string>)[acc.type] || acc.type;
      totalLeq += acc.equivalentLengthTotal;
      lines.push(`  ${accName.padEnd(38)} | ${acc.quantity.toString().padStart(3)} | ${acc.equivalentLengthUnit.toFixed(2).padStart(12)} | ${acc.equivalentLengthTotal.toFixed(2).padStart(12)}`);
    }
    lines.push('  ' + '-'.repeat(75));
    lines.push(`  ${'TOTAL'.padEnd(38)} |     |              | ${totalLeq.toFixed(2).padStart(12)}`);
  }
  
  if (!hasAccessories) {
    lines.push('Nenhum acessório cadastrado nos trechos.');
  }
  lines.push('');
  
  // Status
  lines.push('7. VERIFICAÇÕES');
  lines.push('-'.repeat(50));
  lines.push(`Pressões mínimas (esguicho ≥ ${result.config.demandConfig.minNozzlePressure} mca): ${result.checks.minPressureOk ? 'OK' : 'FALHA'}`);
  lines.push(`Velocidades: ${result.checks.velocitiesOk ? 'OK' : 'VERIFICAR'}`);
  lines.push(`Balanço de massa: ${result.checks.massBalanceOk ? 'OK' : 'VERIFICAR'}`);
  
  if (result.checks.warnings.length > 0) {
    lines.push('');
    lines.push('Avisos:');
    result.checks.warnings.forEach(w => lines.push(`  - ${w}`));
  }
  
  if (result.checks.errors.length > 0) {
    lines.push('');
    lines.push('Erros:');
    result.checks.errors.forEach(e => lines.push(`  - ${e}`));
  }
  
  lines.push('');
  lines.push(sep);
  lines.push(`Relatório gerado em: ${new Date().toLocaleString('pt-BR')}`);
  lines.push('Norma de referência: NTCB 19/2020 - CBMMT (Mato Grosso)');
  lines.push(sep);
  
  return lines.join('\n');
}
