/**
 * Calculadora de Separação entre Edificações - NTCB 09/2020
 */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
  CheckCircle,
  Flame,
  Ruler,
} from 'lucide-react';
import {
  calculateSeparation,
  generateTable3_1,
  getSeverity,
  type BuildingData,
  type SeparationParams,
  type SeparationResult,
} from '@/core/separationCalc';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const defaultBuilding: BuildingData = {
  id: '',
  name: '',
  width: 20,
  height: 10,
  openingPercentage: 30,
  fireLoadMJm2: 500,
  area: 500,
  floors: 2,
  hasHorizontalCompartmentalization: false,
  hasVerticalCompartmentalization: false,
  hasSprinklers: false,
  hasTRRF120min: false,
};

export default function SeparationCalculator() {
  const { toast } = useToast();
  const [buildingA, setBuildingA] = useState<BuildingData>({
    ...defaultBuilding,
    id: 'A',
    name: 'Edificação A',
  });
  const [buildingB, setBuildingB] = useState<BuildingData>({
    ...defaultBuilding,
    id: 'B',
    name: 'Edificação B',
  });
  const [hasFireDepartment, setHasFireDepartment] = useState(true);
  const [useSimplifiedTable, setUseSimplifiedTable] = useState(false);
  const [result, setResult] = useState<SeparationResult | null>(null);

  const handleCalculate = () => {
    const params: SeparationParams = {
      buildingA,
      buildingB,
      hasFireDepartment,
      useSimplifiedTable,
    };

    try {
      const calcResult = calculateSeparation(params);
      setResult(calcResult);
      toast({
        title: 'Cálculo concluído',
        description: `Distância de separação: ${calcResult.finalDistance.toFixed(1)} m`,
      });
    } catch (error) {
      toast({
        title: 'Erro no cálculo',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    }
  };

  const handleReset = () => {
    setBuildingA({ ...defaultBuilding, id: 'A', name: 'Edificação A' });
    setBuildingB({ ...defaultBuilding, id: 'B', name: 'Edificação B' });
    setHasFireDepartment(true);
    setUseSimplifiedTable(false);
    setResult(null);
  };

  const handleExportTable = () => {
    if (!result) return;
    const tableData = generateTable3_1({ buildingA, buildingB, hasFireDepartment, useSimplifiedTable }, result);
    const csv = [
      'Edificação Expositora,Edificação em Exposição,Largura (m),Altura (m),Relação X/Y,% Aberturas,Carga Incêndio (MJ/m²),Severidade,α,β,D Calculado (m),D Adotado (m),Obs',
      ...tableData.map(row => 
        `${row.edificacaoExpositora},${row.edificacaoEmExposicao},${row.larguraFachada},${row.alturaFachada},${row.relacaoXY.toFixed(2)},${row.percentualAberturas},${row.cargaIncendio},${row.severidade},${row.coeficienteAlpha.toFixed(2)},${row.coeficienteBeta},${row.distanciaCalculada.toFixed(1)},${row.distanciaAdotada.toFixed(1)},${row.observacoes}`
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tabela_3_1_separacao_ntcb09.csv';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Tabela exportada',
      description: 'Tabela 3.1 do Anexo G exportada com sucesso.',
    });
  };

  const updateBuilding = (
    setter: React.Dispatch<React.SetStateAction<BuildingData>>,
    field: keyof BuildingData,
    value: string | number | boolean
  ) => {
    setter(prev => ({ ...prev, [field]: value }));
    setResult(null);
  };

  const BuildingForm = ({
    building,
    setBuilding,
    title,
    color,
  }: {
    building: BuildingData;
    setBuilding: React.Dispatch<React.SetStateAction<BuildingData>>;
    title: string;
    color: string;
  }) => (
    <Card className={`border-2 ${color}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Building2 className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Nome da Edificação</Label>
          <Input
            value={building.name}
            onChange={e => updateBuilding(setBuilding, 'name', e.target.value)}
            placeholder="Ex: Bloco A"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Largura da Fachada (m)</Label>
            <Input
              type="number"
              value={building.width}
              onChange={e => updateBuilding(setBuilding, 'width', parseFloat(e.target.value) || 0)}
              min={1}
            />
          </div>
          <div>
            <Label>Altura da Fachada (m)</Label>
            <Input
              type="number"
              value={building.height}
              onChange={e => updateBuilding(setBuilding, 'height', parseFloat(e.target.value) || 0)}
              min={1}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Área Total (m²)</Label>
            <Input
              type="number"
              value={building.area}
              onChange={e => updateBuilding(setBuilding, 'area', parseFloat(e.target.value) || 0)}
              min={1}
            />
          </div>
          <div>
            <Label>Nº Pavimentos</Label>
            <Input
              type="number"
              value={building.floors}
              onChange={e => updateBuilding(setBuilding, 'floors', parseInt(e.target.value) || 1)}
              min={1}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>% Aberturas</Label>
            <Input
              type="number"
              value={building.openingPercentage}
              onChange={e => updateBuilding(setBuilding, 'openingPercentage', parseFloat(e.target.value) || 0)}
              min={0}
              max={100}
            />
          </div>
          <div>
            <Label>Carga de Incêndio (MJ/m²)</Label>
            <Input
              type="number"
              value={building.fireLoadMJm2}
              onChange={e => updateBuilding(setBuilding, 'fireLoadMJm2', parseFloat(e.target.value) || 0)}
              min={0}
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="cursor-pointer">Possui Chuveiros Automáticos (SPK)</Label>
            <Switch
              checked={building.hasSprinklers}
              onCheckedChange={v => updateBuilding(setBuilding, 'hasSprinklers', v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="cursor-pointer">Compartimentação Horizontal</Label>
            <Switch
              checked={building.hasHorizontalCompartmentalization}
              onCheckedChange={v => updateBuilding(setBuilding, 'hasHorizontalCompartmentalization', v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="cursor-pointer">Compartimentação Vertical</Label>
            <Switch
              checked={building.hasVerticalCompartmentalization}
              onCheckedChange={v => updateBuilding(setBuilding, 'hasVerticalCompartmentalization', v)}
            />
          </div>
        </div>

        <div className="pt-2">
          <Badge variant="outline" className="text-xs">
            <Flame className="h-3 w-3 mr-1" />
            Severidade: {getSeverity(building.fireLoadMJm2, building.hasSprinklers)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );

  const canUseSimplified =
    buildingA.height <= 12 && buildingA.area <= 750 &&
    buildingB.height <= 12 && buildingB.area <= 750;

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
            Isolamento de risco por radiação térmica - Corpo de Bombeiros MT
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Limpar
          </Button>
          <Button onClick={handleCalculate}>
            <Calculator className="h-4 w-4 mr-2" />
            Calcular
          </Button>
        </div>
      </div>

      {/* Config */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-3">
              <Switch
                id="hasFireDept"
                checked={hasFireDepartment}
                onCheckedChange={v => { setHasFireDepartment(v); setResult(null); }}
              />
              <Label htmlFor="hasFireDept" className="cursor-pointer">
                Município com Corpo de Bombeiros (β = {hasFireDepartment ? '1,5m' : '3,0m'})
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="useSimplified"
                checked={useSimplifiedTable}
                onCheckedChange={v => { setUseSimplifiedTable(v); setResult(null); }}
                disabled={!canUseSimplified}
              />
              <Label htmlFor="useSimplified" className={`cursor-pointer ${!canUseSimplified ? 'opacity-50' : ''}`}>
                Usar Tabela 3 (simplificado)
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Buildings */}
      <div className="grid md:grid-cols-2 gap-6">
        <BuildingForm
          building={buildingA}
          setBuilding={setBuildingA}
          title="Edificação A (Expositora)"
          color="border-blue-500/30"
        />
        <BuildingForm
          building={buildingB}
          setBuilding={setBuildingB}
          title="Edificação B (Em Exposição)"
          color="border-orange-500/30"
        />
      </div>

      {/* Result */}
      {result && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Resultado do Cálculo
            </CardTitle>
            <CardDescription>
              Método: {result.method === 'simplified' ? 'Tabela 3 (Simplificado)' : 'Tabela A-1 (Completo)'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Main result */}
            <div className="text-center p-6 rounded-lg bg-background border-2 border-primary">
              <p className="text-sm text-muted-foreground mb-2">Distância de Separação Mínima</p>
              <p className="text-5xl font-bold text-primary font-mono">
                {result.finalDistance.toFixed(1)} m
              </p>
            </div>

            {/* Details */}
            {result.method === 'full' && (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm font-medium mb-2">{buildingA.name}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Severidade:</span>
                    <span>{result.severityA}</span>
                    <span className="text-muted-foreground">α:</span>
                    <span>{result.alphaA.toFixed(3)}</span>
                    <span className="text-muted-foreground">Distância:</span>
                    <span>{result.distanceA.toFixed(1)} m</span>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm font-medium mb-2">{buildingB.name}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Severidade:</span>
                    <span>{result.severityB}</span>
                    <span className="text-muted-foreground">α:</span>
                    <span>{result.alphaB.toFixed(3)}</span>
                    <span className="text-muted-foreground">Distância:</span>
                    <span>{result.distanceB.toFixed(1)} m</span>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {result.notes.length > 0 && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc pl-4 space-y-1">
                    {result.notes.map((note, i) => (
                      <li key={i} className="text-sm">{note}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Table 3.1 */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Tabela 3.1 - Anexo G</h3>
                <Button variant="outline" size="sm" onClick={handleExportTable}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
              <div className="rounded-lg border overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Edif. Expositora</TableHead>
                      <TableHead>Edif. Exposição</TableHead>
                      <TableHead className="text-right">Largura</TableHead>
                      <TableHead className="text-right">Altura</TableHead>
                      <TableHead className="text-right">X/Y</TableHead>
                      <TableHead className="text-right">% Abert.</TableHead>
                      <TableHead className="text-right">Q (MJ/m²)</TableHead>
                      <TableHead>Sev.</TableHead>
                      <TableHead className="text-right">α</TableHead>
                      <TableHead className="text-right">β</TableHead>
                      <TableHead className="text-right">D (m)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {generateTable3_1({ buildingA, buildingB, hasFireDepartment, useSimplifiedTable }, result).map((row, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{row.edificacaoExpositora}</TableCell>
                        <TableCell>{row.edificacaoEmExposicao}</TableCell>
                        <TableCell className="text-right font-mono">{row.larguraFachada}</TableCell>
                        <TableCell className="text-right font-mono">{row.alturaFachada}</TableCell>
                        <TableCell className="text-right font-mono">{row.relacaoXY.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-mono">{row.percentualAberturas}%</TableCell>
                        <TableCell className="text-right font-mono">{row.cargaIncendio}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{row.severidade}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">{row.coeficienteAlpha.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-mono">{row.coeficienteBeta}</TableCell>
                        <TableCell className="text-right font-mono font-bold">{row.distanciaAdotada.toFixed(1)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-primary mt-0.5" />
            <div className="text-sm text-muted-foreground space-y-2">
              <p className="font-medium text-foreground">Referência: NTCB 09/2020</p>
              <p>
                Esta calculadora implementa o método de cálculo de separação entre edificações
                por radiação térmica conforme a Norma Técnica do Corpo de Bombeiros nº 09/2020
                do Estado de Mato Grosso.
              </p>
              <p>
                A fórmula utilizada é: <code className="bg-background px-2 py-1 rounded">D = α × (menor dimensão) + β</code>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
