/**
 * Hierarchical Building Editor Component
 * Building → Floor → Sector → Doors
 */
import { useState } from 'react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { 
  ProjectFormData, 
  ProjectBuildingData, 
  ProjectFloorData, 
  ProjectSectorData,
  DoorData,
  generateBuildingId,
  generateFloorId,
  generateSectorId,
  generateDoorId
} from '@/components/Wizard/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  Building2,
  Layers,
  LayoutGrid,
  DoorOpen,
  Flame,
  Droplets
} from 'lucide-react';
import { OCCUPANCY_DIVISIONS } from '@/core/ntcbClassification';
import { cn } from '@/lib/utils';

interface BuildingEditorProps {
  form: UseFormReturn<ProjectFormData>;
}

// Population density factors by occupancy group
const DENSITY_FACTORS: Record<string, number> = {
  'A': 3, 'B': 15, 'C': 5, 'D': 7, 'E': 1.5, 'F': 3, 
  'G': 20, 'H': 7, 'I': 30, 'J': 30,
};

function getDensityFactor(code: string): number {
  const group = code?.charAt(0)?.toUpperCase() || 'D';
  return DENSITY_FACTORS[group] || 10;
}

function getDefaultFireLoad(code: string): number {
  const group = code?.charAt(0)?.toUpperCase();
  const fireLoads: Record<string, number> = {
    'A': 300, 'B': 300, 'C': 400, 'D': 700, 'E': 300,
    'F': 200, 'G': 200, 'H': 300, 'I': 800, 'J': 800,
  };
  return fireLoads[group] || 300;
}

export function BuildingEditor({ form }: BuildingEditorProps) {
  const { fields: buildings, append: appendBuilding, remove: removeBuilding } = useFieldArray({
    control: form.control,
    name: 'buildings',
  });

  const [openBuildings, setOpenBuildings] = useState<Record<string, boolean>>({});
  const [openFloors, setOpenFloors] = useState<Record<string, boolean>>({});
  const [openSectors, setOpenSectors] = useState<Record<string, boolean>>({});

  const toggleBuilding = (id: string) => setOpenBuildings(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleFloor = (id: string) => setOpenFloors(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleSector = (id: string) => setOpenSectors(prev => ({ ...prev, [id]: !prev[id] }));

  const handleAddBuilding = (e: React.MouseEvent) => {
    e.preventDefault();
    const newBuilding: ProjectBuildingData = {
      id: generateBuildingId(),
      name: `Edificação ${buildings.length + 1}`,
      floors: [{
        id: generateFloorId(),
        name: 'Térreo',
        height: 3,
        sectors: [],
      }],
      hasSprinklers: false,
      hasFireWall: false,
      hasWaterCurtain: false,
      hasOpeningProtection: false,
    };
    appendBuilding(newBuilding);
    setOpenBuildings(prev => ({ ...prev, [newBuilding.id]: true }));
  };

  const handleAddFloor = (e: React.MouseEvent, buildingIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    const currentFloors = form.getValues(`buildings.${buildingIndex}.floors`) || [];
    const newFloor: ProjectFloorData = {
      id: generateFloorId(),
      name: `${currentFloors.length + 1}º Pavimento`,
      height: 3,
      sectors: [],
    };
    form.setValue(`buildings.${buildingIndex}.floors`, [...currentFloors, newFloor]);
    setOpenFloors(prev => ({ ...prev, [newFloor.id]: true }));
  };

  const handleRemoveFloor = (e: React.MouseEvent, buildingIndex: number, floorIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    const currentFloors = form.getValues(`buildings.${buildingIndex}.floors`) || [];
    form.setValue(`buildings.${buildingIndex}.floors`, currentFloors.filter((_, i) => i !== floorIndex));
  };

  const handleAddSector = (e: React.MouseEvent, buildingIndex: number, floorIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    const currentSectors = form.getValues(`buildings.${buildingIndex}.floors.${floorIndex}.sectors`) || [];
    const newSector: ProjectSectorData = {
      id: generateSectorId(),
      name: `Setor ${currentSectors.length + 1}`,
      area: 0,
      fireLoad: 300,
      densityM2PerPerson: 10,
      doors: [],
      fireLoadOverride: false,
      populationOverride: false,
    };
    form.setValue(`buildings.${buildingIndex}.floors.${floorIndex}.sectors`, [...currentSectors, newSector]);
    setOpenSectors(prev => ({ ...prev, [newSector.id]: true }));
  };

  const handleRemoveSector = (e: React.MouseEvent, buildingIndex: number, floorIndex: number, sectorIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    const currentSectors = form.getValues(`buildings.${buildingIndex}.floors.${floorIndex}.sectors`) || [];
    form.setValue(`buildings.${buildingIndex}.floors.${floorIndex}.sectors`, currentSectors.filter((_, i) => i !== sectorIndex));
  };

  const handleAddDoor = (e: React.MouseEvent, buildingIndex: number, floorIndex: number, sectorIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    const currentDoors = form.getValues(`buildings.${buildingIndex}.floors.${floorIndex}.sectors.${sectorIndex}.doors`) || [];
    const newDoor: DoorData = {
      id: generateDoorId(),
      width: 1.0,
      height: 2.1,
      quantity: 1,
    };
    form.setValue(`buildings.${buildingIndex}.floors.${floorIndex}.sectors.${sectorIndex}.doors`, [...currentDoors, newDoor]);
  };

  const handleRemoveDoor = (e: React.MouseEvent, buildingIndex: number, floorIndex: number, sectorIndex: number, doorIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    const currentDoors = form.getValues(`buildings.${buildingIndex}.floors.${floorIndex}.sectors.${sectorIndex}.doors`) || [];
    form.setValue(`buildings.${buildingIndex}.floors.${floorIndex}.sectors.${sectorIndex}.doors`, currentDoors.filter((_, i) => i !== doorIndex));
  };

  const handleSelectOccupancy = (buildingIndex: number, floorIndex: number, sectorIndex: number, code: string) => {
    const division = OCCUPANCY_DIVISIONS.find(d => d.code === code);
    if (division) {
      form.setValue(`buildings.${buildingIndex}.floors.${floorIndex}.sectors.${sectorIndex}.occupancyCode`, code);
      form.setValue(`buildings.${buildingIndex}.floors.${floorIndex}.sectors.${sectorIndex}.occupancyName`, division.name);
      form.setValue(`buildings.${buildingIndex}.floors.${floorIndex}.sectors.${sectorIndex}.fireLoad`, getDefaultFireLoad(code));
      form.setValue(`buildings.${buildingIndex}.floors.${floorIndex}.sectors.${sectorIndex}.densityM2PerPerson`, getDensityFactor(code));
      
      // Recalculate population
      const area = form.getValues(`buildings.${buildingIndex}.floors.${floorIndex}.sectors.${sectorIndex}.area`) || 0;
      const density = getDensityFactor(code);
      form.setValue(`buildings.${buildingIndex}.floors.${floorIndex}.sectors.${sectorIndex}.population`, Math.ceil(area / density));
    }
  };

  const watchedBuildings = form.watch('buildings') || [];

  // Calculate totals for summary
  const totals = watchedBuildings.reduce((acc, building) => {
    building.floors?.forEach(floor => {
      floor.sectors?.forEach(sector => {
        acc.area += sector.area || 0;
        acc.population += sector.population || Math.ceil((sector.area || 0) / (sector.densityM2PerPerson || 10));
      });
    });
    return acc;
  }, { area: 0, population: 0 });

  return (
    <div className="space-y-6 pb-24">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Edificações e Setores
              </CardTitle>
              <CardDescription>
                Cadastre as edificações, pavimentos e setores do projeto
              </CardDescription>
            </div>
            <Button type="button" onClick={handleAddBuilding} className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Edificação
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {buildings.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma edificação cadastrada</h3>
              <p className="text-muted-foreground mb-4">
                Adicione pelo menos uma edificação para classificar o projeto
              </p>
              <Button type="button" onClick={handleAddBuilding} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Primeira Edificação
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {buildings.map((building, buildingIndex) => (
                <Collapsible
                  key={building.id}
                  open={openBuildings[building.id] !== false}
                  onOpenChange={() => toggleBuilding(building.id)}
                >
                  <div className="border border-border rounded-lg overflow-hidden">
                    {/* Building Header */}
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-4 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">{watchedBuildings[buildingIndex]?.name || `Edificação ${buildingIndex + 1}`}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Badge variant="outline" className="text-xs">
                                {watchedBuildings[buildingIndex]?.floors?.length || 0} pavimento(s)
                              </Badge>
                              {watchedBuildings[buildingIndex]?.hasSprinklers && (
                                <Badge variant="secondary" className="text-xs gap-1">
                                  <Droplets className="h-3 w-3" />
                                  Sprinklers
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); removeBuilding(buildingIndex); }}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          {openBuildings[building.id] !== false ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="p-4 space-y-4 border-t border-border bg-card">
                        {/* Building Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name={`buildings.${buildingIndex}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nome da Edificação</FormLabel>
                                <FormControl>
                                  <Input placeholder="Ex: Bloco A" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`buildings.${buildingIndex}.facadeWidth`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Largura Fachada (m)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    step="0.1"
                                    placeholder="0.00"
                                    {...field}
                                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`buildings.${buildingIndex}.facadeHeight`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Altura Fachada (m)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    step="0.1"
                                    placeholder="0.00"
                                    {...field}
                                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Building Protection Options */}
                        <div className="p-3 rounded-lg bg-muted/50 space-y-3">
                          <p className="text-sm font-medium flex items-center gap-2">
                            <Flame className="h-4 w-4 text-warning" />
                            Proteções (Separação entre Edificações)
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <FormField
                              control={form.control}
                              name={`buildings.${buildingIndex}.hasSprinklers`}
                              render={({ field }) => (
                                <FormItem className="flex items-center gap-2 space-y-0">
                                  <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">Sprinklers</FormLabel>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`buildings.${buildingIndex}.hasFireWall`}
                              render={({ field }) => (
                                <FormItem className="flex items-center gap-2 space-y-0">
                                  <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">Parede Corta-fogo</FormLabel>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`buildings.${buildingIndex}.hasOpeningProtection`}
                              render={({ field }) => (
                                <FormItem className="flex items-center gap-2 space-y-0">
                                  <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">Proteção Aberturas</FormLabel>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`buildings.${buildingIndex}.hasWaterCurtain`}
                              render={({ field }) => (
                                <FormItem className="flex items-center gap-2 space-y-0">
                                  <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">Cortina d'água</FormLabel>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        {/* Floors Section */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="font-medium flex items-center gap-2">
                              <Layers className="h-4 w-4 text-primary" />
                              Pavimentos
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={(e) => handleAddFloor(e, buildingIndex)}
                              className="gap-1"
                            >
                              <Plus className="h-3 w-3" />
                              Pavimento
                            </Button>
                          </div>

                          {(watchedBuildings[buildingIndex]?.floors || []).map((floor, floorIndex) => (
                            <Collapsible
                              key={floor.id}
                              open={openFloors[floor.id] !== false}
                              onOpenChange={() => toggleFloor(floor.id)}
                            >
                              <div className="border border-border rounded-lg ml-4 overflow-hidden">
                                {/* Floor Header */}
                                <CollapsibleTrigger asChild>
                                  <div className="flex items-center justify-between p-3 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-2">
                                      <Layers className="h-4 w-4 text-muted-foreground" />
                                      <span className="font-medium text-sm">{floor.name || `Pavimento ${floorIndex + 1}`}</span>
                                      <Badge variant="outline" className="text-xs">
                                        {floor.sectors?.length || 0} setor(es)
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => handleRemoveFloor(e, buildingIndex, floorIndex)}
                                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                      {openFloors[floor.id] !== false ? (
                                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                      ) : (
                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                      )}
                                    </div>
                                  </div>
                                </CollapsibleTrigger>

                                <CollapsibleContent>
                                  <div className="p-3 space-y-3 border-t border-border">
                                    {/* Floor Name */}
                                    <FormField
                                      control={form.control}
                                      name={`buildings.${buildingIndex}.floors.${floorIndex}.name`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="text-xs">Nome do Pavimento</FormLabel>
                                          <FormControl>
                                            <Input placeholder="Ex: Térreo, 1º Andar" className="h-8 text-sm" {...field} />
                                          </FormControl>
                                        </FormItem>
                                      )}
                                    />

                                    {/* Sectors */}
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between">
                                        <p className="text-xs font-medium flex items-center gap-1 text-muted-foreground">
                                          <LayoutGrid className="h-3 w-3" />
                                          Setores
                                        </p>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={(e) => handleAddSector(e, buildingIndex, floorIndex)}
                                          className="h-6 text-xs gap-1"
                                        >
                                          <Plus className="h-3 w-3" />
                                          Setor
                                        </Button>
                                      </div>

                                      {(floor.sectors || []).length === 0 ? (
                                        <div className="text-center py-4 text-xs text-muted-foreground border border-dashed border-border rounded">
                                          Nenhum setor. Clique em "+ Setor" para adicionar.
                                        </div>
                                      ) : (
                                        (floor.sectors || []).map((sector, sectorIndex) => (
                                          <Collapsible
                                            key={sector.id}
                                            open={openSectors[sector.id] !== false}
                                            onOpenChange={() => toggleSector(sector.id)}
                                          >
                                            <div className="border border-border rounded ml-4 overflow-hidden">
                                              {/* Sector Header */}
                                              <CollapsibleTrigger asChild>
                                                <div className="flex items-center justify-between p-2 bg-background cursor-pointer hover:bg-muted/30 transition-colors">
                                                  <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                                                      {sectorIndex + 1}
                                                    </div>
                                                    <span className="text-sm">{sector.name || `Setor ${sectorIndex + 1}`}</span>
                                                    {sector.occupancyCode && (
                                                      <Badge variant="secondary" className="text-xs">{sector.occupancyCode}</Badge>
                                                    )}
                                                    {sector.area > 0 && (
                                                      <span className="text-xs text-muted-foreground">{sector.area} m²</span>
                                                    )}
                                                  </div>
                                                  <div className="flex items-center gap-1">
                                                    <Button
                                                      type="button"
                                                      variant="ghost"
                                                      size="sm"
                                                      onClick={(e) => handleRemoveSector(e, buildingIndex, floorIndex, sectorIndex)}
                                                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                                    >
                                                      <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                    {openSectors[sector.id] !== false ? (
                                                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                                    ) : (
                                                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                  </div>
                                                </div>
                                              </CollapsibleTrigger>

                                              <CollapsibleContent>
                                                <div className="p-3 space-y-3 border-t border-border bg-muted/20">
                                                  {/* Sector Fields */}
                                                  <div className="grid grid-cols-2 gap-3">
                                                    <FormField
                                                      control={form.control}
                                                      name={`buildings.${buildingIndex}.floors.${floorIndex}.sectors.${sectorIndex}.name`}
                                                      render={({ field }) => (
                                                        <FormItem>
                                                          <FormLabel className="text-xs">Nome</FormLabel>
                                                          <FormControl>
                                                            <Input placeholder="Ex: Loja" className="h-8 text-sm" {...field} />
                                                          </FormControl>
                                                        </FormItem>
                                                      )}
                                                    />
                                                    <FormField
                                                      control={form.control}
                                                      name={`buildings.${buildingIndex}.floors.${floorIndex}.sectors.${sectorIndex}.area`}
                                                      render={({ field }) => (
                                                        <FormItem>
                                                          <FormLabel className="text-xs">Área (m²)</FormLabel>
                                                          <FormControl>
                                                            <Input 
                                                              type="number"
                                                              className="h-8 text-sm"
                                                              placeholder="0"
                                                              {...field}
                                                              onChange={e => {
                                                                const area = parseFloat(e.target.value) || 0;
                                                                field.onChange(area);
                                                                // Recalculate population
                                                                const density = form.getValues(`buildings.${buildingIndex}.floors.${floorIndex}.sectors.${sectorIndex}.densityM2PerPerson`) || 10;
                                                                form.setValue(`buildings.${buildingIndex}.floors.${floorIndex}.sectors.${sectorIndex}.population`, Math.ceil(area / density));
                                                              }}
                                                            />
                                                          </FormControl>
                                                        </FormItem>
                                                      )}
                                                    />
                                                  </div>

                                                  <FormField
                                                    control={form.control}
                                                    name={`buildings.${buildingIndex}.floors.${floorIndex}.sectors.${sectorIndex}.occupancyCode`}
                                                    render={({ field }) => (
                                                      <FormItem>
                                                        <FormLabel className="text-xs">Ocupação NTCB</FormLabel>
                                                        <Select 
                                                          onValueChange={(value) => handleSelectOccupancy(buildingIndex, floorIndex, sectorIndex, value)} 
                                                          value={field.value}
                                                        >
                                                          <FormControl>
                                                            <SelectTrigger className="h-8 text-sm">
                                                              <SelectValue placeholder="Selecione..." />
                                                            </SelectTrigger>
                                                          </FormControl>
                                                          <SelectContent>
                                                            {OCCUPANCY_DIVISIONS.map(div => (
                                                              <SelectItem key={div.code} value={div.code}>
                                                                {div.code} - {div.name}
                                                              </SelectItem>
                                                            ))}
                                                          </SelectContent>
                                                        </Select>
                                                      </FormItem>
                                                    )}
                                                  />

                                                  <div className="grid grid-cols-2 gap-3">
                                                    <FormField
                                                      control={form.control}
                                                      name={`buildings.${buildingIndex}.floors.${floorIndex}.sectors.${sectorIndex}.fireLoad`}
                                                      render={({ field }) => (
                                                        <FormItem>
                                                          <FormLabel className="text-xs">Carga Incêndio (MJ/m²)</FormLabel>
                                                          <FormControl>
                                                            <Input 
                                                              type="number"
                                                              className="h-8 text-sm"
                                                              {...field}
                                                              onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                                            />
                                                          </FormControl>
                                                        </FormItem>
                                                      )}
                                                    />
                                                    <FormField
                                                      control={form.control}
                                                      name={`buildings.${buildingIndex}.floors.${floorIndex}.sectors.${sectorIndex}.population`}
                                                      render={({ field }) => (
                                                        <FormItem>
                                                          <FormLabel className="text-xs">População</FormLabel>
                                                          <FormControl>
                                                            <Input 
                                                              type="number"
                                                              className="h-8 text-sm"
                                                              {...field}
                                                              onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                                                            />
                                                          </FormControl>
                                                        </FormItem>
                                                      )}
                                                    />
                                                  </div>

                                                  {/* Doors Section */}
                                                  <div className="space-y-2 pt-2 border-t border-border">
                                                    <div className="flex items-center justify-between">
                                                      <p className="text-xs font-medium flex items-center gap-1">
                                                        <DoorOpen className="h-3 w-3 text-primary" />
                                                        Portas de Saída
                                                      </p>
                                                      <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => handleAddDoor(e, buildingIndex, floorIndex, sectorIndex)}
                                                        className="h-6 text-xs gap-1"
                                                      >
                                                        <Plus className="h-3 w-3" />
                                                        Porta
                                                      </Button>
                                                    </div>

                                                    {(sector.doors || []).length === 0 ? (
                                                      <p className="text-xs text-muted-foreground text-center py-2">
                                                        Nenhuma porta cadastrada
                                                      </p>
                                                    ) : (
                                                      <div className="space-y-2">
                                                        {(sector.doors || []).map((door, doorIndex) => (
                                                          <div key={door.id} className="flex items-center gap-2 p-2 rounded bg-background border border-border">
                                                            <DoorOpen className="h-4 w-4 text-muted-foreground" />
                                                            <FormField
                                                              control={form.control}
                                                              name={`buildings.${buildingIndex}.floors.${floorIndex}.sectors.${sectorIndex}.doors.${doorIndex}.quantity`}
                                                              render={({ field }) => (
                                                                <Input 
                                                                  type="number"
                                                                  className="h-7 w-14 text-xs text-center"
                                                                  min={1}
                                                                  {...field}
                                                                  onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                                                                />
                                                              )}
                                                            />
                                                            <span className="text-xs text-muted-foreground">×</span>
                                                            <FormField
                                                              control={form.control}
                                                              name={`buildings.${buildingIndex}.floors.${floorIndex}.sectors.${sectorIndex}.doors.${doorIndex}.width`}
                                                              render={({ field }) => (
                                                                <Input 
                                                                  type="number"
                                                                  step="0.05"
                                                                  className="h-7 w-16 text-xs"
                                                                  placeholder="1.00"
                                                                  {...field}
                                                                  onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                                                />
                                                              )}
                                                            />
                                                            <span className="text-xs text-muted-foreground">m</span>
                                                            <Button
                                                              type="button"
                                                              variant="ghost"
                                                              size="sm"
                                                              onClick={(e) => handleRemoveDoor(e, buildingIndex, floorIndex, sectorIndex, doorIndex)}
                                                              className="h-6 w-6 p-0 text-destructive hover:text-destructive ml-auto"
                                                            >
                                                              <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                          </div>
                                                        ))}
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>
                                              </CollapsibleContent>
                                            </div>
                                          </Collapsible>
                                        ))
                                      )}
                                    </div>
                                  </div>
                                </CollapsibleContent>
                              </div>
                            </Collapsible>
                          ))}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Card */}
      {buildings.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Resumo do Projeto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">{buildings.length}</p>
                <p className="text-xs text-muted-foreground">Edificação(ões)</p>
              </div>
              <div>
                <p className="text-2xl font-bold font-mono">{totals.area.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Área Total (m²)</p>
              </div>
              <div>
                <p className="text-2xl font-bold font-mono">{totals.population}</p>
                <p className="text-xs text-muted-foreground">População Est.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
