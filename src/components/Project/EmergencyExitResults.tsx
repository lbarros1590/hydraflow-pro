/**
 * Emergency Exit Results - Integrated into Project
 * Uses project building data to calculate NTCB 13/2020 compliance
 */
import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  DoorOpen, 
  CheckCircle, 
  XCircle, 
  ChevronDown, 
  ChevronUp,
  FileText,
  AlertTriangle,
  Users,
  Printer
} from 'lucide-react';
import { ProjectBuildingData } from '@/components/Wizard/types';
import { 
  calculatePopulation, 
  calculateUP, 
  calculateRequiredWidth, 
  calculateExistingWidth,
  validateSector,
  calculateBuilding
} from '@/lib/emergencyExit/calculator';
import { openEmergencyExitReportForPrint } from '@/lib/emergencyExit/reportGenerator';
import type { Door, EmergencyBuilding } from '@/lib/emergencyExit/types';

interface EmergencyExitResultsProps {
  buildings: ProjectBuildingData[];
  projectName?: string;
}

interface SectorResult {
  sectorName: string;
  floorName: string;
  buildingName: string;
  occupancyCode: string;
  area: number;
  density: number;
  population: number;
  upRequired: number;
  widthRequired: number;
  widthExisting: number;
  isCompliant: boolean;
  doors: Door[];
}

export function EmergencyExitResults({ buildings, projectName }: EmergencyExitResultsProps) {
  const [expandedBuildings, setExpandedBuildings] = useState<Record<string, boolean>>({});

  const results = useMemo(() => {
    const sectorResults: SectorResult[] = [];
    
    buildings.forEach(building => {
      building.floors?.forEach(floor => {
        floor.sectors?.forEach(sector => {
          const density = sector.densityM2PerPerson || 10;
          const population = sector.population || calculatePopulation(sector.area || 0, density);
          const upRequired = calculateUP(population);
          const widthRequired = calculateRequiredWidth(upRequired);
          
          // Convert doors to the expected format
          const doors: Door[] = (sector.doors || []).map(d => ({
            id: d.id,
            width: d.width,
            height: d.height,
            quantity: d.quantity,
            observation: d.observation,
          }));
          
          const widthExisting = calculateExistingWidth(doors);
          const isCompliant = validateSector(widthRequired, widthExisting);

          sectorResults.push({
            sectorName: sector.name,
            floorName: floor.name,
            buildingName: building.name,
            occupancyCode: sector.occupancyCode || '-',
            area: sector.area || 0,
            density,
            population,
            upRequired,
            widthRequired,
            widthExisting,
            isCompliant,
            doors,
          });
        });
      });
    });

    return sectorResults;
  }, [buildings]);

  const summary = useMemo(() => {
    const totalSectors = results.length;
    const compliantSectors = results.filter(r => r.isCompliant).length;
    const nonCompliantSectors = totalSectors - compliantSectors;
    const totalPopulation = results.reduce((sum, r) => sum + r.population, 0);
    const totalArea = results.reduce((sum, r) => sum + r.area, 0);
    
    return {
      totalSectors,
      compliantSectors,
      nonCompliantSectors,
      totalPopulation,
      totalArea,
      isFullyCompliant: nonCompliantSectors === 0 && totalSectors > 0,
    };
  }, [results]);

  const handleGenerateReport = (buildingName: string) => {
    // Convert specific building to EmergencyBuilding format
    const building = buildings.find(b => b.name === buildingName);
    if (!building) return;

    const emergencyBuilding: EmergencyBuilding = {
      id: building.id,
      name: building.name,
      address: building.address,
      floors: (building.floors || []).map(f => ({
        id: f.id,
        name: f.name,
        height: f.height,
        sectors: (f.sectors || []).map(s => ({
          id: s.id,
          name: s.name,
          occupancyCode: s.occupancyCode || '',
          densityM2PerPerson: s.densityM2PerPerson || 10,
          area: s.area || 0,
          doors: (s.doors || []).map(d => ({
            id: d.id,
            width: d.width,
            height: d.height,
            quantity: d.quantity,
            observation: d.observation,
          })),
        })),
      })),
    };

    const buildingResult = calculateBuilding(emergencyBuilding);
    openEmergencyExitReportForPrint(buildingResult, projectName);
  };

  const toggleBuilding = (name: string) => {
    setExpandedBuildings(prev => ({ ...prev, [name]: !prev[name] }));
  };

  if (results.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DoorOpen className="h-5 w-5 text-primary" />
            Saídas de Emergência
          </CardTitle>
          <CardDescription>NTCB 13/2020 - Anexo G, Item 6.3</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum setor cadastrado.</p>
            <p className="text-sm">Adicione edificações, pavimentos e setores no passo de Classificação.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group results by building
  const resultsByBuilding = results.reduce((acc, result) => {
    if (!acc[result.buildingName]) acc[result.buildingName] = [];
    acc[result.buildingName].push(result);
    return acc;
  }, {} as Record<string, SectorResult[]>);

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card className={summary.isFullyCompliant ? 'border-success/50 bg-success/5' : 'border-warning/50 bg-warning/5'}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DoorOpen className="h-5 w-5 text-primary" />
              Saídas de Emergência
            </CardTitle>
            <Badge variant={summary.isFullyCompliant ? 'default' : 'destructive'} className="gap-1">
              {summary.isFullyCompliant ? (
                <><CheckCircle className="h-3 w-3" /> Conforme</>
              ) : (
                <><XCircle className="h-3 w-3" /> {summary.nonCompliantSectors} não conforme(s)</>
              )}
            </Badge>
          </div>
          <CardDescription>NTCB 13/2020 - Anexo G, Item 6.3</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-background">
              <p className="text-2xl font-bold">{summary.totalSectors}</p>
              <p className="text-xs text-muted-foreground">Setores</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-background">
              <p className="text-2xl font-bold font-mono">{summary.totalArea.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Área Total (m²)</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-background">
              <p className="text-2xl font-bold flex items-center justify-center gap-1">
                <Users className="h-5 w-5" />
                {summary.totalPopulation}
              </p>
              <p className="text-xs text-muted-foreground">População</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-background">
              <p className="text-2xl font-bold text-success">{summary.compliantSectors}</p>
              <p className="text-xs text-muted-foreground">Conformes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results by Building */}
      {Object.entries(resultsByBuilding).map(([buildingName, sectors]) => {
        const buildingCompliant = sectors.every(s => s.isCompliant);
        const isExpanded = expandedBuildings[buildingName] !== false;

        return (
          <Collapsible key={buildingName} open={isExpanded} onOpenChange={() => toggleBuilding(buildingName)}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      {buildingName}
                      <Badge variant={buildingCompliant ? 'outline' : 'destructive'} className="ml-2">
                        {buildingCompliant ? 'OK' : 'Verificar'}
                      </Badge>
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-1"
                        onClick={(e) => { e.stopPropagation(); handleGenerateReport(buildingName); }}
                      >
                        <Printer className="h-3 w-3" />
                        Relatório
                      </Button>
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pavimento / Setor</TableHead>
                        <TableHead className="text-center">Ocup.</TableHead>
                        <TableHead className="text-right">Área</TableHead>
                        <TableHead className="text-right">Pop.</TableHead>
                        <TableHead className="text-right">UP</TableHead>
                        <TableHead className="text-right">Larg. Req.</TableHead>
                        <TableHead className="text-right">Larg. Exist.</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sectors.map((sector, idx) => (
                        <TableRow key={idx} className={!sector.isCompliant ? 'bg-destructive/5' : ''}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{sector.sectorName}</p>
                              <p className="text-xs text-muted-foreground">{sector.floorName}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary">{sector.occupancyCode}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono">{sector.area}</TableCell>
                          <TableCell className="text-right font-mono">{sector.population}</TableCell>
                          <TableCell className="text-right font-mono">{sector.upRequired}</TableCell>
                          <TableCell className="text-right font-mono">{sector.widthRequired.toFixed(2)}m</TableCell>
                          <TableCell className="text-right font-mono">{sector.widthExisting.toFixed(2)}m</TableCell>
                          <TableCell className="text-center">
                            {sector.isCompliant ? (
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
              </CollapsibleContent>
            </Card>
          </Collapsible>
        );
      })}
    </div>
  );
}
