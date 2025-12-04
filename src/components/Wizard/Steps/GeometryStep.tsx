/**
 * Step 2 - Geometry and Special Risks
 */
import { UseFormReturn } from 'react-hook-form';
import { ProjectFormData, specialRisks } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Ruler, AlertTriangle, Building, Layers } from 'lucide-react';

interface GeometryStepProps {
  form: UseFormReturn<ProjectFormData>;
}

export function GeometryStep({ form }: GeometryStepProps) {
  const totalArea = form.watch('totalArea') || 0;
  const totalHeight = form.watch('totalHeight') || 0;
  const numberOfFloors = form.watch('numberOfFloors') || 1;
  
  // Auto-calculate estimated height based on floors
  const estimatedHeight = numberOfFloors * 3;
  
  return (
    <div className="space-y-6 pb-24">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-primary" />
            Dimensões da Edificação
          </CardTitle>
          <CardDescription>
            Área construída e altura total conforme projeto arquitetônico
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={form.control}
            name="totalArea"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Área Total Construída (m²) *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="number" 
                      placeholder="0"
                      className="pl-10 text-lg font-medium"
                      {...field}
                      onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Soma de todas as áreas de piso da edificação
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="numberOfFloors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Pavimentos *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Layers className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="number" 
                        min={1}
                        placeholder="1"
                        className="pl-10"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Inclui subsolo e mezanino
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="totalHeight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Altura Total (m) *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="number" 
                        step={0.1}
                        placeholder={estimatedHeight.toString()}
                        className="pl-10"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Do piso mais baixo ao mais alto
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Summary Card */}
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">{totalArea.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">m² total</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{totalHeight || estimatedHeight}</p>
                <p className="text-xs text-muted-foreground">metros altura</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{numberOfFloors}</p>
                <p className="text-xs text-muted-foreground">pavimentos</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Riscos Especiais
          </CardTitle>
          <CardDescription>
            Marque se a edificação possui alguma destas características
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="specialRisks"
            render={() => (
              <FormItem>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {specialRisks.map((risk) => (
                    <FormField
                      key={risk.id}
                      control={form.control}
                      name="specialRisks"
                      render={({ field }) => (
                        <FormItem
                          className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-border p-4 hover:bg-muted/50 transition-colors"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(risk.id)}
                              onCheckedChange={(checked) => {
                                const current = field.value || [];
                                if (checked) {
                                  field.onChange([...current, risk.id]);
                                } else {
                                  field.onChange(current.filter((v) => v !== risk.id));
                                }
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="cursor-pointer">
                              {risk.label}
                            </FormLabel>
                            <FormDescription className="text-xs">
                              {risk.description}
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
