/**
 * Saved Calculations Panel - Shows all saved calculations for a project
 * Includes: Hydraulic, Separation, Emergency Exit
 */
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Calculator, 
  Ruler, 
  DoorOpen, 
  Droplets,
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

interface SavedCalculationsPanelProps {
  projectId: string;
}

interface HydraulicCalc {
  id: string;
  name: string;
  created_at: string;
  results: Json;
  is_active: boolean;
}

interface SeparationCalc {
  id: string;
  name: string;
  created_at: string;
  calculations: Json;
  buildings: Json;
  is_active: boolean;
}

interface EmergencyExitCalc {
  id: string;
  name: string;
  created_at: string;
  results: Json;
  buildings: Json;
  is_active: boolean;
}

export function SavedCalculationsPanel({ projectId }: SavedCalculationsPanelProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hydraulicCalcs, setHydraulicCalcs] = useState<HydraulicCalc[]>([]);
  const [separationCalcs, setSeparationCalcs] = useState<SeparationCalc[]>([]);
  const [emergencyExitCalcs, setEmergencyExitCalcs] = useState<EmergencyExitCalc[]>([]);
  const [expandedCalcs, setExpandedCalcs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchAllCalculations();
  }, [projectId]);

  const fetchAllCalculations = async () => {
    setLoading(true);
    try {
      const [hydraulicRes, separationRes, emergencyRes] = await Promise.all([
        supabase
          .from('hydraulic_calculations')
          .select('id, name, created_at, results, is_active')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false }),
        supabase
          .from('separation_calculations')
          .select('id, name, created_at, calculations, buildings, is_active')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false }),
        supabase
          .from('emergency_exit_calculations')
          .select('id, name, created_at, results, buildings, is_active')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false }),
      ]);

      if (hydraulicRes.data) setHydraulicCalcs(hydraulicRes.data as HydraulicCalc[]);
      if (separationRes.data) setSeparationCalcs(separationRes.data as SeparationCalc[]);
      if (emergencyRes.data) setEmergencyExitCalcs(emergencyRes.data as EmergencyExitCalc[]);
    } catch (error) {
      console.error('Error fetching calculations:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const toggleExpanded = (id: string) => {
    setExpandedCalcs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDeleteCalc = async (table: string, id: string) => {
    if (!confirm('Deseja realmente excluir este cálculo?')) return;
    
    try {
      const { error } = await supabase.from(table as any).delete().eq('id', id);
      if (error) throw error;
      toast.success('Cálculo excluído');
      fetchAllCalculations();
    } catch (error) {
      toast.error('Erro ao excluir');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  const totalCalcs = hydraulicCalcs.length + separationCalcs.length + emergencyExitCalcs.length;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="hydraulic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="hydraulic" className="gap-2">
            <Droplets className="h-4 w-4" />
            Hidráulico ({hydraulicCalcs.length})
          </TabsTrigger>
          <TabsTrigger value="separation" className="gap-2">
            <Ruler className="h-4 w-4" />
            Separação ({separationCalcs.length})
          </TabsTrigger>
          <TabsTrigger value="emergency" className="gap-2">
            <DoorOpen className="h-4 w-4" />
            Saídas ({emergencyExitCalcs.length})
          </TabsTrigger>
        </TabsList>

        {/* Hydraulic Calculations */}
        <TabsContent value="hydraulic" className="space-y-4 mt-4">
          {hydraulicCalcs.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <Droplets className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum cálculo hidráulico salvo.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => navigate(`/app/projects/${projectId}/hydraulic`)}
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Ir para Calculadora
                </Button>
              </CardContent>
            </Card>
          ) : (
            hydraulicCalcs.map(calc => {
              const results = calc.results as any;
              const isExpanded = expandedCalcs[calc.id];
              
              return (
                <Collapsible key={calc.id} open={isExpanded} onOpenChange={() => toggleExpanded(calc.id)}>
                  <Card className={calc.is_active ? 'border-primary/30' : ''}>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-base flex items-center gap-2">
                              <Droplets className="h-4 w-4 text-primary" />
                              {calc.name || 'Cálculo Hidráulico'}
                              {calc.is_active && <Badge variant="secondary">Ativo</Badge>}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(calc.created_at)}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); navigate(`/app/projects/${projectId}/hydraulic`); }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); handleDeleteCalc('hydraulic_calculations', calc.id); }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent>
                        {results ? (
                          <div className="space-y-4">
                            {/* Config/Demand Summary */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="p-3 rounded-lg bg-muted/50">
                                <p className="text-sm text-muted-foreground">Vazão Total</p>
                                <p className="font-mono font-bold">
                                  {results.config?.demandConfig?.totalFlow?.toFixed(0) || 
                                   results.summary?.totalFlow?.toFixed(0) || '-'} L/min
                                </p>
                              </div>
                              <div className="p-3 rounded-lg bg-muted/50">
                                <p className="text-sm text-muted-foreground">Pressão Bomba</p>
                                <p className="font-mono font-bold">
                                  {results.pump?.minPressure?.toFixed(2) || 
                                   results.summary?.minPressure?.toFixed(2) || '-'} mca
                                </p>
                              </div>
                              <div className="p-3 rounded-lg bg-muted/50">
                                <p className="text-sm text-muted-foreground">Reserva</p>
                                <p className="font-mono font-bold">
                                  {results.reserve?.volumeLiters?.toLocaleString() || 
                                   results.config?.demandConfig?.reserveVolume?.toLocaleString() || '-'} L
                                </p>
                              </div>
                              <div className="p-3 rounded-lg bg-muted/50">
                                <p className="text-sm text-muted-foreground">Tipo Sistema</p>
                                <p className="font-mono font-bold">
                                  {results.config?.ntcbSystemType ? `Tipo ${results.config.ntcbSystemType}` : 
                                   results.summary?.systemType || '-'}
                                </p>
                              </div>
                            </div>
                            
                            {/* Pump Details */}
                            {results.pump && (
                              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                                <p className="text-sm font-medium mb-2">Bomba</p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Potência: </span>
                                    <span className="font-mono">{results.pump.commercialPowerCV || '-'} CV</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Eficiência: </span>
                                    <span className="font-mono">{((results.pump.efficiency || 0) * 100).toFixed(0)}%</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Vazão: </span>
                                    <span className="font-mono">{results.pump.totalFlowLmin?.toFixed(0) || '-'} L/min</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Pressão: </span>
                                    <span className="font-mono">{results.pump.minPressure?.toFixed(2) || '-'} mca</span>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {/* Hydrants Summary */}
                            {results.hydrants?.mostUnfavorable && (
                              <div className="p-3 rounded-lg bg-muted/30">
                                <p className="text-sm font-medium mb-2">Hidrantes Mais Desfavoráveis</p>
                                <div className="flex flex-wrap gap-2">
                                  {(Array.isArray(results.hydrants.mostUnfavorable) 
                                    ? results.hydrants.mostUnfavorable 
                                    : [results.hydrants.mostUnfavorable]
                                  ).map((h: any, i: number) => (
                                    <Badge key={i} variant={h.isOk ? 'secondary' : 'destructive'}>
                                      {h.id}: {h.nozzlePressure?.toFixed(2)} mca
                                      {h.isOk ? ' ✓' : ' ✗'}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-sm">Dados detalhados não disponíveis</p>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })
          )}
        </TabsContent>

        {/* Separation Calculations */}
        <TabsContent value="separation" className="space-y-4 mt-4">
          {separationCalcs.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <Ruler className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum cálculo de separação salvo.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => navigate(`/app/projects/${projectId}/separacao`)}
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Ir para Calculadora
                </Button>
              </CardContent>
            </Card>
          ) : (
            separationCalcs.map(calc => {
              const calculations = calc.calculations as any[];
              const buildings = calc.buildings as any[];
              const isExpanded = expandedCalcs[calc.id];
              
              return (
                <Collapsible key={calc.id} open={isExpanded} onOpenChange={() => toggleExpanded(calc.id)}>
                  <Card className={calc.is_active ? 'border-primary/30' : ''}>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-base flex items-center gap-2">
                              <Ruler className="h-4 w-4 text-primary" />
                              {calc.name || 'Cálculo de Separação'}
                              {calc.is_active && <Badge variant="secondary">Ativo</Badge>}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(calc.created_at)}
                              {buildings && <span>• {buildings.length} edificações</span>}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); navigate(`/app/projects/${projectId}/separacao`); }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); handleDeleteCalc('separation_calculations', calc.id); }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent>
                        {calculations && Array.isArray(calculations) && calculations.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Expositora</TableHead>
                                <TableHead>Em Exposição</TableHead>
                                <TableHead className="text-right">Dist. Exigida</TableHead>
                                <TableHead className="text-right">Dist. Existente</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {calculations.map((c: any, idx: number) => {
                                // Handle nested structure from database
                                const result = c.result || c;
                                const scenario1 = result?.scenario1;
                                const scenario2 = result?.scenario2;
                                const expositoraName = scenario1?.expositoraName || c.buildingAName || 'Expositora';
                                const emExposicaoName = scenario1?.emExposicaoName || c.buildingBName || 'Em Exposição';
                                const requiredDist = result?.minimumDistance || c.requiredDistance || c.distanceRequired || '-';
                                const existingDist = c.existingDistance || result?.existingDistance || '-';
                                const isCompliant = result?.isCompliant ?? c.isCompliant ?? c.compliant ?? false;
                                
                                return (
                                  <TableRow key={idx}>
                                    <TableCell className="font-medium">{expositoraName}</TableCell>
                                    <TableCell>{emExposicaoName}</TableCell>
                                    <TableCell className="text-right font-mono">
                                      {typeof requiredDist === 'number' ? requiredDist.toFixed(2) : requiredDist}m
                                    </TableCell>
                                    <TableCell className="text-right font-mono">
                                      {typeof existingDist === 'number' ? existingDist.toFixed(2) : existingDist}m
                                    </TableCell>
                                    <TableCell className="text-center">
                                      {isCompliant ? (
                                        <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                                      ) : (
                                        <XCircle className="h-5 w-5 text-destructive mx-auto" />
                                      )}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        ) : buildings && Array.isArray(buildings) && buildings.length > 0 ? (
                          <div className="space-y-3">
                            <p className="text-sm font-medium">Edificações cadastradas:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {buildings.map((b: any, idx: number) => (
                                <div key={idx} className="p-3 rounded-lg bg-muted/50 border">
                                  <p className="font-medium">{b.name || `Edificação ${idx + 1}`}</p>
                                  <div className="text-sm text-muted-foreground mt-1 space-y-1">
                                    {b.occupancyCode && <p>Ocupação: {b.occupancyCode}</p>}
                                    {b.totalArea && <p>Área: {b.totalArea} m²</p>}
                                    {b.height && <p>Altura: {b.height} m</p>}
                                    {b.fireLoadMJm2 && <p>Carga Incêndio: {b.fireLoadMJm2} MJ/m²</p>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-sm">Dados detalhados não disponíveis</p>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })
          )}
        </TabsContent>

        {/* Emergency Exit Calculations */}
        <TabsContent value="emergency" className="space-y-4 mt-4">
          {emergencyExitCalcs.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <DoorOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum cálculo de saídas de emergência salvo.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => navigate(`/app/projects/${projectId}/saidas`)}
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Ir para Calculadora
                </Button>
              </CardContent>
            </Card>
          ) : (
            emergencyExitCalcs.map(calc => {
              const results = calc.results as any;
              const isExpanded = expandedCalcs[calc.id];
              
              return (
                <Collapsible key={calc.id} open={isExpanded} onOpenChange={() => toggleExpanded(calc.id)}>
                  <Card className={calc.is_active ? 'border-primary/30' : ''}>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-base flex items-center gap-2">
                              <DoorOpen className="h-4 w-4 text-primary" />
                              {calc.name || 'Cálculo de Saídas'}
                              {calc.is_active && <Badge variant="secondary">Ativo</Badge>}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(calc.created_at)}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); navigate(`/app/projects/${projectId}/emergency-exit`); }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); handleDeleteCalc('emergency_exit_calculations', calc.id); }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent>
                        {results ? (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-3 rounded-lg bg-muted/50">
                              <p className="text-sm text-muted-foreground">População Total</p>
                              <p className="font-mono font-bold">{results.totalPopulation || '-'}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-muted/50">
                              <p className="text-sm text-muted-foreground">UPs Necessárias</p>
                              <p className="font-mono font-bold">{results.totalUpRequired || '-'}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-muted/50">
                              <p className="text-sm text-muted-foreground">Largura Req.</p>
                              <p className="font-mono font-bold">{results.totalWidthRequired?.toFixed(2) || '-'}m</p>
                            </div>
                            <div className="p-3 rounded-lg bg-muted/50">
                              <p className="text-sm text-muted-foreground">Status</p>
                              <p className={`font-bold ${results.isCompliant ? 'text-success' : 'text-destructive'}`}>
                                {results.isCompliant ? 'Conforme' : 'Não Conforme'}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-sm">Dados detalhados não disponíveis</p>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
