/**
 * Step 4 - Mandatory Measures Checklist
 */
import { useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ProjectFormData, ALL_MEASURES } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormControl, FormLabel, FormDescription } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ClipboardCheck, 
  Shield, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
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
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
              
              return (
                <div
                  key={measure.id}
                  className={cn(
                    "flex items-start space-x-3 rounded-lg border p-4 transition-all",
                    isMandatory && !isExempt 
                      ? "border-primary/50 bg-primary/5" 
                      : "border-border bg-muted/30",
                    isExempt && "opacity-50"
                  )}
                >
                  <div className={cn(
                    "rounded-full p-2",
                    isMandatory && !isExempt 
                      ? "bg-primary/10 text-primary" 
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
                      {!isMandatory && (
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                          Não exigido
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
                  </div>
                </div>
              );
            })}
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

      {/* Info Card */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-primary mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Próximos Passos</p>
              <p>
                Ao finalizar, você será direcionado para a calculadora hidráulica onde poderá 
                dimensionar o sistema de hidrantes com base nos parâmetros deste projeto.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
