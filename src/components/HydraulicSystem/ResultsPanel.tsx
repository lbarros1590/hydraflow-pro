/**
 * Painel de Resultados
 * Exibe os resultados do cálculo hidráulico
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Zap, 
  Droplets,
  Gauge,
  Activity,
  FileText
} from 'lucide-react';
import type { SystemResult } from '@/models/types';
import { m_to_mm, m3s_to_Lmin } from '@/core/units';

interface ResultsPanelProps {
  result: SystemResult | null;
  isCalculating: boolean;
}

export function ResultsPanel({ result, isCalculating }: ResultsPanelProps) {
  if (isCalculating) {
    return (
      <Card className="tech-card">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            <p className="text-muted-foreground">Calculando sistema hidráulico...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card className="tech-card">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center space-y-3">
            <Activity className="h-12 w-12 text-muted-foreground/50 mx-auto" />
            <p className="text-muted-foreground">
              Configure a rede e clique em "Calcular" para ver os resultados
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const allOk = result.checks.minPressureOk && 
                result.checks.velocitiesOk && 
                result.checks.errors.length === 0;

  return (
    <Card className="tech-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            Resultados
          </span>
          <Badge className={allOk ? 'status-ok' : 'status-error'}>
            {allOk ? (
              <><CheckCircle2 className="h-3 w-3 mr-1" /> Sistema OK</>
            ) : (
              <><XCircle className="h-3 w-3 mr-1" /> Verificar</>
            )}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="summary">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="summary" className="text-xs">Resumo</TabsTrigger>
            <TabsTrigger value="pipes" className="text-xs">Trechos</TabsTrigger>
            <TabsTrigger value="hydrants" className="text-xs">Hidrantes</TabsTrigger>
            <TabsTrigger value="pump" className="text-xs">Bomba</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            {/* Verificações */}
            <div className="grid grid-cols-3 gap-3">
              <StatusCard 
                label="Pressões" 
                ok={result.checks.minPressureOk} 
                icon={Gauge}
              />
              <StatusCard 
                label="Velocidades" 
                ok={result.checks.velocitiesOk} 
                icon={Activity}
              />
              <StatusCard 
                label="Balanço de Massa" 
                ok={result.checks.massBalanceOk} 
                icon={Droplets}
              />
            </div>

            {/* Hardy-Cross */}
            <div className="p-3 bg-muted/30 rounded-lg border border-border">
              <div className="text-xs text-muted-foreground mb-2">Solver Hardy-Cross</div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm">
                  {result.hydraulics.hardyCross.loops} loop(s)
                </span>
                <Badge variant="outline" className="font-mono">
                  {result.hydraulics.hardyCross.iterations} iterações
                </Badge>
              </div>
            </div>

            {/* Avisos e Erros */}
            {result.checks.warnings.length > 0 && (
              <div className="space-y-2">
                {result.checks.warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 bg-warning/10 rounded border border-warning/30">
                    <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                    <span className="text-xs text-warning">{w}</span>
                  </div>
                ))}
              </div>
            )}

            {result.checks.errors.length > 0 && (
              <div className="space-y-2">
                {result.checks.errors.map((e, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 bg-destructive/10 rounded border border-destructive/30">
                    <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    <span className="text-xs text-destructive">{e}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Reserva */}
            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
              <div className="text-xs text-muted-foreground mb-1">Reserva Técnica Requerida</div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xl font-semibold text-primary">
                  {result.reserve.volumeM3.toFixed(1)} m³
                </span>
                <span className="text-xs text-muted-foreground">
                  ({result.reserve.volumeLiters.toLocaleString()} L para {result.reserve.timeMinutes} min)
                </span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pipes">
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="font-mono text-xs">Trecho</TableHead>
                    <TableHead className="font-mono text-xs text-right">Q (L/min)</TableHead>
                    <TableHead className="font-mono text-xs text-right">V (m/s)</TableHead>
                    <TableHead className="font-mono text-xs text-right">J (m/m)</TableHead>
                    <TableHead className="font-mono text-xs text-right">ΔH (mca)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.hydraulics.pipeDetails.map((pipe) => (
                    <TableRow key={pipe.pipeId} className="font-mono text-sm">
                      <TableCell>{pipe.pipeId}</TableCell>
                      <TableCell className="text-right">{pipe.flowLmin.toFixed(1)}</TableCell>
                      <TableCell className="text-right">
                        <span className={
                          pipe.velocityStatus === 'high' ? 'text-destructive' :
                          pipe.velocityStatus === 'low' ? 'text-warning' : ''
                        }>
                          {pipe.velocity.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{pipe.headLossUnit.toFixed(4)}</TableCell>
                      <TableCell className="text-right">{pipe.headLossTotal.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="hydrants" className="space-y-4">
            <div className="p-3 bg-accent/10 rounded-lg border border-accent/30">
              <div className="text-xs text-muted-foreground mb-2">Hidrantes Mais Desfavoráveis</div>
              <div className="space-y-2">
                {result.hydrants.mostUnfavorable.map((h, i) => (
                  <div key={h.id} className="flex items-center justify-between p-2 bg-background/50 rounded">
                    <span className="font-mono text-sm">
                      {i + 1}º - {h.id}
                    </span>
                    <div className="text-right">
                      <div className="font-mono text-sm">
                        <span className="text-muted-foreground">P: </span>
                        {h.pressure.toFixed(2)} mca
                      </div>
                      <div className="font-mono text-xs text-muted-foreground">
                        Esguicho: {h.nozzlePressure.toFixed(2)} mca
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="font-mono text-xs">Hidrante</TableHead>
                    <TableHead className="font-mono text-xs text-right">Pressão (mca)</TableHead>
                    <TableHead className="font-mono text-xs text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.hydrants.all.map((h) => (
                    <TableRow key={h.id} className="font-mono text-sm">
                      <TableCell>{h.id}</TableCell>
                      <TableCell className="text-right">{h.pressure.toFixed(2)}</TableCell>
                      <TableCell className="text-center">
                        {h.status === 'ok' ? (
                          <CheckCircle2 className="h-4 w-4 text-success inline" />
                        ) : (
                          <XCircle className="h-4 w-4 text-destructive inline" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="pump" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/30 space-y-1">
                <div className="text-xs text-muted-foreground">Pressão Mínima</div>
                <div className="font-mono text-2xl font-bold text-primary">
                  {result.pump.minPressure.toFixed(1)}
                  <span className="text-sm font-normal ml-1">mca</span>
                </div>
              </div>

              <div className="p-4 bg-accent/10 rounded-lg border border-accent/30 space-y-1">
                <div className="text-xs text-muted-foreground">Vazão Total</div>
                <div className="font-mono text-2xl font-bold text-accent">
                  {result.pump.totalFlowLmin.toFixed(0)}
                  <span className="text-sm font-normal ml-1">L/min</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg border border-border space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-warning" />
                <span className="font-semibold">Potência da Bomba</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground">Potência Hidráulica</div>
                  <div className="font-mono text-lg">
                    {result.pump.hydraulicPower.toFixed(2)} kW
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Potência do Motor</div>
                  <div className="font-mono text-lg">
                    {result.pump.motorPower.toFixed(2)} kW
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border">
                <div className="text-xs text-muted-foreground mb-1">Potência Comercial</div>
                <div className="font-mono text-3xl font-bold text-warning">
                  {result.pump.commercialPowerCV} CV
                </div>
                <div className="text-xs text-muted-foreground">
                  ({result.pump.motorPowerCV.toFixed(2)} CV calculado | η = {(result.pump.efficiency * 100).toFixed(0)}%)
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function StatusCard({ label, ok, icon: Icon }: { label: string; ok: boolean; icon: any }) {
  return (
    <div className={`p-3 rounded-lg border ${ok ? 'status-ok' : 'status-error'}`}>
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <span className="text-xs">{label}</span>
      </div>
      <div className="mt-1 font-mono text-sm font-semibold">
        {ok ? 'OK' : 'ERRO'}
      </div>
    </div>
  );
}
