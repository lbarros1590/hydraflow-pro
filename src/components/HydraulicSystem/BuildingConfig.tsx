/**
 * Configuração da Edificação - NTCB 19/2020
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Building2, Droplets, Timer, Gauge, Flame, Ruler } from 'lucide-react';
import { OCCUPANCY_DIVISIONS, SYSTEM_TYPES, getSystemType, getSystemConfig, calculateRTI } from '@/core/ntcbClassification';

interface BuildingConfigProps {
  occupancyCode: string;
  fireLoadMJm2: number;
  totalAreaM2: number;
  buildingHeight: number;
  pumpEfficiency: number;
  onOccupancyChange: (code: string) => void;
  onFireLoadChange: (load: number) => void;
  onAreaChange: (area: number) => void;
  onHeightChange: (height: number) => void;
  onEfficiencyChange: (efficiency: number) => void;
}

export function BuildingConfig({ occupancyCode, fireLoadMJm2, totalAreaM2, buildingHeight, pumpEfficiency, onOccupancyChange, onFireLoadChange, onAreaChange, onHeightChange, onEfficiencyChange }: BuildingConfigProps) {
  const systemType = getSystemType(occupancyCode, fireLoadMJm2);
  const systemConfig = systemType ? getSystemConfig(systemType) : null;
  const rti = systemType ? calculateRTI(systemType, totalAreaM2) : 0;

  return (
    <Card className="tech-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Building2 className="h-5 w-5 text-primary" />
          Classificação NTCB 19/2020
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Divisão/Ocupação</Label>
          <Select value={occupancyCode} onValueChange={onOccupancyChange}>
            <SelectTrigger className="h-10"><SelectValue placeholder="Selecione a ocupação" /></SelectTrigger>
            <SelectContent className="max-h-80">
              {OCCUPANCY_DIVISIONS.map((div) => (
                <SelectItem key={div.code} value={div.code}>
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">{div.code}</span>
                    <span className="truncate">{div.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground flex items-center gap-1"><Flame className="h-3 w-3" />Carga Incêndio</Label>
            <div className="relative">
              <Input type="number" min={0} step={50} value={fireLoadMJm2} onChange={(e) => onFireLoadChange(parseFloat(e.target.value) || 0)} className="h-8 text-sm font-mono pr-14" />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">MJ/m²</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground flex items-center gap-1"><Ruler className="h-3 w-3" />Área Total</Label>
            <div className="relative">
              <Input type="number" min={0} step={100} value={totalAreaM2} onChange={(e) => onAreaChange(parseFloat(e.target.value) || 0)} className="h-8 text-sm font-mono pr-8" />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">m²</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Altura</Label>
            <div className="relative">
              <Input type="number" min={0} step={1} value={buildingHeight} onChange={(e) => onHeightChange(parseFloat(e.target.value) || 0)} className="h-8 text-sm font-mono pr-6" />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">m</span>
            </div>
          </div>
        </div>

        {systemType && systemConfig && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/20 text-primary border-primary/30 border">Tipo {systemType}</Badge>
              <span className="font-mono text-sm text-muted-foreground">{systemConfig.name}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-1"><Droplets className="h-4 w-4 text-primary" /><span className="text-xs text-muted-foreground">Vazão Mín.</span></div>
                <div className="font-mono text-xl font-semibold text-foreground">{systemConfig.minFlowPerHydrant}<span className="text-sm text-muted-foreground ml-1">L/min</span></div>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-1"><span className="text-xs text-muted-foreground">Hidrantes Simult.</span></div>
                <div className="font-mono text-xl font-semibold text-foreground">{systemConfig.simultaneousHydrants}<span className="text-sm text-muted-foreground ml-1">un.</span></div>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-1"><Gauge className="h-4 w-4 text-primary" /><span className="text-xs text-muted-foreground">Pressão Mín.</span></div>
                <div className="font-mono text-xl font-semibold text-foreground">{systemConfig.minNozzlePressure}<span className="text-sm text-muted-foreground ml-1">mca</span></div>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-1"><Timer className="h-4 w-4 text-primary" /><span className="text-xs text-muted-foreground">Mangueira Máx.</span></div>
                <div className="font-mono text-xl font-semibold text-foreground">{systemConfig.maxHoseLength}<span className="text-sm text-muted-foreground ml-1">m</span></div>
              </div>
            </div>

            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Reserva Técnica (RTI)</span>
                <div className="font-mono font-semibold text-primary">{rti} m³<span className="text-xs text-muted-foreground ml-1">({(rti * 1000).toLocaleString()} L)</span></div>
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-border">
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Rendimento da Bomba (%)</Label>
            <Input type="number" min={40} max={90} step={1} value={Math.round(pumpEfficiency * 100)} onChange={(e) => onEfficiencyChange(parseInt(e.target.value) / 100 || 0.65)} className="font-mono" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
