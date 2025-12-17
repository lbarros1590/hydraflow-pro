/**
 * Extended Building Data Forms - Anexo G NTCB 01/2025
 * Collects data for fire safety report tables (per building: classification, fire resistance, stairs)
 */
import { UseFormReturn } from 'react-hook-form';
import { ProjectFormData } from '@/components/Wizard/types';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
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
  Ruler,
  Footprints,
  Flame
} from 'lucide-react';
import { useState } from 'react';
import { 
  EXISTENCE_PERIODS, 
  getHeightClass,
  getFireRiskLevel
} from './AnnexGReportData';

interface BuildingExtendedDataProps {
  form: UseFormReturn<ProjectFormData>;
  buildingIndex: number;
}

export function BuildingExtendedData({ form, buildingIndex }: BuildingExtendedDataProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    fireResistance: true,
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
