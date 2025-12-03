/**
 * Visualização da Rede Hidráulica
 * Renderiza diagrama esquemático da rede
 */

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Network } from 'lucide-react';
import type { Node, Pipe, SystemResult } from '@/models/types';
import { m3s_to_Lmin } from '@/core/units';

interface NetworkVisualizationProps {
  nodes: Node[];
  pipes: Pipe[];
  result: SystemResult | null;
}

const NODE_COLORS: Record<string, string> = {
  source: '#22c55e',    // green
  pump: '#f59e0b',      // amber
  junction: '#6b7280',  // gray
  hydrant: '#0ea5e9',   // cyan
  reservoir: '#8b5cf6', // violet
};

const NODE_LABELS: Record<string, string> = {
  source: '⬢',
  pump: '⚡',
  junction: '●',
  hydrant: '🔥',
  reservoir: '💧',
};

export function NetworkVisualization({ nodes, pipes, result }: NetworkVisualizationProps) {
  // Calculate node positions automatically
  const layout = useMemo(() => {
    if (nodes.length === 0) return { nodePositions: new Map(), width: 400, height: 300 };

    const positions = new Map<string, { x: number; y: number }>();
    const padding = 60;
    const width = 500;
    const height = 350;

    // Simple force-directed-like layout
    // Start with source at left, spread others
    const sourceNode = nodes.find(n => n.type === 'source' || n.type === 'pump');
    const hydrantNodes = nodes.filter(n => n.type === 'hydrant');
    const otherNodes = nodes.filter(n => n.type !== 'source' && n.type !== 'pump' && n.type !== 'hydrant');

    // Position source on the left
    if (sourceNode) {
      positions.set(sourceNode.id, { x: padding, y: height / 2 });
    }

    // Position hydrants on the right
    hydrantNodes.forEach((node, i) => {
      const y = padding + (i + 0.5) * (height - 2 * padding) / Math.max(hydrantNodes.length, 1);
      positions.set(node.id, { x: width - padding, y });
    });

    // Position other nodes in the middle
    otherNodes.forEach((node, i) => {
      const cols = Math.ceil(Math.sqrt(otherNodes.length));
      const row = Math.floor(i / cols);
      const col = i % cols;
      const x = padding + 100 + col * 80;
      const y = padding + row * 80;
      positions.set(node.id, { x, y });
    });

    // Position any unpositioned nodes
    nodes.forEach((node, i) => {
      if (!positions.has(node.id)) {
        positions.set(node.id, { 
          x: padding + (i % 5) * 80, 
          y: padding + Math.floor(i / 5) * 80 
        });
      }
    });

    return { nodePositions: positions, width, height };
  }, [nodes]);

  if (nodes.length === 0) {
    return (
      <Card className="tech-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Network className="h-5 w-5 text-primary" />
            Diagrama da Rede
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
          Adicione nós e trechos para visualizar a rede
        </CardContent>
      </Card>
    );
  }

  const getFlowForPipe = (pipeId: string): number | null => {
    if (!result) return null;
    const flowResult = result.hydraulics.flows.get(pipeId);
    return flowResult ? m3s_to_Lmin(Math.abs(flowResult.flow)) : null;
  };

  const getPressureForNode = (nodeId: string): number | null => {
    if (!result) return null;
    const pressure = result.hydraulics.pressures.get(nodeId);
    return pressure?.dynamicPressure ?? null;
  };

  return (
    <Card className="tech-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Network className="h-5 w-5 text-primary" />
          Diagrama da Rede
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-muted/20 rounded-lg border border-border overflow-hidden">
          <svg 
            viewBox={`0 0 ${layout.width} ${layout.height}`} 
            className="w-full h-auto"
            style={{ minHeight: '300px' }}
          >
            {/* Grid background */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path 
                  d="M 20 0 L 0 0 0 20" 
                  fill="none" 
                  stroke="hsl(var(--grid-line))" 
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Pipes */}
            {pipes.map(pipe => {
              const start = layout.nodePositions.get(pipe.startNodeId);
              const end = layout.nodePositions.get(pipe.endNodeId);
              if (!start || !end) return null;

              const flow = getFlowForPipe(pipe.id);
              const hasFlow = flow !== null && flow > 0;

              return (
                <g key={pipe.id}>
                  <line
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke={hasFlow ? 'hsl(var(--pipe-color))' : 'hsl(var(--muted))'}
                    strokeWidth={hasFlow ? 3 : 2}
                    strokeLinecap="round"
                    className={hasFlow ? 'flow-animated' : ''}
                  />
                  {/* Flow label */}
                  {flow !== null && (
                    <text
                      x={(start.x + end.x) / 2}
                      y={(start.y + end.y) / 2 - 8}
                      textAnchor="middle"
                      className="fill-foreground text-[9px] font-mono"
                    >
                      {flow.toFixed(0)} L/min
                    </text>
                  )}
                  {/* Pipe ID */}
                  <text
                    x={(start.x + end.x) / 2}
                    y={(start.y + end.y) / 2 + 12}
                    textAnchor="middle"
                    className="fill-muted-foreground text-[8px] font-mono"
                  >
                    {pipe.id}
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map(node => {
              const pos = layout.nodePositions.get(node.id);
              if (!pos) return null;

              const pressure = getPressureForNode(node.id);
              const isActive = result?.config.activeHydrants.includes(node.id);

              return (
                <g key={node.id}>
                  {/* Node circle */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isActive ? 16 : 12}
                    fill={NODE_COLORS[node.type]}
                    stroke={isActive ? 'hsl(var(--warning))' : 'hsl(var(--background))'}
                    strokeWidth={isActive ? 3 : 2}
                    className={isActive ? 'animate-pulse-glow' : ''}
                  />
                  {/* Node symbol */}
                  <text
                    x={pos.x}
                    y={pos.y + 4}
                    textAnchor="middle"
                    className="fill-background text-[10px]"
                  >
                    {NODE_LABELS[node.type]}
                  </text>
                  {/* Node label */}
                  <text
                    x={pos.x}
                    y={pos.y - 18}
                    textAnchor="middle"
                    className="fill-foreground text-[10px] font-mono font-semibold"
                  >
                    {node.id}
                  </text>
                  {/* Pressure */}
                  {pressure !== null && (
                    <text
                      x={pos.x}
                      y={pos.y + 28}
                      textAnchor="middle"
                      className="fill-primary text-[9px] font-mono"
                    >
                      {pressure.toFixed(1)} mca
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 px-2 text-xs">
          {Object.entries(NODE_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: color }}
              />
              <span className="text-muted-foreground capitalize">
                {type === 'source' ? 'Fonte' : 
                 type === 'pump' ? 'Bomba' :
                 type === 'junction' ? 'Junção' :
                 type === 'hydrant' ? 'Hidrante' : 'Reserv.'}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
