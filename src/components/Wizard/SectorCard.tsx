/**
 * Sector Card Component - Individual sector form
 */
import { useState } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { Trash2, Building, ChevronDown, ChevronUp } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { OccupancySelector } from '@/components/Project/OccupancySelector';
import { POPULATION_PARAMS } from '@/core/ntcbData';
import { ProjectFormData } from './types';

interface SectorCardProps {
  index: number;
  form: UseFormReturn<ProjectFormData>;
  onRemove: () => void;
  canRemove: boolean;
}

export function SectorCard({ index, form, onRemove, canRemove }: SectorCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const sectorValues = useWatch({
    control: form.control,
    name: `sectors.${index}`,
  });

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

  const handleOccupancySelect = (selection: {
    occupancyCode: string;
    occupancyName: string;
    fireLoad: number;
    cnaeCode?: string;
  }) => {
    form.setValue(`sectors.${index}.occupancyCode`, selection.occupancyCode);
    form.setValue(`sectors.${index}.occupancyName`, selection.occupancyName);
    form.setValue(`sectors.${index}.fireLoad`, selection.fireLoad);
    if (selection.cnaeCode) {
      form.setValue(`sectors.${index}.cnaeCode`, selection.cnaeCode);
    }
    
    const area = sectorValues?.area || 0;
    if (area > 0 && !sectorValues?.populationOverride) {
      form.setValue(`sectors.${index}.population`, calculatePopulation(area, selection.occupancyCode));
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
              <FormLabel>Seleção de Atividade/Ocupação</FormLabel>
              <OccupancySelector
                value={sectorValues?.occupancyCode}
                onSelect={handleOccupancySelect}
              />
              {sectorValues?.cnaeCode && (
                <p className="text-xs text-muted-foreground">
                  CNAE: {sectorValues.cnaeCode}
                </p>
              )}
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
