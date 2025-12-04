/**
 * Painel de Análise de Hidrantes
 * Mostra ranking completo, 2 mais desfavoráveis e 1 mais favorável
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  TrendingDown,
  TrendingUp,
  Flame
} from 'lucide-react';
import type { SystemResult } from '@/models/types';

interface HydrantAnalysisPanelProps {
  result: SystemResult;
}

export function HydrantAnalysisPanel({ result }: HydrantAnalysisPanelProps) {
  const { hydrants } = result;
  const minPressure = result.config.demandConfig.minNozzlePressure;

  // Sort all hydrants by nozzle pressure (ascending = worst first)
  const sortedHydrants = [...hydrants.all].sort((a, b) => {
    const aHydrant = hydrants.mostUnfavorable.find(h => h.id === a.id);
    const bHydrant = hydrants.mostUnfavorable.find(h => h.id === b.id);
    const aNozzle = aHydrant?.nozzlePressure || a.pressure;
    const bNozzle = bHydrant?.nozzlePressure || b.pressure;
    return aNozzle - bNozzle;
  });

  // Get the two most unfavorable and most favorable
  const mostUnfavorable1 = hydrants.mostUnfavorable[0];
  const mostUnfavorable2 = hydrants.mostUnfavorable[1];
  const mostFavorable = hydrants.mostFavorable;

  return (
    <Card className="tech-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Flame className="h-5 w-5 text-primary" />
          Análise de Hidrantes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Critical hydrants */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Most Unfavorable 1 */}
          {mostUnfavorable1 && (
            <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/30">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-destructive" />
                <span className="text-xs font-medium text-destructive">1º Mais Desfavorável</span>
              </div>
              <div className="font-mono text-lg font-bold">{mostUnfavorable1.id}</div>
              <div className="mt-2 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">P. Válvula:</span>
                  <span className="font-mono">{mostUnfavorable1.pressure.toFixed(2)} mca</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">P. Esguicho:</span>
                  <span className={`font-mono font-semibold ${
                    mostUnfavorable1.nozzlePressure >= minPressure ? 'text-success' : 'text-destructive'
                  }`}>
                    {mostUnfavorable1.nozzlePressure.toFixed(2)} mca
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Most Unfavorable 2 */}
          {mostUnfavorable2 && (
            <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/30">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-orange-400" />
                <span className="text-xs font-medium text-orange-400">2º Mais Desfavorável</span>
              </div>
              <div className="font-mono text-lg font-bold">{mostUnfavorable2.id}</div>
              <div className="mt-2 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">P. Válvula:</span>
                  <span className="font-mono">{mostUnfavorable2.pressure.toFixed(2)} mca</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">P. Esguicho:</span>
                  <span className={`font-mono font-semibold ${
                    mostUnfavorable2.nozzlePressure >= minPressure ? 'text-success' : 'text-destructive'
                  }`}>
                    {mostUnfavorable2.nozzlePressure.toFixed(2)} mca
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Most Favorable */}
          {mostFavorable && (
            <div className="p-3 bg-success/10 rounded-lg border border-success/30">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-xs font-medium text-success">Mais Favorável</span>
              </div>
              <div className="font-mono text-lg font-bold">{mostFavorable.id}</div>
              <div className="mt-2 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">P. Válvula:</span>
                  <span className="font-mono">{mostFavorable.pressure.toFixed(2)} mca</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">P. Esguicho:</span>
                  <span className="font-mono font-semibold text-success">
                    {mostFavorable.nozzlePressure.toFixed(2)} mca
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pressure requirement */}
        <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Pressão Mínima Requerida no Esguicho (NTCB 19/2020)
            </span>
            <span className="font-mono text-lg font-bold text-primary">
              {minPressure} mca
            </span>
          </div>
        </div>

        {/* Complete ranking table */}
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-mono text-xs w-12">#</TableHead>
                <TableHead className="font-mono text-xs">Hidrante</TableHead>
                <TableHead className="font-mono text-xs text-right">P. Válvula</TableHead>
                <TableHead className="font-mono text-xs text-right">P. Esguicho</TableHead>
                <TableHead className="font-mono text-xs text-center">Status</TableHead>
                <TableHead className="font-mono text-xs text-center">Classificação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedHydrants.map((h, index) => {
                const unfavorableData = hydrants.mostUnfavorable.find(u => u.id === h.id);
                const nozzlePressure = unfavorableData?.nozzlePressure || h.pressure;
                const isUnfavorable1 = mostUnfavorable1?.id === h.id;
                const isUnfavorable2 = mostUnfavorable2?.id === h.id;
                const isFavorable = mostFavorable?.id === h.id;
                const meetsMin = nozzlePressure >= minPressure;

                return (
                  <TableRow 
                    key={h.id} 
                    className={`font-mono text-sm ${
                      isUnfavorable1 ? 'bg-destructive/5' :
                      isUnfavorable2 ? 'bg-orange-500/5' :
                      isFavorable ? 'bg-success/5' : ''
                    }`}
                  >
                    <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                    <TableCell className="font-semibold">{h.id}</TableCell>
                    <TableCell className="text-right">{h.pressure.toFixed(2)} mca</TableCell>
                    <TableCell className={`text-right font-semibold ${
                      meetsMin ? 'text-success' : 'text-destructive'
                    }`}>
                      {nozzlePressure.toFixed(2)} mca
                    </TableCell>
                    <TableCell className="text-center">
                      {meetsMin ? (
                        <CheckCircle2 className="h-4 w-4 text-success inline" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive inline" />
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {isUnfavorable1 && (
                        <Badge variant="outline" className="text-destructive border-destructive/50 text-[10px]">
                          1º DESF.
                        </Badge>
                      )}
                      {isUnfavorable2 && (
                        <Badge variant="outline" className="text-orange-400 border-orange-500/50 text-[10px]">
                          2º DESF.
                        </Badge>
                      )}
                      {isFavorable && (
                        <Badge variant="outline" className="text-success border-success/50 text-[10px]">
                          FAVORÁVEL
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-destructive/20 border border-destructive/30" />
            <span>1º Mais Desfavorável (ativo)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-orange-500/20 border border-orange-500/30" />
            <span>2º Mais Desfavorável (ativo)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-success/20 border border-success/30" />
            <span>Mais Favorável</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
