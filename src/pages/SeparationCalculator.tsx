/**
 * Calculadora de Separação entre Edificações - NTCB 09/2020
 */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
} from 'lucide-react';
import {
  calculateSeparation,
  getSeverity,
  type BuildingData,
  type SeparationCalculationInput,
  type SeparationResult,
  type SingleCalculationResult,
} from '@/core/separationCalc';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface RegisteredBuilding extends BuildingData {
  fireLoadMJm2: number;
}

interface CalculationPair {
  id: string;
  expositoraId: string;
  emExposicaoId: string;
  distanciaPrevistaExistente: number;
  result?: SeparationResult;
}

const defaultBuilding: RegisteredBuilding = {
  id: '',
  name: '',
  width: 20,
  height: 10,
  openingPercentage: 30,
  fireLoadMJm2: 500,
  hasSprinklers: false,
};

export default function SeparationCalculator() {
  const { toast } = useToast();
  
  // Edificações cadastradas
  const [buildings, setBuildings] = useState<RegisteredBuilding[]>([
    { ...defaultBuilding, id: '1', name: 'Bloco industrial' },
    { ...defaultBuilding, id: '2', name: 'Alojamento funcionários' },
  ]);
  
  // Pares de cálculo
  const [calculations, setCalculations] = useState<CalculationPair[]>([]);
  
  // Município com CB
  const [hasFireDepartment, setHasFireDepartment] = useState(true);
  
  // Formulário de nova edificação
  const [newBuilding, setNewBuilding] = useState<RegisteredBuilding>({
    ...defaultBuilding,
    id: crypto.randomUUID(),
  });
  
  // Distância prevista/existente
  const [distanciaPrevista, setDistanciaPrevista] = useState<number>(70.24);

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
    // Limpar resultados se edificação foi alterada
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
      distanciaPrevistaExistente: distanciaPrevista,
    }]);
  };

  const removeCalculationPair = (id: string) => {
    setCalculations(prev => prev.filter(c => c.id !== id));
  };

  const updateCalculationPair = (id: string, field: keyof CalculationPair, value: string | number) => {
    setCalculations(prev => prev.map(c => 
      c.id === id ? { ...c, [field]: value, result: undefined } : c
    ));
  };

  const calculateAll = () => {
    const updatedCalculations = calculations.map(calc => {
      const expositora = buildings.find(b => b.id === calc.expositoraId);
      const emExposicao = buildings.find(b => b.id === calc.emExposicaoId);
      
      if (!expositora || !emExposicao) return calc;
      
      const params: SeparationCalculationInput = {
        expositora,
        emExposicao,
        hasFireDepartment,
        distanciaPrevistaExistente: calc.distanciaPrevistaExistente,
      };
      
      const result = calculateSeparation(params);
      return { ...calc, result };
    });
    
    setCalculations(updatedCalculations);
    toast({ title: 'Cálculos concluídos' });
  };

  const handleExportCSV = () => {
    const rows: string[] = [
      'Edificação Expositora,Edificação em Exposição,Severidade,Largura (m),Altura (m),Relação X,Relação Adotada,% Aberturas,Coef. a,Coef. b,Distância Separação (m),Distância Total (m),Distância Prevista (m)'
    ];
    
    calculations.forEach(calc => {
      if (calc.result) {
        const r1 = calc.result.calculoAparaBr;
        const r2 = calc.result.calculoBparaA;
        
        rows.push(`${r1.edificacaoExpositora},${r1.edificacaoEmExposicao},${r1.severidade},${r1.largura},${r1.altura},${r1.relacaoCalculada.toFixed(2)},${r1.relacaoAdotada},${r1.porcentagemAberturas},${r1.coeficienteA},${r1.coeficienteB},${r1.distanciaSeparacao.toFixed(2)},${r1.distanciaTotal.toFixed(2)},${r1.distanciaPrevistaExistente}`);
        rows.push(`${r2.edificacaoExpositora},${r2.edificacaoEmExposicao},${r2.severidade},${r2.largura},${r2.altura},${r2.relacaoCalculada.toFixed(2)},${r2.relacaoAdotada},${r2.porcentagemAberturas},${r2.coeficienteA},${r2.coeficienteB},${r2.distanciaSeparacao.toFixed(2)},${r2.distanciaTotal.toFixed(2)},${r2.distanciaPrevistaExistente}`);
      }
    });
    
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'calculo_separacao_ntcb09.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Exportado com sucesso' });
  };

  const handleReset = () => {
    setBuildings([
      { ...defaultBuilding, id: '1', name: 'Bloco industrial' },
      { ...defaultBuilding, id: '2', name: 'Alojamento funcionários' },
    ]);
    setCalculations([]);
  };

  // Componente para exibir uma linha de resultado conforme a imagem
  const ResultTable = ({ result, distanciaPrevista }: { result: SeparationResult; distanciaPrevista: number }) => {
    const renderRow = (calc: SingleCalculationResult, isFirst: boolean) => (
      <div key={calc.edificacaoExpositora + calc.edificacaoEmExposicao} className="border rounded-lg overflow-hidden mb-4">
        {/* Header */}
        <div className="bg-muted px-4 py-2 border-b">
          <h4 className="font-semibold text-sm">3.1 CÁLCULO DE SEPARAÇÃO (NTCB 09/2020)</h4>
        </div>
        
        {/* Edificações */}
        <div className="grid grid-cols-2 border-b">
          <div className="p-3 border-r">
            <p className="text-xs text-muted-foreground">EDIFICAÇÃO EXPOSITORA:</p>
            <p className="font-medium">{calc.edificacaoExpositora}</p>
          </div>
          <div className="p-3">
            <p className="text-xs text-muted-foreground">EDIFICAÇÃO EM EXPOSIÇÃO:</p>
            <p className="font-medium">{calc.edificacaoEmExposicao}</p>
          </div>
        </div>
        
        {/* Dados principais */}
        <div className="grid grid-cols-5 border-b text-sm">
          <div className="p-2 border-r text-center">
            <p className="text-xs text-muted-foreground">Severidade</p>
            <p className="font-mono font-bold">{calc.severidade}</p>
          </div>
          <div className="p-2 border-r text-center">
            <p className="text-xs text-muted-foreground">Largura (Fachada)</p>
            <p className="font-mono">{calc.largura.toFixed(2)} m</p>
          </div>
          <div className="p-2 border-r text-center">
            <p className="text-xs text-muted-foreground">Altura (Fachada)</p>
            <p className="font-mono">{calc.altura.toFixed(2)} m</p>
          </div>
          <div className="p-2 border-r text-center">
            <p className="text-xs text-muted-foreground">Relação X</p>
            <p className="font-mono">{calc.relacaoCalculada.toFixed(2)} (Adotado {calc.relacaoAdotada})</p>
          </div>
          <div className="p-2 text-center">
            <p className="text-xs text-muted-foreground">Coeficientes</p>
            <p className="font-mono">a={calc.coeficienteA.toFixed(2)} b={calc.coeficienteB}m</p>
          </div>
        </div>
        
        {/* Porcentagem e fórmula */}
        <div className="grid grid-cols-2 border-b text-sm">
          <div className="p-2 border-r">
            <p className="text-xs text-muted-foreground">Porcentagem de aberturas</p>
            <p className="font-mono font-bold">{calc.porcentagemAberturas}%</p>
          </div>
          <div className="p-2">
            <p className="text-xs text-muted-foreground">Distância de separação = a × (largura ou altura) + b</p>
            <p className="font-mono">{calc.formula}</p>
          </div>
        </div>
        
        {/* Redutor (placeholder) */}
        <div className="grid grid-cols-2 border-b text-sm">
          <div className="p-2 border-r">
            <p className="text-xs text-muted-foreground">Redutor de separação (Tabela B-1)</p>
            <p className="font-mono text-muted-foreground">-------</p>
          </div>
          <div className="p-2">
            <p className="text-xs text-muted-foreground">Vantagens</p>
            <p className="font-mono text-muted-foreground">-------</p>
          </div>
        </div>
        
        {/* Distância Total */}
        <div className="p-3 bg-primary/5 border-b">
          <p className="text-xs text-muted-foreground">DISTÂNCIA TOTAL = Distância de separação (D) subtraída da vantagem</p>
          <p className="text-2xl font-bold font-mono text-primary">{calc.distanciaTotal.toFixed(2)}</p>
        </div>
        
        {/* Distância Prevista */}
        <div className="p-3">
          <p className="text-xs text-muted-foreground">Distância (prevista / existente)</p>
          <p className="font-mono font-bold">{distanciaPrevista.toFixed(2)}</p>
        </div>
      </div>
    );

    return (
      <div className="space-y-4">
        {renderRow(result.calculoAparaBr, true)}
        {renderRow(result.calculoBparaA, false)}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <ArrowLeftRight className="h-6 w-6 text-primary" />
            Separação entre Edificações
            <Badge variant="outline" className="text-xs font-mono">NTCB 09/2020</Badge>
          </h1>
          <p className="text-muted-foreground">
            Isolamento de risco por radiação térmica
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Limpar
          </Button>
          <Button variant="outline" onClick={handleExportCSV} disabled={calculations.every(c => !c.result)}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={calculateAll} disabled={calculations.length === 0}>
            <Calculator className="h-4 w-4 mr-2" />
            Calcular Todos
          </Button>
        </div>
      </div>

      {/* Configuração Global */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Configurações</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-6">
          <div className="flex items-center gap-3">
            <Label>Coeficiente b (β):</Label>
            <Select value={hasFireDepartment ? 'com' : 'sem'} onValueChange={v => setHasFireDepartment(v === 'com')}>
              <SelectTrigger className="w-[240px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="com">3,0m (com Corpo de Bombeiros)</SelectItem>
                <SelectItem value="sem">1,5m (sem Corpo de Bombeiros)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <Label>Distância Prevista/Existente (m):</Label>
            <Input
              type="number"
              value={distanciaPrevista}
              onChange={e => setDistanciaPrevista(parseFloat(e.target.value) || 0)}
              className="w-24"
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
            Cadastre as edificações para realizar os cálculos de separação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Lista de edificações */}
          {buildings.map(building => (
            <div key={building.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span className="font-medium">{building.name}</span>
                  <Badge variant="outline">Severidade {getSeverity(building.fireLoadMJm2, building.hasSprinklers)}</Badge>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeBuilding(building.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div>
                  <Label className="text-xs">Nome</Label>
                  <Input
                    value={building.name}
                    onChange={e => updateBuilding(building.id, 'name', e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs">Largura (m)</Label>
                  <Input
                    type="number"
                    value={building.width}
                    onChange={e => updateBuilding(building.id, 'width', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label className="text-xs">Altura (m)</Label>
                  <Input
                    type="number"
                    value={building.height}
                    onChange={e => updateBuilding(building.id, 'height', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label className="text-xs">% Aberturas</Label>
                  <Input
                    type="number"
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
                  />
                </div>
              </div>
            </div>
          ))}

          <Separator />

          {/* Adicionar nova edificação */}
          <div className="p-4 border-2 border-dashed rounded-lg space-y-3">
            <p className="font-medium text-sm text-muted-foreground">Nova Edificação</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
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
                  value={newBuilding.width}
                  onChange={e => setNewBuilding(prev => ({ ...prev, width: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label className="text-xs">Altura (m)</Label>
                <Input
                  type="number"
                  value={newBuilding.height}
                  onChange={e => setNewBuilding(prev => ({ ...prev, height: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label className="text-xs">% Aberturas</Label>
                <Input
                  type="number"
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
                />
              </div>
            </div>
            <Button onClick={addBuilding} variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Edificação
            </Button>
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
            Selecione pares de edificações para calcular a distância de separação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {calculations.map(calc => {
            const expositora = buildings.find(b => b.id === calc.expositoraId);
            const emExposicao = buildings.find(b => b.id === calc.emExposicaoId);
            
            return (
              <div key={calc.id} className="border rounded-lg overflow-hidden">
                {/* Seleção de edificações */}
                <div className="p-4 bg-muted/30 flex flex-wrap gap-4 items-center">
                  <div className="flex-1 min-w-[200px]">
                    <Label className="text-xs">Edificação A</Label>
                    <Select
                      value={calc.expositoraId}
                      onValueChange={v => updateCalculationPair(calc.id, 'expositoraId', v)}
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
                  <div className="flex-1 min-w-[200px]">
                    <Label className="text-xs">Edificação B</Label>
                    <Select
                      value={calc.emExposicaoId}
                      onValueChange={v => updateCalculationPair(calc.id, 'emExposicaoId', v)}
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
                  <Button variant="ghost" size="icon" onClick={() => removeCalculationPair(calc.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                
                {/* Resultado */}
                {calc.result && (
                  <div className="p-4">
                    <ResultTable result={calc.result} distanciaPrevista={calc.distanciaPrevistaExistente} />
                    
                    {/* Resumo */}
                    <Alert className="mt-4">
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Distância mínima de separação:</strong> {calc.result.distanciaMinima.toFixed(2)} m
                        {calc.result.distanciaMinima <= calc.distanciaPrevistaExistente && (
                          <span className="text-green-600 ml-2">✓ Atende à distância prevista</span>
                        )}
                        {calc.result.distanciaMinima > calc.distanciaPrevistaExistente && (
                          <span className="text-destructive ml-2">✗ Não atende à distância prevista</span>
                        )}
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </div>
            );
          })}

          <Button onClick={addCalculationPair} variant="outline" className="w-full" disabled={buildings.length < 2}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Cálculo
          </Button>
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-primary mt-0.5" />
            <div className="text-sm text-muted-foreground space-y-2">
              <p className="font-medium text-foreground">Referência: NTCB 09/2020</p>
              <p>
                Fórmula: <span className="font-mono">D = a × (largura ou altura) + b</span>
              </p>
              <p>
                O cálculo é feito em duas direções: da edificação A para B e de B para A.
                A distância de separação final é a maior entre os dois cálculos.
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>a</strong>: coeficiente da Tabela A-1 (baseado em severidade, % aberturas e relação L/H)</li>
                <li><strong>b</strong>: 3,0m (com CB) ou 1,5m (sem CB)</li>
                <li><strong>X</strong>: relação largura/altura ou altura/largura (sempre ≥ 1)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
