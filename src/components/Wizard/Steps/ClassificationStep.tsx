/**
 * Step 3 - Intelligent Classification (Occupancy)
 * TAREFA 4: Busca assíncrona de atividades do banco + Método Determinístico
 */
import { useState, useEffect, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ProjectFormData } from '../types';
import { BuildingEditor } from '@/components/Project/BuildingEditor';
import FloatingChatbot from '@/components/FloatingChatbot';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Flame, 
  Building2, 
  AlertTriangle, 
  CheckCircle2,
  Calculator,
  Database,
  Loader2,
  Info
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface ClassificationStepProps {
  form: UseFormReturn<ProjectFormData>;
}

interface RegulationActivity {
  id: string;
  state_iso: string;
  code: string;
  description: string;
  occupancy_group: string;
  occupancy_division: string;
  fire_load_value: number;
  fire_load_unit: string;
  is_risk_determinant: boolean;
}

export function ClassificationStep({ form }: ClassificationStepProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activities, setActivities] = useState<RegulationActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<RegulationActivity | null>(null);
  const [useDeterministicMethod, setUseDeterministicMethod] = useState(false);
  const [customFireLoad, setCustomFireLoad] = useState<number>(0);
  
  const stateCode = form.watch('stateCode') || 'MT';

  // Debounced search function
  const searchActivities = useCallback(async (term: string) => {
    if (term.length < 2) {
      setActivities([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('regulation_activities')
        .select('*')
        .eq('state_iso', stateCode)
        .or(`description.ilike.%${term}%,code.ilike.%${term}%,occupancy_division.ilike.%${term}%`)
        .limit(15);

      if (error) {
        console.error('Error searching activities:', error);
        setActivities([]);
      } else {
        setActivities(data || []);
      }
    } catch (err) {
      console.error('Search error:', err);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [stateCode]);

  // Effect for debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchActivities(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, searchActivities]);

  // Handle activity selection
  const handleSelectActivity = (activity: RegulationActivity) => {
    setSelectedActivity(activity);
    setCustomFireLoad(activity.fire_load_value);
    setSearchTerm('');
    setActivities([]);

    // Update form with selected activity data
    // This could update a global form field or the first sector
    const buildings = form.getValues('buildings') || [];
    if (buildings.length > 0 && buildings[0].floors?.length > 0 && buildings[0].floors[0].sectors?.length > 0) {
      const firstSector = buildings[0].floors[0].sectors[0];
      form.setValue(`buildings.0.floors.0.sectors.0.occupancyCode`, activity.occupancy_division);
      form.setValue(`buildings.0.floors.0.sectors.0.occupancyName`, activity.description);
      form.setValue(`buildings.0.floors.0.sectors.0.cnaeCode`, activity.code);
      form.setValue(`buildings.0.floors.0.sectors.0.fireLoad`, activity.fire_load_value);
    }
  };

  // Get risk class from fire load
  const getRiskClass = (fireLoad: number): 'baixo' | 'medio' | 'alto' => {
    if (fireLoad <= 300) return 'baixo';
    if (fireLoad <= 1200) return 'medio';
    return 'alto';
  };

  const currentFireLoad = useDeterministicMethod ? customFireLoad : (selectedActivity?.fire_load_value || 0);
  const riskClass = getRiskClass(currentFireLoad);

  return (
    <div className="space-y-6">
      {/* TAREFA 4: Activity Search Card */}
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Busca de Atividade (NTCB 07)
          </CardTitle>
          <CardDescription>
            Digite o nome da atividade, código CNAE ou divisão para buscar no banco de dados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder='Ex: "Restaurante", "Loja de Pneus", "C-2", "4781"...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            {loading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>

          {/* Search Results */}
          {activities.length > 0 && (
            <ScrollArea className="h-64 border rounded-lg">
              <div className="p-2 space-y-1">
                {activities.map((activity) => (
                  <button
                    key={activity.id}
                    type="button"
                    onClick={() => handleSelectActivity(activity)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border transition-all hover:bg-primary/5 hover:border-primary/50",
                      activity.is_risk_determinant && "border-amber-500/30 bg-amber-500/5"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs font-mono">
                            {activity.occupancy_division}
                          </Badge>
                          <span className="font-medium text-sm">{activity.description}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="font-mono">{activity.code}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Flame className="h-3 w-3" />
                            {activity.fire_load_value} {activity.fire_load_unit}
                          </span>
                        </div>
                      </div>
                      {activity.is_risk_determinant && (
                        <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Alto Risco
                        </Badge>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}

          {searchTerm.length >= 2 && activities.length === 0 && !loading && (
            <Alert className="border-muted">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Nenhuma atividade encontrada para "{searchTerm}" em {stateCode}. 
                Tente outro termo ou cadastre a atividade manualmente.
              </AlertDescription>
            </Alert>
          )}

          {/* Selected Activity Card */}
          {selectedActivity && (
            <Card className={cn(
              "border-2",
              riskClass === 'baixo' && "border-emerald-500/50 bg-emerald-500/5",
              riskClass === 'medio' && "border-amber-500/50 bg-amber-500/5",
              riskClass === 'alto' && "border-red-500/50 bg-red-500/5"
            )}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className={cn(
                        "h-5 w-5",
                        riskClass === 'baixo' && "text-emerald-600",
                        riskClass === 'medio' && "text-amber-600",
                        riskClass === 'alto' && "text-red-600"
                      )} />
                      <span className="font-semibold">Atividade Selecionada</span>
                    </div>
                    <div className="pl-7 space-y-1">
                      <p className="text-sm font-medium">{selectedActivity.description}</p>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline">{selectedActivity.occupancy_division}</Badge>
                        <span>•</span>
                        <span className="font-mono">{selectedActivity.code}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-semibold">
                          <Flame className="h-3 w-3" />
                          Carga de Incêndio Normativa: {selectedActivity.fire_load_value} {selectedActivity.fire_load_unit}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge className={cn(
                    riskClass === 'baixo' && "bg-emerald-500",
                    riskClass === 'medio' && "bg-amber-500",
                    riskClass === 'alto' && "bg-red-500"
                  )}>
                    Risco {riskClass.charAt(0).toUpperCase() + riskClass.slice(1)}
                  </Badge>
                </div>

                {selectedActivity.is_risk_determinant && (
                  <Alert className="mt-3 border-amber-500/50 bg-amber-500/10">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-700 text-sm">
                      Esta atividade é <strong>determinante de risco</strong> e força a classificação de toda a edificação.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Deterministic Method Toggle */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="deterministic-method" className="flex items-center gap-2 font-medium">
                  <Calculator className="h-4 w-4" />
                  Calcular Carga de Incêndio Manualmente (Método Determinístico)
                </Label>
                <p className="text-xs text-muted-foreground">
                  Ative para informar a carga de incêndio calculada com base nos materiais (Tabela 2 - Anexo G)
                </p>
              </div>
              <Switch
                id="deterministic-method"
                checked={useDeterministicMethod}
                onCheckedChange={setUseDeterministicMethod}
              />
            </div>

            {useDeterministicMethod && (
              <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-dashed">
                <Alert className="border-blue-500/30 bg-blue-500/5">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-700 text-sm">
                    No método determinístico, a carga de incêndio é calculada com base nos materiais 
                    combustíveis existentes no setor. Preencha a Tabela 2 do Anexo G para documentar.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Carga de Incêndio Calculada (MJ/m²)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={customFireLoad}
                      onChange={(e) => setCustomFireLoad(parseFloat(e.target.value) || 0)}
                      placeholder="Ex: 450"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Classificação de Risco</Label>
                    <div className={cn(
                      "h-10 flex items-center px-3 rounded-md border font-semibold",
                      riskClass === 'baixo' && "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
                      riskClass === 'medio' && "bg-amber-500/10 text-amber-700 border-amber-500/30",
                      riskClass === 'alto' && "bg-red-500/10 text-red-700 border-red-500/30"
                    )}>
                      {riskClass === 'baixo' && '≤ 300 MJ/m² - Risco Baixo'}
                      {riskClass === 'medio' && '301-1200 MJ/m² - Risco Médio'}
                      {riskClass === 'alto' && '> 1200 MJ/m² - Risco Alto'}
                    </div>
                  </div>
                </div>

                <Button type="button" variant="outline" className="w-full gap-2" disabled>
                  <Building2 className="h-4 w-4" />
                  Abrir Formulário de Materiais (Tabela 2 - Em breve)
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Building Editor for sectors */}
      <BuildingEditor form={form} />
      
      <FloatingChatbot />
    </div>
  );
}
