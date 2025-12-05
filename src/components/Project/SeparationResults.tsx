/**
 * Separation Results - Integrated into Project
 * Calculates separation distances between buildings in the same project
 */
import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Ruler, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Building2,
  ArrowLeftRight
} from 'lucide-react';
import { ProjectBuildingData } from '@/components/Wizard/types';
import { calculateSeparation } from '@/lib/separacao/calculator';
import type { SimpleCalculationInput, SimpleBuildingData } from '@/lib/separacao/types';

interface SeparationResultsProps {
  buildings: ProjectBuildingData[];
  projectName?: string;
  actualDistance?: number;
  hasFireDepartment?: boolean;
  onActualDistanceChange?: (distance: number) => void;
}

interface PairResult {
  buildingA: string;
  buildingB: string;
  requiredDistance: number;
  isCompliant: boolean;
  scenario1Distance?: number;
  scenario2Distance?: number;
}

export function SeparationResults({ 
  buildings, 
  projectName,
  actualDistance = 0,
  hasFireDepartment = true,
  onActualDistanceChange 
}: SeparationResultsProps) {
  const [localDistance, setLocalDistance] = useState(actualDistance);

  // Convert ProjectBuildingData to SimpleBuildingData for calculation
  const convertToSimpleBuilding = (building: ProjectBuildingData): SimpleBuildingData => {
    // Calculate total fire load from all sectors
    const totalFireLoad = (building.floors || []).reduce((sum, floor) => {
      return sum + (floor.sectors || []).reduce((sectorSum, sector) => {
        return sectorSum + (sector.fireLoad || 300);
      }, 0);
    }, 0);
    
    const sectorCount = (building.floors || []).reduce((sum, floor) => sum + (floor.sectors?.length || 0), 0);
    const avgFireLoad = sectorCount > 0 ? totalFireLoad / sectorCount : 300;

    // Calculate opening percentage
    const facadeArea = (building.facadeWidth || 10) * (building.facadeHeight || 6);
    const openingPercentage = facadeArea > 0 ? ((building.openingArea || 0) / facadeArea) * 100 : 0;

    return {
      id: building.id,
      name: building.name,
      fireLoadMJm2: avgFireLoad,
      width: building.facadeWidth || 10,
      height: building.facadeHeight || 6,
      openingPercentage: Math.min(openingPercentage, 100),
      hasSprinklers: building.hasSprinklers || false,
      trrf: building.trrf || 60,
    };
  };

  const pairResults = useMemo<PairResult[]>(() => {
    if (buildings.length < 2) return [];

    const results: PairResult[] = [];

    // Calculate for all pairs of buildings
    for (let i = 0; i < buildings.length; i++) {
      for (let j = i + 1; j < buildings.length; j++) {
        const buildingA = buildings[i];
        const buildingB = buildings[j];

        try {
          const input: SimpleCalculationInput = {
            expositora: convertToSimpleBuilding(buildingA),
            emExposicao: convertToSimpleBuilding(buildingB),
            existingDistance: localDistance,
            hasFireDepartment,
            reducers: {
              paredeCartaFogo: buildingA.hasFireWall || buildingB.hasFireWall,
              protecaoAberturas: (buildingA.hasOpeningProtection || buildingB.hasOpeningProtection) ? 'igual' : 'none',
              cortinaAgua: buildingA.hasWaterCurtain || buildingB.hasWaterCurtain,
            },
          };

          const result = calculateSeparation(input);

          results.push({
            buildingA: buildingA.name,
            buildingB: buildingB.name,
            requiredDistance: result.minimumDistance,
            isCompliant: result.isCompliant,
            scenario1Distance: result.scenario1?.finalDistance,
            scenario2Distance: result.scenario2?.finalDistance,
          });
        } catch (error) {
          console.error('Error calculating separation:', error);
          results.push({
            buildingA: buildingA.name,
            buildingB: buildingB.name,
            requiredDistance: 0,
            isCompliant: false,
          });
        }
      }
    }

    return results;
  }, [buildings, localDistance, hasFireDepartment]);

  const summary = useMemo(() => {
    if (pairResults.length === 0) {
      return { maxRequired: 0, isCompliant: true, pairs: 0 };
    }

    const maxRequired = Math.max(...pairResults.map(r => r.requiredDistance));
    const isCompliant = pairResults.every(r => r.isCompliant);

    return { maxRequired, isCompliant, pairs: pairResults.length };
  }, [pairResults]);

  const handleDistanceChange = (value: string) => {
    const distance = parseFloat(value) || 0;
    setLocalDistance(distance);
    onActualDistanceChange?.(distance);
  };

  if (buildings.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-primary" />
            Separação entre Edificações
          </CardTitle>
          <CardDescription>NTCB 09/2020</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>É necessário ter pelo menos 2 edificações para calcular a separação.</p>
            <p className="text-sm">Adicione mais edificações no passo de Classificação.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card className={summary.isCompliant ? 'border-success/50 bg-success/5' : 'border-destructive/50 bg-destructive/5'}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Ruler className="h-5 w-5 text-primary" />
              Separação entre Edificações
            </CardTitle>
            <Badge variant={summary.isCompliant ? 'default' : 'destructive'} className="gap-1">
              {summary.isCompliant ? (
                <><CheckCircle className="h-3 w-3" /> Conforme</>
              ) : (
                <><XCircle className="h-3 w-3" /> Não Conforme</>
              )}
            </Badge>
          </div>
          <CardDescription>NTCB 09/2020 - Separação entre edificações</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-background">
              <p className="text-2xl font-bold">{buildings.length}</p>
              <p className="text-xs text-muted-foreground">Edificações</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-background">
              <p className="text-2xl font-bold font-mono">{summary.maxRequired.toFixed(2)}m</p>
              <p className="text-xs text-muted-foreground">Distância Mínima</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-background">
              <p className="text-2xl font-bold">{summary.pairs}</p>
              <p className="text-xs text-muted-foreground">Pares Calculados</p>
            </div>
          </div>

          {/* Actual Distance Input */}
          <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
            <div className="flex-1">
              <Label htmlFor="actualDistance" className="text-sm font-medium">
                Distância Atual entre Edificações
              </Label>
              <p className="text-xs text-muted-foreground">
                Informe a menor distância entre as fachadas das edificações
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                id="actualDistance"
                type="number"
                step="0.1"
                min="0"
                value={localDistance}
                onChange={(e) => handleDistanceChange(e.target.value)}
                className="w-24 text-right"
              />
              <span className="text-sm text-muted-foreground">m</span>
            </div>
          </div>

          {/* Compliance Message */}
          {localDistance > 0 && (
            <div className={`p-3 rounded-lg ${summary.isCompliant ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
              {summary.isCompliant ? (
                <p className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  A distância de {localDistance}m atende ao mínimo exigido de {summary.maxRequired.toFixed(2)}m.
                </p>
              ) : (
                <p className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  A distância de {localDistance}m NÃO atende ao mínimo exigido de {summary.maxRequired.toFixed(2)}m.
                  Faltam {(summary.maxRequired - localDistance).toFixed(2)}m.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Results */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cálculo por Par de Edificações</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Par de Edificações</TableHead>
                <TableHead className="text-right">Cenário 1</TableHead>
                <TableHead className="text-right">Cenário 2</TableHead>
                <TableHead className="text-right">Distância Mín.</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pairResults.map((result, idx) => (
                <TableRow key={idx} className={!result.isCompliant ? 'bg-destructive/5' : ''}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{result.buildingA}</span>
                      <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{result.buildingB}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {result.scenario1Distance?.toFixed(2) || '-'}m
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {result.scenario2Distance?.toFixed(2) || '-'}m
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold">
                    {result.requiredDistance.toFixed(2)}m
                  </TableCell>
                  <TableCell className="text-center">
                    {result.isCompliant ? (
                      <CheckCircle className="h-5 w-5 text-success mx-auto" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive mx-auto" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
