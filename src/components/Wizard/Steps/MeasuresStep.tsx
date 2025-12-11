/**
 * Step 4 - Mandatory & Voluntary Measures Checklist + Vehicle Access + Existence Period
 */
import { useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ProjectFormData, ALL_MEASURES } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormControl, FormLabel } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  ClipboardCheck, 
  Shield, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  Plus,
  Heart,
  FireExtinguisher,
  SignpostBig,
  Lightbulb,
  Bell,
  Droplets,
  Waves,
  CloudRain,
  Radar,
  Users,
  DoorOpen,
  KeyRound,
  FileText,
  Truck,
  Trash2,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EXISTENCE_PERIODS } from '@/components/Project/AnnexGReportData';

interface MeasuresStepProps {
  form: UseFormReturn<ProjectFormData>;
}

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  FireExtinguisher, SignpostBig, Lightbulb, Bell, Droplets, 
  Waves, CloudRain, Radar, Users, DoorOpen, KeyRound, FileText
};

export function MeasuresStep({ form }: MeasuresStepProps) {
  const sectors = form.watch('sectors') || [];
  const totalArea = form.watch('totalArea') || 0;
  const totalHeight = form.watch('totalHeight') || 0;
  const specialRisks = form.watch('specialRisks') || [];
  const exemptMeasures = form.watch('exemptMeasures') || [];
  const voluntaryMeasures = form.watch('voluntaryMeasures') || [];
  const vehicleAccess = form.watch('vehicleAccess') || { roads: [], gates: [] };

  // Calculate mandatory measures based on project data
  const analysis = useMemo(() => {
    const maxFireLoad = sectors.length > 0 
      ? Math.max(...sectors.map(s => s.fireLoad || 300))
      : 300;

    // Determine risk class
    let riskClass: 'baixo' | 'medio' | 'alto' = 'baixo';
    if (maxFireLoad > 1200 || specialRisks.length > 0) riskClass = 'alto';
    else if (maxFireLoad > 300) riskClass = 'medio';

    // Determine mandatory measures based on NTCB 01/2025
    const mandatory: string[] = ['extintores', 'sinalizacao', 'iluminacao', 'saidas'];

    // Area-based requirements
    if (totalArea > 750 || riskClass !== 'baixo') {
      mandatory.push('alarme');
    }
    if (totalArea > 1500 || totalHeight > 12 || riskClass === 'alto') {
      mandatory.push('hidrantes');
    }
    if (totalArea > 5000 || totalHeight > 30 || riskClass === 'alto') {
      mandatory.push('spk');
      mandatory.push('deteccao');
    }
    if (totalArea > 10000 || totalHeight > 60) {
      mandatory.push('chuveiros');
    }
    if (totalArea > 2000) {
      mandatory.push('brigada');
      mandatory.push('ppcip');
    }

    // Special risk requirements
    if (specialRisks.includes('glp') || specialRisks.includes('inflamaveis')) {
      if (!mandatory.includes('deteccao')) mandatory.push('deteccao');
      if (!mandatory.includes('alarme')) mandatory.push('alarme');
    }
    if (specialRisks.includes('subsolo')) {
      if (!mandatory.includes('hidrantes')) mandatory.push('hidrantes');
    }

    return {
      mandatory: [...new Set(mandatory)],
      riskClass,
      maxFireLoad,
    };
  }, [sectors, totalArea, totalHeight, specialRisks]);

  const handleExemptToggle = (measureId: string, isExempt: boolean) => {
    const current = form.getValues('exemptMeasures') || [];
    if (isExempt) {
      form.setValue('exemptMeasures', [...current, measureId]);
    } else {
      form.setValue('exemptMeasures', current.filter(id => id !== measureId));
    }
  };

  const handleVoluntaryToggle = (measureId: string, isVoluntary: boolean) => {
    const current = form.getValues('voluntaryMeasures') || [];
    if (isVoluntary) {
      form.setValue('voluntaryMeasures', [...current, measureId]);
    } else {
      form.setValue('voluntaryMeasures', current.filter(id => id !== measureId));
    }
  };

  // Vehicle Access handlers
  const handleAddRoad = () => {
    const current = form.getValues('vehicleAccess') || { roads: [], gates: [] };
    const newRoad = { width: 7.27, freeHeight: 'LIVRE' as const, loadCapacity: 2000, turnType: 'NA' };
    form.setValue('vehicleAccess', {
      ...current,
      roads: [...(current.roads || []), newRoad]
    });
  };

  const handleRemoveRoad = (index: number) => {
    const current = form.getValues('vehicleAccess') || { roads: [], gates: [] };
    form.setValue('vehicleAccess', {
      ...current,
      roads: current.roads.filter((_, i) => i !== index)
    });
  };

  const handleAddGate = () => {
    const current = form.getValues('vehicleAccess') || { roads: [], gates: [] };
    const newGate = { width: 7.27, height: 'LIVRE' as const };
    form.setValue('vehicleAccess', {
      ...current,
      gates: [...(current.gates || []), newGate]
    });
  };

  const handleRemoveGate = (index: number) => {
    const current = form.getValues('vehicleAccess') || { roads: [], gates: [] };
    form.setValue('vehicleAccess', {
      ...current,
      gates: current.gates.filter((_, i) => i !== index)
    });
  };

  // Get non-mandatory measures that can be added voluntarily
  const availableVoluntaryMeasures = ALL_MEASURES.filter(
    m => !analysis.mandatory.includes(m.id)
  );

  return (
    <div className="space-y-6 pb-24">
      {/* Summary Alert */}
      <Alert className={cn(
        "border-2",
        analysis.riskClass === 'baixo' && "border-emerald-500/50 bg-emerald-500/5",
        analysis.riskClass === 'medio' && "border-amber-500/50 bg-amber-500/5",
        analysis.riskClass === 'alto' && "border-red-500/50 bg-red-500/5",
      )}>
        <Shield className={cn(
          "h-5 w-5",
          analysis.riskClass === 'baixo' && "text-emerald-600",
          analysis.riskClass === 'medio' && "text-amber-600",
          analysis.riskClass === 'alto' && "text-red-600",
        )} />
        <AlertDescription className="ml-2">
          <span className="font-semibold">
            Classificação: Risco {analysis.riskClass.charAt(0).toUpperCase() + analysis.riskClass.slice(1)}
          </span>
          <span className="text-muted-foreground ml-2">
            ({analysis.maxFireLoad} MJ/m² • {totalArea.toLocaleString()} m² • {totalHeight}m altura)
          </span>
        </AlertDescription>
      </Alert>

      {/* Existence Period Card - GLOBAL for the project */}
      <Card className="border-amber-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-amber-600" />
            Período de Existência (Tabela 2 - NTCB 01)
          </CardTitle>
          <CardDescription>
            Classificação global do projeto quanto ao período de existência da edificação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="existencePeriod"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value || 'pos_2023'}
                    className="space-y-2"
                  >
                    {EXISTENCE_PERIODS.map((period) => (
                      <div key={period.id} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                        <RadioGroupItem value={period.id} id={period.id} />
                        <Label htmlFor={period.id} className="cursor-pointer flex-1">
                          {period.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Mandatory Measures Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            Medidas de Segurança Obrigatórias
          </CardTitle>
          <CardDescription>
            Baseado na classificação NTCB 01/2025. Desmarque apenas se houver isenção específica.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ALL_MEASURES.map((measure) => {
              const Icon = ICONS[measure.icon] || Shield;
              const isMandatory = analysis.mandatory.includes(measure.id);
              const isExempt = exemptMeasures.includes(measure.id);
              const isVoluntary = voluntaryMeasures.includes(measure.id);
              
              // Only show mandatory and voluntary measures in this section
              if (!isMandatory && !isVoluntary) return null;
              
              return (
                <div
                  key={measure.id}
                  className={cn(
                    "flex items-start space-x-3 rounded-lg border p-4 transition-all",
                    isMandatory && !isExempt 
                      ? "border-primary/50 bg-primary/5" 
                      : isVoluntary
                      ? "border-blue-500/50 bg-blue-500/5"
                      : "border-border bg-muted/30",
                    isExempt && "opacity-50"
                  )}
                >
                  <div className={cn(
                    "rounded-full p-2",
                    isMandatory && !isExempt 
                      ? "bg-primary/10 text-primary" 
                      : isVoluntary
                      ? "bg-blue-500/10 text-blue-500"
                      : "bg-muted text-muted-foreground"
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{measure.label}</p>
                      {isMandatory && !isExempt && (
                        <Badge variant="default" className="text-xs">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Obrigatório
                        </Badge>
                      )}
                      {isVoluntary && (
                        <Badge variant="secondary" className="text-xs bg-blue-500/10 text-blue-600 border-blue-500/30">
                          <Heart className="h-3 w-3 mr-1" />
                          Voluntário
                        </Badge>
                      )}
                      {isExempt && (
                        <Badge variant="secondary" className="text-xs">
                          <XCircle className="h-3 w-3 mr-1" />
                          Isento
                        </Badge>
                      )}
                    </div>
                    
                    {isMandatory && (
                      <div className="flex items-center space-x-2 pt-2">
                        <Checkbox
                          id={`exempt-${measure.id}`}
                          checked={isExempt}
                          onCheckedChange={(checked) => handleExemptToggle(measure.id, checked as boolean)}
                        />
                        <label 
                          htmlFor={`exempt-${measure.id}`}
                          className="text-sm text-muted-foreground cursor-pointer"
                        >
                          Marcar como isento
                        </label>
                      </div>
                    )}

                    {isVoluntary && (
                      <div className="flex items-center space-x-2 pt-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVoluntaryToggle(measure.id, false)}
                          className="text-xs text-destructive hover:text-destructive"
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Remover
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Voluntary Measures Card */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-blue-500" />
            Adicionar Medidas Voluntárias
          </CardTitle>
          <CardDescription>
            Adicione medidas que não são obrigatórias, mas o cliente deseja incluir no projeto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableVoluntaryMeasures.map((measure) => {
              const Icon = ICONS[measure.icon] || Shield;
              const isVoluntary = voluntaryMeasures.includes(measure.id);
              
              if (isVoluntary) return null; // Already added, shown above
              
              return (
                <button
                  key={measure.id}
                  type="button"
                  onClick={() => handleVoluntaryToggle(measure.id, true)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border border-dashed p-3",
                    "hover:border-blue-500/50 hover:bg-blue-500/5 transition-all",
                    "text-left"
                  )}
                >
                  <div className="rounded-full p-2 bg-muted text-muted-foreground">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{measure.label}</p>
                    <p className="text-xs text-muted-foreground">Clique para adicionar</p>
                  </div>
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Access Card - GLOBAL for the terrain */}
      <Card className="border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-600" />
            Acesso de Viaturas (Seção 6.2)
          </CardTitle>
          <CardDescription>
            Dados globais do terreno para acesso de viaturas do Corpo de Bombeiros
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Roads */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">VIAS DE ACESSO</p>
              <Button type="button" variant="outline" size="sm" onClick={handleAddRoad} className="gap-1">
                <Plus className="h-4 w-4" /> Adicionar Via
              </Button>
            </div>
            {(vehicleAccess?.roads || []).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-lg">
                Nenhuma via cadastrada. Clique em "Adicionar Via" para começar.
              </p>
            )}
            {(vehicleAccess?.roads || []).map((road, roadIndex) => (
              <div key={roadIndex} className="grid grid-cols-5 gap-3 items-end p-3 bg-muted/30 rounded-lg">
                <FormField
                  control={form.control}
                  name={`vehicleAccess.roads.${roadIndex}.width`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Largura (m)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          className="h-9" 
                          {...field} 
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`vehicleAccess.roads.${roadIndex}.freeHeight`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Altura Livre</FormLabel>
                      <FormControl>
                        <Input className="h-9" placeholder="LIVRE" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`vehicleAccess.roads.${roadIndex}.loadCapacity`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Capacidade (Kg)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          className="h-9" 
                          {...field} 
                          onChange={e => field.onChange(parseInt(e.target.value) || 0)} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`vehicleAccess.roads.${roadIndex}.turnType`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Tipo Contorno</FormLabel>
                      <FormControl>
                        <Input className="h-9" placeholder="NA" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-destructive hover:text-destructive"
                  onClick={() => handleRemoveRoad(roadIndex)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Gates */}
          <div className="space-y-2 pt-4 border-t">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">PORTÕES</p>
              <Button type="button" variant="outline" size="sm" onClick={handleAddGate} className="gap-1">
                <Plus className="h-4 w-4" /> Adicionar Portão
              </Button>
            </div>
            {(vehicleAccess?.gates || []).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-lg">
                Nenhum portão cadastrado. Clique em "Adicionar Portão" para começar.
              </p>
            )}
            {(vehicleAccess?.gates || []).map((gate, gateIndex) => (
              <div key={gateIndex} className="grid grid-cols-3 gap-3 items-end p-3 bg-muted/30 rounded-lg">
                <FormField
                  control={form.control}
                  name={`vehicleAccess.gates.${gateIndex}.width`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Largura (m)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          className="h-9" 
                          {...field} 
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`vehicleAccess.gates.${gateIndex}.height`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Altura</FormLabel>
                      <FormControl>
                        <Input className="h-9" placeholder="LIVRE" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-destructive hover:text-destructive"
                  onClick={() => handleRemoveGate(gateIndex)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Exempt Warning */}
      {exemptMeasures.length > 0 && (
        <Alert variant="destructive" className="border-amber-500/50 bg-amber-500/5 text-amber-700">
          <AlertTriangle className="h-5 w-5" />
          <AlertDescription className="ml-2">
            <strong>{exemptMeasures.length} medida(s) marcada(s) como isenta(s).</strong>
            <br />
            <span className="text-sm">
              Certifique-se de documentar a justificativa técnica para cada isenção no memorial descritivo.
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* Voluntary Summary */}
      {voluntaryMeasures.length > 0 && (
        <Alert className="border-blue-500/50 bg-blue-500/5">
          <Heart className="h-5 w-5 text-blue-600" />
          <AlertDescription className="ml-2 text-blue-700">
            <strong>{voluntaryMeasures.length} medida(s) voluntária(s) adicionada(s).</strong>
            <br />
            <span className="text-sm">
              Estas medidas serão incluídas no projeto por solicitação do cliente.
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* Info Card */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-primary mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Próximos Passos</p>
              <p>
                Ao finalizar, você poderá gerar o relatório Anexo G com todas as tabelas 
                formatadas e acessar as calculadoras específicas do projeto.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}