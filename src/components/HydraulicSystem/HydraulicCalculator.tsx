/**
 * Calculadora Hidráulica Principal - NTCB 19/2020
 * Corpo de Bombeiros Militar do Estado de Mato Grosso
 */

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Calculator, RotateCcw, Download } from 'lucide-react';
import { NetworkEditor } from './NetworkEditor';
import { BuildingConfig } from './BuildingConfig';
import { ResultsPanel } from './ResultsPanel';
import { NetworkVisualization } from './NetworkVisualization';
import { calculateSystem } from '@/engine/calculateSystem';
import type { Node, Pipe, SystemResult } from '@/models/types';
import { mm_to_m } from '@/core/units';
import { getHazenWilliamsC } from '@/core/equivalentLength';

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

  const handleExport = () => {
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

  return (
    <div className="min-h-screen bg-background engineering-grid">
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
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Resetar
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExport}
                disabled={!result}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
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
  const sep = '='.repeat(70);
  
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
    lines.push(`  ${h.id}: P.válvula=${h.pressure.toFixed(2)} mca | P.esguicho=${h.nozzlePressure.toFixed(2)} mca`);
  }
  if (result.hydrants.mostFavorable) {
    lines.push('');
    lines.push('Hidrante Mais Favorável:');
    lines.push(`  ${result.hydrants.mostFavorable.id}: P.válvula=${result.hydrants.mostFavorable.pressure.toFixed(2)} mca | P.esguicho=${result.hydrants.mostFavorable.nozzlePressure.toFixed(2)} mca`);
  }
  lines.push('');
  
  // Trechos
  lines.push('5. MEMORIAL DE CÁLCULO - TRECHOS');
  lines.push('-'.repeat(50));
  lines.push('Trecho  | Q(L/min) | V(m/s) | J(m/m)  | Leq(m) | ΔH(mca) | Pi(mca) | Pf(mca)');
  for (const pipe of result.hydraulics.pipeDetails) {
    lines.push(
      `${pipe.pipeId.padEnd(7)} | ${pipe.flowLmin.toFixed(1).padStart(8)} | ${pipe.velocity.toFixed(2).padStart(6)} | ${pipe.headLossUnit.toFixed(4).padStart(7)} | ${(pipe.equivalentLength || 0).toFixed(1).padStart(6)} | ${pipe.headLossTotal.toFixed(2).padStart(7)} | ${pipe.startPressure.toFixed(2).padStart(7)} | ${pipe.endPressure.toFixed(2).padStart(7)}`
    );
  }
  lines.push('');
  
  // Status
  lines.push('6. VERIFICAÇÕES');
  lines.push('-'.repeat(50));
  lines.push(`Pressões mínimas: ${result.checks.minPressureOk ? 'OK' : 'FALHA'}`);
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
