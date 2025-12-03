/**
 * Configuração da Edificação
 * Seleciona tipo de edificação e parâmetros normativos
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Building2, Droplets, Timer, Gauge } from 'lucide-react';
import { BUILDING_CLASSIFICATIONS, calculateFireReserve } from '@/core/demand';

interface BuildingConfigProps {
  buildingType: string;
  pumpEfficiency: number;
  onBuildingTypeChange: (type: string) => void;
  onEfficiencyChange: (efficiency: number) => void;
}

const RISK_COLORS: Record<string, string> = {
  leve: 'bg-success/20 text-success border-success/30',
  medio: 'bg-warning/20 text-warning border-warning/30',
  elevado: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  especial: 'bg-destructive/20 text-destructive border-destructive/30',
};

const RISK_LABELS: Record<string, string> = {
  leve: 'Risco Leve',
  medio: 'Risco Médio',
  elevado: 'Risco Elevado',
  especial: 'Risco Especial',
};

export function BuildingConfig({ 
  buildingType, 
  pumpEfficiency, 
  onBuildingTypeChange, 
  onEfficiencyChange 
}: BuildingConfigProps) {
  const classification = BUILDING_CLASSIFICATIONS[buildingType];
  const reserve = classification ? calculateFireReserve(classification) : 0;

  return (
    <Card className="tech-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Building2 className="h-5 w-5 text-primary" />
          Classificação da Edificação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Tipo de Edificação</Label>
          <Select value={buildingType} onValueChange={onBuildingTypeChange}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(BUILDING_CLASSIFICATIONS).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">{config.code}</span>
                    <span>{config.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {classification && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <Badge className={`${RISK_COLORS[classification.riskLevel]} border`}>
                {RISK_LABELS[classification.riskLevel]}
              </Badge>
              <span className="font-mono text-sm text-muted-foreground">
                {classification.code}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <Droplets className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Vazão/Hidrante</span>
                </div>
                <div className="font-mono text-xl font-semibold text-foreground">
                  {classification.flowPerHydrant}
                  <span className="text-sm text-muted-foreground ml-1">L/min</span>
                </div>
              </div>

              <div className="p-3 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-muted-foreground">Hidrantes Simult.</span>
                </div>
                <div className="font-mono text-xl font-semibold text-foreground">
                  {classification.simultaneousHydrants}
                  <span className="text-sm text-muted-foreground ml-1">un.</span>
                </div>
              </div>

              <div className="p-3 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <Gauge className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Pressão Mín.</span>
                </div>
                <div className="font-mono text-xl font-semibold text-foreground">
                  {classification.minNozzlePressure}
                  <span className="text-sm text-muted-foreground ml-1">mca</span>
                </div>
              </div>

              <div className="p-3 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <Timer className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Autonomia</span>
                </div>
                <div className="font-mono text-xl font-semibold text-foreground">
                  {classification.reserveTime}
                  <span className="text-sm text-muted-foreground ml-1">min</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Reserva Técnica (RTI)</span>
                <div className="font-mono font-semibold text-primary">
                  {(reserve / 1000).toFixed(1)} m³
                  <span className="text-xs text-muted-foreground ml-1">
                    ({reserve.toLocaleString()} L)
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-border">
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Rendimento da Bomba (%)</Label>
            <Input
              type="number"
              min={40}
              max={90}
              step={1}
              value={Math.round(pumpEfficiency * 100)}
              onChange={(e) => onEfficiencyChange(parseInt(e.target.value) / 100 || 0.65)}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Valor típico: 60-75%. Usado no cálculo de potência.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
