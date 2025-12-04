/**
 * Sector Card Component - Individual sector form
 */
import { useState, useMemo } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { Trash2, Building, ChevronDown, ChevronUp, Search, Edit2 } from 'lucide-react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { OCCUPANCY_DIVISIONS, OCCUPANCY_GROUPS } from '@/core/ntcbClassification';
import { CNAE_MAPPING, FIRE_LOAD_BY_OCCUPANCY, POPULATION_PARAMS } from '@/core/ntcbData';
import { ProjectFormData } from './types';

interface SectorCardProps {
  index: number;
  form: UseFormReturn<ProjectFormData>;
  onRemove: () => void;
  canRemove: boolean;
}

export function SectorCard({ index, form, onRemove, canRemove }: SectorCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [cnaeOpen, setCnaeOpen] = useState(false);
  const [cnaeSearch, setCnaeSearch] = useState('');
  const [selectionMode, setSelectionMode] = useState<'cnae' | 'manual'>('manual');

  const sectorValues = useWatch({
    control: form.control,
    name: `sectors.${index}`,
  });

  const filteredCNAEs = useMemo(() => {
    if (!cnaeSearch) return CNAE_MAPPING.slice(0, 20);
    const search = cnaeSearch.toLowerCase();
    return CNAE_MAPPING.filter(
      (cnae) =>
        cnae.code.toLowerCase().includes(search) ||
        cnae.description.toLowerCase().includes(search)
    ).slice(0, 20);
  }, [cnaeSearch]);

  const getFireLoadForDivision = (code: string): number => {
    const fireLoad = FIRE_LOAD_BY_OCCUPANCY.find((f) => f.occupancyCode === code);
    return fireLoad?.fireLoadMJm2 || 500;
  };

  const getPopulationParams = (code: string) => {
    return POPULATION_PARAMS[code];
  };

  const calculatePopulation = (area: number, code: string): number => {
    const params = getPopulationParams(code);
    if (!params) return Math.ceil(area / 10);
    
    if (params.method === 'area') {
      if (params.factorM2PerPerson) {
        return Math.ceil(area / params.factorM2PerPerson);
      }
      if (params.personsPerM2) {
        return Math.ceil(area * params.personsPerM2);
      }
    }
    return Math.ceil(area / 10); // fallback
  };

  const handleCNAESelect = (cnae: typeof CNAE_MAPPING[0]) => {
    const division = cnae.suggestedDivisions[0];
    const occupancy = OCCUPANCY_DIVISIONS.find((d) => d.code === division);
    
    form.setValue(`sectors.${index}.cnaeCode`, cnae.code);
    form.setValue(`sectors.${index}.occupancyCode`, division);
    form.setValue(`sectors.${index}.occupancyName`, occupancy?.name || '');
    form.setValue(`sectors.${index}.fireLoad`, cnae.defaultFireLoad || getFireLoadForDivision(division));
    
    const area = sectorValues?.area || 0;
    if (area > 0 && !sectorValues?.populationOverride) {
      form.setValue(`sectors.${index}.population`, calculatePopulation(area, division));
    }
    
    setCnaeOpen(false);
  };

  const handleDivisionSelect = (code: string) => {
    const occupancy = OCCUPANCY_DIVISIONS.find((d) => d.code === code);
    form.setValue(`sectors.${index}.occupancyCode`, code);
    form.setValue(`sectors.${index}.occupancyName`, occupancy?.name || '');
    form.setValue(`sectors.${index}.fireLoad`, getFireLoadForDivision(code));
    
    const area = sectorValues?.area || 0;
    if (area > 0 && !sectorValues?.populationOverride) {
      form.setValue(`sectors.${index}.population`, calculatePopulation(area, code));
    }
  };

  const handleAreaChange = (value: number) => {
    form.setValue(`sectors.${index}.area`, value);
    
    const code = sectorValues?.occupancyCode;
    if (code && value > 0 && !sectorValues?.populationOverride) {
      form.setValue(`sectors.${index}.population`, calculatePopulation(value, code));
    }
  };

  const populationParams = sectorValues?.occupancyCode ? getPopulationParams(sectorValues.occupancyCode) : null;
  const calculatedPopulation = sectorValues?.area && sectorValues?.occupancyCode
    ? calculatePopulation(sectorValues.area, sectorValues.occupancyCode)
    : 0;

  return (
    <Card className="border-l-4 border-l-primary/50">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 p-0 h-auto hover:bg-transparent">
                <Building className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">
                  {sectorValues?.name || `Setor ${index + 1}`}
                </CardTitle>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <div className="flex items-center gap-2">
              {sectorValues?.occupancyCode && (
                <Badge variant="secondary">{sectorValues.occupancyCode}</Badge>
              )}
              {sectorValues?.area ? (
                <Badge variant="outline">{sectorValues.area} m²</Badge>
              ) : null}
              {canRemove && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={onRemove}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-4 pt-2">
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
                    <FormLabel>Área do Setor (m²)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Ex: 300"
                        {...field}
                        onChange={(e) => handleAreaChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Activity Selection */}
            <div className="space-y-3">
              <FormLabel>Seleção de Atividade</FormLabel>
              <Tabs value={selectionMode} onValueChange={(v) => setSelectionMode(v as 'cnae' | 'manual')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="cnae" className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Buscar por CNAE
                  </TabsTrigger>
                  <TabsTrigger value="manual" className="flex items-center gap-2">
                    <Edit2 className="h-4 w-4" />
                    Seleção Manual
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="cnae" className="space-y-3">
                  <Popover open={cnaeOpen} onOpenChange={setCnaeOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={cnaeOpen}
                        className="w-full justify-between"
                      >
                        {sectorValues?.cnaeCode
                          ? `${sectorValues.cnaeCode} - ${CNAE_MAPPING.find((c) => c.code === sectorValues.cnaeCode)?.description?.slice(0, 40)}...`
                          : 'Buscar código CNAE...'}
                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0 bg-background border z-50" align="start">
                      <Command>
                        <CommandInput
                          placeholder="Digite o CNAE ou descrição..."
                          value={cnaeSearch}
                          onValueChange={setCnaeSearch}
                        />
                        <CommandList>
                          <CommandEmpty>Nenhum CNAE encontrado.</CommandEmpty>
                          <CommandGroup>
                            {filteredCNAEs.map((cnae) => (
                              <CommandItem
                                key={cnae.code}
                                value={cnae.code}
                                onSelect={() => handleCNAESelect(cnae)}
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium">{cnae.code}</span>
                                  <span className="text-sm text-muted-foreground truncate max-w-[350px]">
                                    {cnae.description}
                                  </span>
                                  <div className="flex gap-1 mt-1">
                                    {cnae.suggestedDivisions.map((div) => (
                                      <Badge key={div} variant="secondary" className="text-xs">
                                        {div}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </TabsContent>

                <TabsContent value="manual" className="space-y-3">
                  <FormField
                    control={form.control}
                    name={`sectors.${index}.occupancyCode`}
                    render={({ field }) => (
                      <FormItem>
                        <Select onValueChange={handleDivisionSelect} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a divisão" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-background border z-50 max-h-[300px]">
                            {OCCUPANCY_GROUPS.map((group) => (
                              <div key={group.group}>
                                <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground bg-muted/50">
                                  Grupo {group.group} - {group.name}
                                </div>
                                {OCCUPANCY_DIVISIONS.filter((d) => d.group === group.group).map((division) => (
                                  <SelectItem key={division.code} value={division.code}>
                                    {division.code} - {division.name}
                                  </SelectItem>
                                ))}
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

            {/* Calculated Fields */}
            {sectorValues?.occupancyCode && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                {/* Fire Load */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-sm">Carga de Incêndio (MJ/m²)</FormLabel>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`fireLoadOverride-${index}`}
                        checked={sectorValues?.fireLoadOverride}
                        onCheckedChange={(checked) =>
                          form.setValue(`sectors.${index}.fireLoadOverride`, !!checked)
                        }
                      />
                      <label htmlFor={`fireLoadOverride-${index}`} className="text-xs text-muted-foreground">
                        Editar
                      </label>
                    </div>
                  </div>
                  <FormField
                    control={form.control}
                    name={`sectors.${index}.fireLoad`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            disabled={!sectorValues?.fireLoadOverride}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            className={!sectorValues?.fireLoadOverride ? 'bg-muted' : ''}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Population */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-sm">População Estimada</FormLabel>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`populationOverride-${index}`}
                        checked={sectorValues?.populationOverride}
                        onCheckedChange={(checked) =>
                          form.setValue(`sectors.${index}.populationOverride`, !!checked)
                        }
                      />
                      <label htmlFor={`populationOverride-${index}`} className="text-xs text-muted-foreground">
                        Editar
                      </label>
                    </div>
                  </div>
                  <FormField
                    control={form.control}
                    name={`sectors.${index}.population`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            disabled={!sectorValues?.populationOverride}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            className={!sectorValues?.populationOverride ? 'bg-muted' : ''}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  {populationParams && sectorValues?.area ? (
                    <p className="text-xs text-muted-foreground">
                      Cálculo: {populationParams.description} = {calculatedPopulation} pessoas
                    </p>
                  ) : null}
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
