/**
 * Step 1 - Project Identification with State Selection
 * TAREFA 3: Adicionado campos para Tipo de Projeto e Áreas (Reforma/Ampliação)
 */
import { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ProjectFormData, processTypeOptions, projectTypeOptions } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Building2, User, MapPin, Globe, Info, FileEdit, Calculator } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface IdentificationStepProps {
  form: UseFormReturn<ProjectFormData>;
}

interface AvailableState {
  code: string;
  name: string;
  is_active: boolean;
  regulations_version: string | null;
}

export function IdentificationStep({ form }: IdentificationStepProps) {
  const [states, setStates] = useState<AvailableState[]>([]);
  const [loading, setLoading] = useState(true);
  const selectedState = form.watch('stateCode');
  const projectType = form.watch('projectType');
  const existingArea = form.watch('existingArea') || 0;
  const expansionArea = form.watch('expansionArea') || 0;

  useEffect(() => {
    async function fetchStates() {
      const { data, error } = await supabase
        .from('available_states')
        .select('*')
        .order('name');
      
      if (!error && data) {
        setStates(data);
      }
      setLoading(false);
    }
    fetchStates();
  }, []);

  // Auto-calculate total area for reform/expansion projects
  useEffect(() => {
    if (projectType === 'expansion' || projectType === 'reform') {
      const calculatedTotal = existingArea + expansionArea;
      if (calculatedTotal > 0) {
        form.setValue('totalArea', calculatedTotal);
      }
    }
  }, [projectType, existingArea, expansionArea, form]);

  const currentState = states.find(s => s.code === selectedState);
  const isStateActive = currentState?.is_active ?? false;
  const showAreaFields = projectType === 'reform' || projectType === 'expansion';

  return (
    <div className="space-y-6 pb-24">
      {/* State Selection - First and prominent */}
      <Card className="border-primary/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Estado da Edificação
          </CardTitle>
          <CardDescription>
            Selecione o estado para aplicar as normas técnicas correspondentes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="stateCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado *</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    const state = states.find(s => s.code === value);
                    if (state) {
                      form.setValue('state', state.code);
                      // Update regulation version based on state
                      form.setValue('regulationVersion', state.regulations_version || 'NTCB-2025');
                    }
                  }} 
                  value={field.value}
                  disabled={loading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={loading ? "Carregando..." : "Selecione o estado"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state.code} value={state.code}>
                        <div className="flex items-center gap-2">
                          <span>{state.name}</span>
                          {state.is_active ? (
                            <Badge variant="default" className="text-xs">Ativo</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">Em breve</Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {selectedState && !isStateActive && (
            <Alert className="border-amber-500/50 bg-amber-500/5">
              <Info className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-700">
                As normas técnicas de <strong>{currentState?.name}</strong> ainda não estão totalmente implementadas. 
                O sistema usará as normas de Mato Grosso (NTCB) como referência.
              </AlertDescription>
            </Alert>
          )}

          {selectedState && isStateActive && currentState?.regulations_version && (
            <Alert className="border-emerald-500/50 bg-emerald-500/5">
              <Info className="h-4 w-4 text-emerald-600" />
              <AlertDescription className="text-emerald-700">
                Usando normas de <strong>{currentState.name}</strong> - Versão {currentState.regulations_version}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* TAREFA 3: Project Type Card */}
      <Card className="border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileEdit className="h-5 w-5 text-blue-600" />
            Tipo de Projeto
          </CardTitle>
          <CardDescription>
            Defina se é uma construção nova, reforma ou ampliação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="projectType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Projeto *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || 'new'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {projectTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  {projectType === 'new' && 'Projeto para edificação totalmente nova.'}
                  {projectType === 'reform' && 'Projeto para reforma de edificação existente.'}
                  {projectType === 'expansion' && 'Projeto para ampliação de edificação existente.'}
                  {projectType === 'substitution' && 'Substituição de PSCIP anterior.'}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Area fields for reform/expansion */}
          {showAreaFields && (
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-dashed">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Calculator className="h-4 w-4" />
                Cálculo de Áreas
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="existingArea"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Área Existente (m²)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          placeholder="0.00" 
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Área já construída
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expansionArea"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {projectType === 'reform' ? 'Área de Reforma (m²)' : 'Área a Ampliar (m²)'}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          placeholder="0.00" 
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        {projectType === 'reform' ? 'Área a reformar' : 'Nova área a construir'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel>Área Total (m²)</FormLabel>
                  <Input 
                    type="number" 
                    value={(existingArea + expansionArea).toFixed(2)}
                    disabled 
                    className="bg-muted font-semibold"
                  />
                  <FormDescription className="text-xs">
                    Calculado automaticamente
                  </FormDescription>
                </FormItem>
              </div>

              <Alert className="border-blue-500/30 bg-blue-500/5">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700 text-sm">
                  Para projetos de {projectType === 'reform' ? 'reforma' : 'ampliação'}, 
                  a Área Total será preenchida na <strong>Tabela 1 - Apresentação</strong> do Anexo G.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Dados do Projeto
          </CardTitle>
          <CardDescription>
            Informações básicas de identificação do projeto PSCIP
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="projectName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Projeto *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Edifício Comercial Centro" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="processType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Processo *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {processTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Responsáveis
          </CardTitle>
          <CardDescription>
            Proprietário e responsável técnico pelo projeto
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="owner"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Proprietário / Razão Social *</FormLabel>
                <FormControl>
                  <Input placeholder="Nome completo ou razão social" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="technicalResponsible"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Responsável Técnico *</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do engenheiro/arquiteto responsável" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Localização
          </CardTitle>
          <CardDescription>
            Endereço completo da edificação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Endereço *</FormLabel>
                <FormControl>
                  <Input placeholder="Rua, número, bairro" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cidade *</FormLabel>
                  <FormControl>
                    <Input placeholder="Cuiabá" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Estado</FormLabel>
              <Input 
                value={currentState?.name || selectedState || 'MT'} 
                disabled 
                className="bg-muted"
              />
            </FormItem>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
