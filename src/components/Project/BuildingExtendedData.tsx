/**
 * Extended Building Data Forms - Anexo G NTCB 01/2025
 * Collects data for fire safety report tables
 */
import { UseFormReturn } from 'react-hook-form';
import { ProjectFormData } from '@/components/Wizard/types';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Trash2, 
  Shield, 
  AlertTriangle,
  Ruler,
  Truck,
  Footprints,
  Flame
} from 'lucide-react';
import { useState } from 'react';
import { 
  EXISTENCE_PERIODS, 
  HEIGHT_CLASSES, 
  SAFETY_MEASURES, 
  SPECIAL_RISKS,
  getHeightClass,
  getFireRiskLevel
} from './AnnexGReportData';

interface BuildingExtendedDataProps {
  form: UseFormReturn<ProjectFormData>;
  buildingIndex: number;
}

export function BuildingExtendedData({ form, buildingIndex }: BuildingExtendedDataProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    classification: true,
    safety: false,
    fireResistance: false,
    vehicleAccess: false,
    stairs: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const watchedBuilding = form.watch(`buildings.${buildingIndex}`);
  const totalHeight = watchedBuilding?.totalHeight || 0;
  const heightClass = getHeightClass(totalHeight);

  // Calculate total fire load from sectors
  const calculateMaxFireLoad = () => {
    let maxLoad = 0;
    watchedBuilding?.floors?.forEach(floor => {
      floor.sectors?.forEach(sector => {
        if (sector.fireLoad && sector.fireLoad > maxLoad) {
          maxLoad = sector.fireLoad;
        }
      });
    });
    return maxLoad;
  };

  const maxFireLoad = calculateMaxFireLoad();
  const fireRisk = getFireRiskLevel(maxFireLoad);

  // Add stair
  const handleAddStair = (e: React.MouseEvent) => {
    e.preventDefault();
    const currentStairs = form.getValues(`buildings.${buildingIndex}.stairs`) || [];
    const newStair = {
      id: `stair_${Date.now()}`,
      name: `ESCADA ${String(currentStairs.length + 1).padStart(2, '0')}`,
      type: 'NE' as const,
      material: 'AÇO CARBONO',
      width: 0.85,
      heightPerRun: 3.20,
      guardRailHeight: 1.10,
      handrail: {
        height: 0.90,
        diameterCircular: 0.04,
        wallClearance: 40,
      },
      steps: {
        quantityPerRun: 19,
        riserHeight: 16.8,
        treadDepth: 25,
      },
    };
    form.setValue(`buildings.${buildingIndex}.stairs`, [...currentStairs, newStair]);
  };

  const handleRemoveStair = (e: React.MouseEvent, stairIndex: number) => {
    e.preventDefault();
    const currentStairs = form.getValues(`buildings.${buildingIndex}.stairs`) || [];
    form.setValue(`buildings.${buildingIndex}.stairs`, currentStairs.filter((_, i) => i !== stairIndex));
  };

  // Add road
  const handleAddRoad = (e: React.MouseEvent) => {
    e.preventDefault();
    const currentAccess = form.getValues(`buildings.${buildingIndex}.vehicleAccess`) || { roads: [], gates: [] };
    const newRoad = { width: 7.27, freeHeight: 'LIVRE' as const, loadCapacity: 2000, turnType: 'NA' };
    form.setValue(`buildings.${buildingIndex}.vehicleAccess`, {
      ...currentAccess,
      roads: [...(currentAccess.roads || []), newRoad]
    });
  };

  // Add gate
  const handleAddGate = (e: React.MouseEvent) => {
    e.preventDefault();
    const currentAccess = form.getValues(`buildings.${buildingIndex}.vehicleAccess`) || { roads: [], gates: [] };
    const newGate = { width: 7.27, height: 'LIVRE' as const };
    form.setValue(`buildings.${buildingIndex}.vehicleAccess`, {
      ...currentAccess,
      gates: [...(currentAccess.gates || []), newGate]
    });
  };

  return (
    <div className="space-y-3 mt-4">
      {/* Classification Section */}
      <Collapsible open={openSections.classification} onOpenChange={() => toggleSection('classification')}>
        <Card className="border-primary/20">
          <CollapsibleTrigger asChild>
            <CardHeader className="py-3 cursor-pointer hover:bg-muted/30 transition-colors">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-primary" />
                  Classificação NTCB 01/2025
                </span>
                {openSections.classification ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-4">
              {/* Existence Period */}
              <FormField
                control={form.control}
                name={`buildings.${buildingIndex}.existencePeriod`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Período de Existência (Tabela 2 - Anexo A.3)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || 'pos_2023'}>
                      <FormControl>
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="Selecione o período" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EXISTENCE_PERIODS.map(period => (
                          <SelectItem key={period.id} value={period.id}>
                            {period.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {/* Height */}
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name={`buildings.${buildingIndex}.totalHeight`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Altura Total (m)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          className="h-8 text-sm"
                          placeholder="0.00"
                          {...field}
                          onChange={e => {
                            const value = parseFloat(e.target.value) || 0;
                            field.onChange(value);
                            const hClass = getHeightClass(value);
                            form.setValue(`buildings.${buildingIndex}.heightClassType`, hClass.type);
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="space-y-1">
                  <p className="text-xs font-medium">Classificação (Tabela 9)</p>
                  <div className="h-8 flex items-center gap-2">
                    <Badge variant="default">Tipo {heightClass.type}</Badge>
                    <span className="text-xs text-muted-foreground">{heightClass.name}</span>
                  </div>
                </div>
              </div>

              {/* Fire Risk Summary */}
              <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                <p className="text-xs font-medium flex items-center gap-2">
                  <Flame className="h-3 w-3 text-orange-500" />
                  Carga de Incêndio (Tabela 10)
                </p>
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-sm font-mono">{maxFireLoad}</span>
                    <span className="text-xs text-muted-foreground ml-1">MJ/m² (maior setor)</span>
                  </div>
                  <Badge variant={fireRisk === 'BAIXO' ? 'secondary' : fireRisk === 'MÉDIO' ? 'default' : 'destructive'}>
                    Risco {fireRisk}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Safety Measures Section */}
      <Collapsible open={openSections.safety} onOpenChange={() => toggleSection('safety')}>
        <Card className="border-green-500/20">
          <CollapsibleTrigger asChild>
            <CardHeader className="py-3 cursor-pointer hover:bg-muted/30 transition-colors">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  Medidas de Segurança (Seção 5.1.3)
                </span>
                {openSections.safety ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-4">
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {SAFETY_MEASURES.map(measure => (
                  <FormField
                    key={measure.id}
                    control={form.control}
                    name={`buildings.${buildingIndex}.safetyMeasures`}
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={(field.value || []).includes(measure.id)}
                            onCheckedChange={(checked) => {
                              const current = field.value || [];
                              if (checked) {
                                field.onChange([...current, measure.id]);
                              } else {
                                field.onChange(current.filter((id: string) => id !== measure.id));
                              }
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-xs font-normal">{measure.label}</FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>

              {/* Special Risks */}
              <div className="pt-3 border-t border-border">
                <p className="text-xs font-medium flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-3 w-3 text-orange-500" />
                  Riscos Especiais
                </p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  {SPECIAL_RISKS.map(risk => (
                    <FormField
                      key={risk.id}
                      control={form.control}
                      name={`buildings.${buildingIndex}.specialRisks`}
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={(field.value || []).includes(risk.id)}
                              onCheckedChange={(checked) => {
                                const current = field.value || [];
                                if (checked) {
                                  field.onChange([...current, risk.id]);
                                } else {
                                  field.onChange(current.filter((id: string) => id !== risk.id));
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-xs font-normal">{risk.label}</FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Fire Resistance Section */}
      <Collapsible open={openSections.fireResistance} onOpenChange={() => toggleSection('fireResistance')}>
        <Card className="border-orange-500/20">
          <CollapsibleTrigger asChild>
            <CardHeader className="py-3 cursor-pointer hover:bg-muted/30 transition-colors">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-600" />
                  Resistência ao Fogo (Seção 6.1)
                </span>
                {openSections.fireResistance ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name={`buildings.${buildingIndex}.fireResistance.wallType`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Tipo de Parede</FormLabel>
                      <FormControl>
                        <Input className="h-8 text-sm" placeholder="Meio tijolo com revestimento" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`buildings.${buildingIndex}.fireResistance.wallThickness`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Espessura Total (cm)</FormLabel>
                      <FormControl>
                        <Input className="h-8 text-sm" placeholder="15" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name={`buildings.${buildingIndex}.fireResistance.trrfRequired`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">TRRF Exigido (min)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          className="h-8 text-sm" 
                          placeholder="30" 
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`buildings.${buildingIndex}.fireResistance.trrfExisting.trrf`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">TRRF Existente (min)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          className="h-8 text-sm" 
                          placeholder="120" 
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name={`buildings.${buildingIndex}.fireResistance.trrfExisting.integrity`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Integridade (min)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          className="h-8 text-sm" 
                          placeholder="120" 
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`buildings.${buildingIndex}.fireResistance.trrfExisting.tightness`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Estanqueidade (min)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          className="h-8 text-sm" 
                          placeholder="120" 
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`buildings.${buildingIndex}.fireResistance.trrfExisting.thermalInsulation`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Isolação Térmica (min)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          className="h-8 text-sm" 
                          placeholder="120" 
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Vehicle Access Section */}
      <Collapsible open={openSections.vehicleAccess} onOpenChange={() => toggleSection('vehicleAccess')}>
        <Card className="border-blue-500/20">
          <CollapsibleTrigger asChild>
            <CardHeader className="py-3 cursor-pointer hover:bg-muted/30 transition-colors">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-blue-600" />
                  Acesso de Viaturas (Seção 6.2)
                </span>
                {openSections.vehicleAccess ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-4">
              {/* Roads */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium">VIAS</p>
                  <Button type="button" variant="ghost" size="sm" onClick={handleAddRoad} className="h-6 text-xs gap-1">
                    <Plus className="h-3 w-3" /> Via
                  </Button>
                </div>
                {(watchedBuilding?.vehicleAccess?.roads || []).map((road, roadIndex) => (
                  <div key={roadIndex} className="grid grid-cols-5 gap-2 items-end p-2 bg-muted/30 rounded">
                    <FormField
                      control={form.control}
                      name={`buildings.${buildingIndex}.vehicleAccess.roads.${roadIndex}.width`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Largura (m)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" className="h-7 text-xs" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`buildings.${buildingIndex}.vehicleAccess.roads.${roadIndex}.freeHeight`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Altura Livre</FormLabel>
                          <FormControl>
                            <Input className="h-7 text-xs" placeholder="LIVRE" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`buildings.${buildingIndex}.vehicleAccess.roads.${roadIndex}.loadCapacity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Suporte (Kg)</FormLabel>
                          <FormControl>
                            <Input type="number" className="h-7 text-xs" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`buildings.${buildingIndex}.vehicleAccess.roads.${roadIndex}.turnType`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Contorno</FormLabel>
                          <FormControl>
                            <Input className="h-7 text-xs" placeholder="NA" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => {
                        const current = form.getValues(`buildings.${buildingIndex}.vehicleAccess`) || { roads: [], gates: [] };
                        form.setValue(`buildings.${buildingIndex}.vehicleAccess`, {
                          ...current,
                          roads: current.roads.filter((_, i) => i !== roadIndex)
                        });
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Gates */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium">PORTÃO</p>
                  <Button type="button" variant="ghost" size="sm" onClick={handleAddGate} className="h-6 text-xs gap-1">
                    <Plus className="h-3 w-3" /> Portão
                  </Button>
                </div>
                {(watchedBuilding?.vehicleAccess?.gates || []).map((gate, gateIndex) => (
                  <div key={gateIndex} className="grid grid-cols-3 gap-2 items-end p-2 bg-muted/30 rounded">
                    <FormField
                      control={form.control}
                      name={`buildings.${buildingIndex}.vehicleAccess.gates.${gateIndex}.width`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Largura (m)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" className="h-7 text-xs" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`buildings.${buildingIndex}.vehicleAccess.gates.${gateIndex}.height`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Altura</FormLabel>
                          <FormControl>
                            <Input className="h-7 text-xs" placeholder="LIVRE" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => {
                        const current = form.getValues(`buildings.${buildingIndex}.vehicleAccess`) || { roads: [], gates: [] };
                        form.setValue(`buildings.${buildingIndex}.vehicleAccess`, {
                          ...current,
                          gates: current.gates.filter((_, i) => i !== gateIndex)
                        });
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Stairs Section */}
      <Collapsible open={openSections.stairs} onOpenChange={() => toggleSection('stairs')}>
        <Card className="border-purple-500/20">
          <CollapsibleTrigger asChild>
            <CardHeader className="py-3 cursor-pointer hover:bg-muted/30 transition-colors">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Footprints className="h-4 w-4 text-purple-600" />
                  Escadas (Seção 6.3.1)
                </span>
                {openSections.stairs ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-4">
              <div className="flex justify-end">
                <Button type="button" variant="outline" size="sm" onClick={handleAddStair} className="gap-1">
                  <Plus className="h-3 w-3" /> Adicionar Escada
                </Button>
              </div>

              {(watchedBuilding?.stairs || []).map((stair, stairIndex) => (
                <div key={stair.id} className="p-3 border border-border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">- {stair.name}</p>
                    <Button type="button" variant="ghost" size="icon" onClick={(e) => handleRemoveStair(e, stairIndex)} className="h-6 w-6 text-destructive">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <FormField
                      control={form.control}
                      name={`buildings.${buildingIndex}.stairs.${stairIndex}.type`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Tipo</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-7 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="NE">NE - Não Enclausurada</SelectItem>
                              <SelectItem value="EP">EP - Enclausurada Protegida</SelectItem>
                              <SelectItem value="PF">PF - À Prova de Fumaça</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`buildings.${buildingIndex}.stairs.${stairIndex}.material`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Material</FormLabel>
                          <FormControl>
                            <Input className="h-7 text-xs" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`buildings.${buildingIndex}.stairs.${stairIndex}.width`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Largura (m)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" className="h-7 text-xs" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`buildings.${buildingIndex}.stairs.${stairIndex}.heightPerRun`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Altura/Lanço (m)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" className="h-7 text-xs" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <FormField
                      control={form.control}
                      name={`buildings.${buildingIndex}.stairs.${stairIndex}.guardRailHeight`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Guarda-corpo (m)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" className="h-7 text-xs" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`buildings.${buildingIndex}.stairs.${stairIndex}.handrail.height`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Corrimão Alt (m)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" className="h-7 text-xs" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`buildings.${buildingIndex}.stairs.${stairIndex}.steps.riserHeight`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Espelho (cm)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" className="h-7 text-xs" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`buildings.${buildingIndex}.stairs.${stairIndex}.steps.treadDepth`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Passo (cm)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" className="h-7 text-xs" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}

              {(watchedBuilding?.stairs || []).length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">Nenhuma escada cadastrada</p>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
