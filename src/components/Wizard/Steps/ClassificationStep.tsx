/**
 * Step 3 - Intelligent Classification (Occupancy)
 * Fixed: Added type="button" to prevent form submission
 */
import { useState, useMemo } from 'react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { ProjectFormData, SectorFormData } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Plus, 
  Trash2, 
  Tag, 
  Search, 
  ChevronDown, 
  ChevronUp,
  Building,
  Flame,
  Users,
  Info
} from 'lucide-react';
import { OCCUPANCY_DIVISIONS, OCCUPANCY_GROUPS } from '@/core/ntcbClassification';
import { cn } from '@/lib/utils';
import FloatingChatbot from '@/components/FloatingChatbot';

interface ClassificationStepProps {
  form: UseFormReturn<ProjectFormData>;
}

// Simplified CNAE data for search
const CNAE_DATA = [
  { code: '47.11-3', description: 'Comércio varejista de mercadorias em geral', division: 'C-2', fireLoad: 400 },
  { code: '47.21-1', description: 'Comércio varejista de produtos de padaria', division: 'C-2', fireLoad: 300 },
  { code: '56.11-2', description: 'Restaurantes e similares', division: 'F-8', fireLoad: 200 },
  { code: '55.10-8', description: 'Hotéis e similares', division: 'B-1', fireLoad: 300 },
  { code: '85.11-2', description: 'Educação infantil - creche', division: 'E-5', fireLoad: 300 },
  { code: '85.12-1', description: 'Educação infantil - pré-escola', division: 'E-5', fireLoad: 300 },
  { code: '85.13-9', description: 'Ensino fundamental', division: 'E-1', fireLoad: 300 },
  { code: '85.20-1', description: 'Ensino médio', division: 'E-1', fireLoad: 300 },
  { code: '86.10-1', description: 'Atividades de atendimento hospitalar', division: 'H-3', fireLoad: 300 },
  { code: '86.30-5', description: 'Atividades de atenção ambulatorial', division: 'H-6', fireLoad: 200 },
  { code: '69.11-7', description: 'Atividades jurídicas', division: 'D-1', fireLoad: 700 },
  { code: '69.20-6', description: 'Atividades de contabilidade', division: 'D-1', fireLoad: 700 },
  { code: '64.10-7', description: 'Banco comercial', division: 'D-2', fireLoad: 300 },
  { code: '45.11-1', description: 'Comércio de automóveis', division: 'G-4', fireLoad: 200 },
  { code: '47.31-8', description: 'Comércio de combustíveis', division: 'G-3', fireLoad: 200 },
  { code: '10.91-1', description: 'Fabricação de alimentos para animais', division: 'I-2', fireLoad: 800 },
  { code: '52.11-7', description: 'Armazenamento', division: 'J-3', fireLoad: 800 },
];

function generateSectorId() {
  return `sector_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function ClassificationStep({ form }: ClassificationStepProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'sectors',
  });

  const [openSectors, setOpenSectors] = useState<Record<string, boolean>>({});
  const [cnaeSearch, setCnaeSearch] = useState('');
  const [openCombobox, setOpenCombobox] = useState<string | null>(null);

  const sectors = form.watch('sectors') || [];
  const stateCode = form.watch('stateCode') || 'MT';

  const toggleSector = (id: string) => {
    setOpenSectors(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddSector = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newSector: SectorFormData = {
      id: generateSectorId(),
      name: `Setor ${fields.length + 1}`,
      area: 0,
      occupancyCode: '',
      fireLoad: 300,
      population: 0,
      floorHeight: 3,
      numberOfFloors: 1,
      fireLoadOverride: false,
      populationOverride: false,
    };
    append(newSector);
    setOpenSectors(prev => ({ ...prev, [newSector.id]: true }));
  };

  const handleRemoveSector = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    remove(index);
  };

  const handleSelectCNAE = (index: number, cnae: typeof CNAE_DATA[0]) => {
    const division = OCCUPANCY_DIVISIONS.find(d => d.code === cnae.division);
    form.setValue(`sectors.${index}.cnaeCode`, cnae.code);
    form.setValue(`sectors.${index}.occupancyCode`, cnae.division);
    form.setValue(`sectors.${index}.occupancyName`, division?.name || '');
    form.setValue(`sectors.${index}.fireLoad`, cnae.fireLoad);
    
    // Calculate population estimate
    const area = form.getValues(`sectors.${index}.area`) || 100;
    const populationFactor = getPopulationFactor(cnae.division);
    form.setValue(`sectors.${index}.population`, Math.ceil(area / populationFactor));
    
    setOpenCombobox(null);
  };

  const handleSelectDivision = (index: number, code: string) => {
    const division = OCCUPANCY_DIVISIONS.find(d => d.code === code);
    if (division) {
      form.setValue(`sectors.${index}.occupancyCode`, code);
      form.setValue(`sectors.${index}.occupancyName`, division.name);
      form.setValue(`sectors.${index}.fireLoad`, getDefaultFireLoad(code));
      
      const area = form.getValues(`sectors.${index}.area`) || 100;
      const populationFactor = getPopulationFactor(code);
      form.setValue(`sectors.${index}.population`, Math.ceil(area / populationFactor));
    }
  };

  const filteredCNAE = useMemo(() => {
    if (!cnaeSearch) return CNAE_DATA.slice(0, 10);
    const search = cnaeSearch.toLowerCase();
    return CNAE_DATA.filter(c => 
      c.description.toLowerCase().includes(search) || c.code.includes(search)
    ).slice(0, 10);
  }, [cnaeSearch]);

  // Risk classification summary
  const riskSummary = useMemo(() => {
    if (sectors.length === 0) return null;
    
    const maxFireLoad = Math.max(...sectors.map(s => s.fireLoad || 300));
    const totalArea = sectors.reduce((sum, s) => sum + (s.area || 0), 0);
    const totalPopulation = sectors.reduce((sum, s) => sum + (s.population || 0), 0);
    
    let riskClass: 'baixo' | 'medio' | 'alto' = 'baixo';
    if (maxFireLoad > 1200) riskClass = 'alto';
    else if (maxFireLoad > 300) riskClass = 'medio';

    return { maxFireLoad, totalArea, totalPopulation, riskClass };
  }, [sectors]);

  return (
    <div className="space-y-6 pb-24">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-primary" />
                Setores e Ocupações
              </CardTitle>
              <CardDescription>
                Adicione os setores da edificação e classifique cada um
              </CardDescription>
            </div>
            <Button type="button" onClick={handleAddSector} className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Setor
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {fields.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
              <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum setor cadastrado</h3>
              <p className="text-muted-foreground mb-4">
                Adicione pelo menos um setor para classificar a edificação
              </p>
              <Button type="button" onClick={handleAddSector} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Primeiro Setor
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => (
                <Collapsible
                  key={field.id}
                  open={openSectors[field.id] !== false}
                  onOpenChange={() => toggleSector(field.id)}
                >
                  <div className="border border-border rounded-lg overflow-hidden">
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-4 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{sectors[index]?.name || `Setor ${index + 1}`}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {sectors[index]?.occupancyCode && (
                                <Badge variant="secondary" className="text-xs">
                                  {sectors[index].occupancyCode}
                                </Badge>
                              )}
                              {sectors[index]?.area > 0 && (
                                <span>{sectors[index].area} m²</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={(e) => handleRemoveSector(e, index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          {openSectors[field.id] !== false ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="p-4 space-y-4 border-t border-border">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`sectors.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nome do Setor</FormLabel>
                                <FormControl>
                                  <Input placeholder="Ex: Loja Principal" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`sectors.${index}.area`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Área (m²)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="0"
                                    {...field}
                                    onChange={e => {
                                      const area = parseFloat(e.target.value) || 0;
                                      field.onChange(area);
                                      // Recalculate population
                                      const code = form.getValues(`sectors.${index}.occupancyCode`);
                                      if (code) {
                                        const factor = getPopulationFactor(code);
                                        form.setValue(`sectors.${index}.population`, Math.ceil(area / factor));
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Occupancy Selection Tabs */}
                        <div className="border border-border rounded-lg p-4">
                          <Tabs defaultValue="cnae" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-4">
                              <TabsTrigger value="cnae" className="gap-2">
                                <Search className="h-4 w-4" />
                                Buscar por CNAE
                              </TabsTrigger>
                              <TabsTrigger value="manual" className="gap-2">
                                <Tag className="h-4 w-4" />
                                Seleção Manual
                              </TabsTrigger>
                            </TabsList>

                            <TabsContent value="cnae" className="space-y-4">
                              <Popover 
                                open={openCombobox === field.id} 
                                onOpenChange={(open) => setOpenCombobox(open ? field.id : null)}
                              >
                                <PopoverTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    role="combobox"
                                    className="w-full justify-between"
                                  >
                                    {sectors[index]?.cnaeCode 
                                      ? `${sectors[index].cnaeCode} - ${CNAE_DATA.find(c => c.code === sectors[index].cnaeCode)?.description || ''}`
                                      : 'Buscar atividade econômica...'}
                                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[400px] p-0" align="start">
                                  <Command>
                                    <CommandInput 
                                      placeholder="Digite: padaria, escritório, hotel..." 
                                      value={cnaeSearch}
                                      onValueChange={setCnaeSearch}
                                    />
                                    <CommandList>
                                      <CommandEmpty>Nenhuma atividade encontrada.</CommandEmpty>
                                      <CommandGroup>
                                        {filteredCNAE.map((cnae) => (
                                          <CommandItem
                                            key={cnae.code}
                                            value={cnae.description}
                                            onSelect={() => handleSelectCNAE(index, cnae)}
                                          >
                                            <div className="flex flex-col">
                                              <span className="font-medium">{cnae.code}</span>
                                              <span className="text-sm text-muted-foreground">{cnae.description}</span>
                                            </div>
                                            <Badge variant="outline" className="ml-auto">
                                              {cnae.division}
                                            </Badge>
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                            </TabsContent>

                            <TabsContent value="manual" className="space-y-4">
                              <FormField
                                control={form.control}
                                name={`sectors.${index}.occupancyCode`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Divisão NTCB</FormLabel>
                                    <Select 
                                      onValueChange={(value) => {
                                        field.onChange(value);
                                        handleSelectDivision(index, value);
                                      }} 
                                      value={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Selecione a divisão" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent className="max-h-[300px]">
                                        {OCCUPANCY_GROUPS.map((group) => (
                                          <div key={group.group}>
                                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted">
                                              Grupo {group.group} - {group.name}
                                            </div>
                                            {OCCUPANCY_DIVISIONS
                                              .filter(d => d.group === group.group)
                                              .map((div) => (
                                                <SelectItem key={div.code} value={div.code}>
                                                  <span className="font-medium">{div.code}</span> - {div.name}
                                                </SelectItem>
                                              ))
                                            }
                                          </div>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TabsContent>
                          </Tabs>
                        </div>

                        {/* Selected Occupancy Info */}
                        {sectors[index]?.occupancyCode && (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Flame className="h-4 w-4 text-orange-500" />
                              <div>
                                <p className="text-xs text-muted-foreground">Carga de Incêndio</p>
                                <p className="font-medium">{sectors[index].fireLoad || 300} MJ/m²</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-blue-500" />
                              <div>
                                <p className="text-xs text-muted-foreground">Pop. Estimada</p>
                                <p className="font-medium">{sectors[index].population || 0} pessoas</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Info className="h-4 w-4 text-primary" />
                              <div>
                                <p className="text-xs text-muted-foreground">Divisão</p>
                                <p className="font-medium">{sectors[index].occupancyCode}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Risk Summary Card */}
      {riskSummary && (
        <Card className={cn(
          "border-2",
          riskSummary.riskClass === 'baixo' && "border-emerald-500/50",
          riskSummary.riskClass === 'medio' && "border-amber-500/50",
          riskSummary.riskClass === 'alto' && "border-red-500/50",
        )}>
          <CardHeader>
            <CardTitle className="text-lg">Resumo da Classificação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Carga Máxima</p>
                <p className="text-xl font-bold">{riskSummary.maxFireLoad} MJ/m²</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Área Total</p>
                <p className="text-xl font-bold">{riskSummary.totalArea.toLocaleString()} m²</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">População Total</p>
                <p className="text-xl font-bold">{riskSummary.totalPopulation} pessoas</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Classificação</p>
                <Badge 
                  variant={riskSummary.riskClass === 'baixo' ? 'secondary' : riskSummary.riskClass === 'medio' ? 'default' : 'destructive'}
                  className="text-lg px-3 py-1"
                >
                  Risco {riskSummary.riskClass.charAt(0).toUpperCase() + riskSummary.riskClass.slice(1)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Floating Chatbot for classification help */}
      <FloatingChatbot
        stateCode={stateCode}
        title="Ajuda Classificação"
        placeholder="Dúvidas sobre classificação..."
        context="O usuário está classificando setores de uma edificação. Ajude com dúvidas sobre divisões de ocupação (A-1, C-2, etc), carga de incêndio, população e requisitos normativos."
        suggestions={[
          'Como classificar uma loja de roupas?',
          'Qual a carga de incêndio para restaurante?',
          'Quando usar divisão H-3?',
          'Como calcular população de shopping?',
        ]}
      />
    </div>
  );
}

// Helper functions
function getDefaultFireLoad(code: string): number {
  const fireLoadMap: Record<string, number> = {
    'A-1': 300, 'A-2': 300, 'A-3': 300,
    'B-1': 500, 'B-2': 500,
    'C-1': 700, 'C-2': 800, 'C-3': 1000,
    'D-1': 700, 'D-2': 300, 'D-3': 500, 'D-4': 700,
    'E-1': 300, 'E-2': 300, 'E-3': 300, 'E-4': 300, 'E-5': 300, 'E-6': 300,
    'F-1': 500, 'F-2': 300, 'F-3': 300, 'F-4': 300, 'F-5': 200, 'F-6': 300, 'F-7': 300, 'F-8': 200,
    'G-1': 300, 'G-2': 200, 'G-3': 200, 'G-4': 200,
    'H-1': 300, 'H-2': 300, 'H-3': 300, 'H-4': 300, 'H-5': 300, 'H-6': 200,
    'I-1': 500, 'I-2': 1000, 'I-3': 2000,
    'J-1': 500, 'J-2': 1000, 'J-3': 800, 'J-4': 1500,
  };
  return fireLoadMap[code] || 300;
}

function getPopulationFactor(code: string): number {
  const group = code.charAt(0);
  const factorMap: Record<string, number> = {
    'A': 15, // Residential - 1 person per 15 m²
    'B': 10, // Hotel
    'C': 5,  // Commercial
    'D': 7,  // Services
    'E': 1.5, // Education
    'F': 1,  // Assembly
    'G': 20, // Parking
    'H': 7,  // Health
    'I': 10, // Industrial
    'J': 30, // Storage
  };
  return factorMap[group] || 10;
}
