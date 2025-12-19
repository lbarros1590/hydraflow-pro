/**
 * Visualização da Rede Hidráulica - Improved Layout
 * Hierarchical X-Y positioning for cleaner diagrams
 */

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Network, ZoomIn, ZoomOut, Download } from 'lucide-react';
import type { Node, Pipe, SystemResult } from '@/models/types';
import { m3s_to_Lmin } from '@/core/units';

interface NetworkVisualizationProps {
  nodes: Node[];
  pipes: Pipe[];
  result: SystemResult | null;
}

const NODE_COLORS: Record<string, string> = {
  reservoir: '#8b5cf6', // violet
  source: '#22c55e',    // green
  pump: '#f59e0b',      // amber
  junction: '#6b7280',  // gray
  hydrant: '#0ea5e9',   // cyan
};

const NODE_LABELS: Record<string, string> = {
  reservoir: '💧',
  source: '⬢',
  pump: '⚡',
  junction: '●',
  hydrant: '🔥',
};

// Define hierarchy columns for X positioning
const TYPE_HIERARCHY: Record<string, number> = {
  reservoir: 0,
  source: 1,
  pump: 1,
  junction: 2,
  hydrant: 3,
};

export function NetworkVisualization({ nodes, pipes, result }: NetworkVisualizationProps) {
  const [zoom, setZoom] = useState(1);

  // Calculate node positions with hierarchical layout
  const layout = useMemo(() => {
    if (nodes.length === 0) return { nodePositions: new Map(), width: 500, height: 350 };

    const positions = new Map<string, { x: number; y: number }>();
    const padding = 80;
    const baseWidth = 600;
    const baseHeight = 400;

    // Group nodes by hierarchy column
    const columns: Record<number, Node[]> = {};
    nodes.forEach(node => {
      const col = TYPE_HIERARCHY[node.type] ?? 2;
      if (!columns[col]) columns[col] = [];
      columns[col].push(node);
    });

    // Calculate positions
    const maxCol = Math.max(...Object.keys(columns).map(Number));
    const colWidth = (baseWidth - 2 * padding) / Math.max(maxCol, 1);

    Object.entries(columns).forEach(([colStr, colNodes]) => {
      const col = parseInt(colStr);
      const x = padding + col * colWidth;
      const rowHeight = (baseHeight - 2 * padding) / Math.max(colNodes.length, 1);
      
      colNodes.forEach((node, idx) => {
        // Add slight offset for visual interest
        const xOffset = colNodes.length > 1 ? (idx % 2) * 15 - 7.5 : 0;
        const y = padding + (idx + 0.5) * rowHeight;
        positions.set(node.id, { x: x + xOffset, y });
      });
    });

    return { nodePositions: positions, width: baseWidth, height: baseHeight };
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
    const flows = result.hydraulics.flows;
    // Handle both Map and plain object (from JSON deserialization)
    let flowResult;
    if (flows instanceof Map) {
      flowResult = flows.get(pipeId);
    } else if (flows && typeof flows === 'object') {
      flowResult = (flows as Record<string, any>)[pipeId];
    }
    return flowResult ? m3s_to_Lmin(Math.abs(flowResult.flow)) : null;
  };

  const getPressureForNode = (nodeId: string): number | null => {
    if (!result) return null;
    const pressures = result.hydraulics.pressures;
    // Handle both Map and plain object (from JSON deserialization)
    let pressure;
    if (pressures instanceof Map) {
      pressure = pressures.get(nodeId);
    } else if (pressures && typeof pressures === 'object') {
      pressure = (pressures as Record<string, any>)[nodeId];
    }
    return pressure?.dynamicPressure ?? null;
  };

  const handleExportPNG = () => {
    const svg = document.getElementById('network-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = layout.width * 2;
    canvas.height = layout.height * 2;

    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const a = document.createElement('a');
        a.download = 'rede-hidraulica.png';
        a.href = canvas.toDataURL('image/png');
        a.click();
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <Card className="tech-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Network className="h-5 w-5 text-primary" />
            Diagrama da Rede
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
              className="h-8 w-8"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setZoom(z => Math.min(2, z + 0.25))}
              className="h-8 w-8"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleExportPNG}
              className="h-8 w-8"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div 
          className="bg-muted/20 rounded-lg border border-border overflow-hidden"
          style={{ 
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            width: `${100 / zoom}%`,
            height: `${350 / zoom}px`,
          }}
        >
          <svg 
            id="network-svg"
            viewBox={`0 0 ${layout.width} ${layout.height}`} 
            className="w-full h-auto"
            style={{ minHeight: '300px' }}
          >
            {/* Background gradient */}
            <defs>
              <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--background))" />
                <stop offset="100%" stopColor="hsl(var(--muted))" stopOpacity="0.3" />
              </linearGradient>
              <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path 
                  d="M 30 0 L 0 0 0 30" 
                  fill="none" 
                  stroke="hsl(var(--border))" 
                  strokeWidth="0.5"
                  strokeOpacity="0.3"
                />
              </pattern>
              {/* Arrow marker for flow direction */}
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill="hsl(var(--primary))"
                  fillOpacity="0.6"
                />
              </marker>
            </defs>
            <rect width="100%" height="100%" fill="url(#bg-gradient)" />
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Column labels */}
            <text x="80" y="25" className="fill-muted-foreground text-[10px]" textAnchor="middle">Reservatório</text>
            <text x="250" y="25" className="fill-muted-foreground text-[10px]" textAnchor="middle">Bomba/Fonte</text>
            <text x="420" y="25" className="fill-muted-foreground text-[10px]" textAnchor="middle">Derivações</text>
            <text x="520" y="25" className="fill-muted-foreground text-[10px]" textAnchor="middle">Hidrantes</text>

            {/* Pipes */}
            {pipes.map(pipe => {
              const start = layout.nodePositions.get(pipe.startNodeId);
              const end = layout.nodePositions.get(pipe.endNodeId);
              if (!start || !end) return null;

              const flow = getFlowForPipe(pipe.id);
              const hasFlow = flow !== null && flow > 0;

              // Calculate midpoint for labels
              const midX = (start.x + end.x) / 2;
              const midY = (start.y + end.y) / 2;

              return (
                <g key={pipe.id}>
                  {/* Pipe line with gradient */}
                  <line
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke={hasFlow ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
                    strokeWidth={hasFlow ? 3 : 2}
                    strokeLinecap="round"
                    strokeOpacity={hasFlow ? 0.8 : 0.4}
                    markerEnd={hasFlow ? 'url(#arrowhead)' : undefined}
                  />
                  
                  {/* Flow label background */}
                  {flow !== null && (
                    <>
                      <rect
                        x={midX - 28}
                        y={midY - 20}
                        width="56"
                        height="16"
                        rx="4"
                        fill="hsl(var(--background))"
                        fillOpacity="0.9"
                      />
                      <text
                        x={midX}
                        y={midY - 8}
                        textAnchor="middle"
                        className="fill-primary text-[9px] font-mono font-semibold"
                      >
                        {flow.toFixed(0)} L/min
                      </text>
                    </>
                  )}
                  
                  {/* Pipe ID */}
                  <text
                    x={midX}
                    y={midY + 14}
                    textAnchor="middle"
                    className="fill-muted-foreground text-[8px] font-mono"
                  >
                    {pipe.id} • Ø{pipe.diameter}mm
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
              const nodeColor = NODE_COLORS[node.type] || '#6b7280';

              return (
                <g key={node.id}>
                  {/* Glow effect for active nodes */}
                  {isActive && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={24}
                      fill={nodeColor}
                      fillOpacity="0.2"
                      className="animate-pulse"
                    />
                  )}
                  
                  {/* Node circle */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isActive ? 18 : 14}
                    fill={nodeColor}
                    stroke="hsl(var(--background))"
                    strokeWidth={3}
                    className={isActive ? 'animate-pulse' : ''}
                  />
                  
                  {/* Node symbol */}
                  <text
                    x={pos.x}
                    y={pos.y + 5}
                    textAnchor="middle"
                    className="text-[12px]"
                    style={{ fill: 'white' }}
                  >
                    {NODE_LABELS[node.type]}
                  </text>
                  
                  {/* Node label */}
                  <text
                    x={pos.x}
                    y={pos.y - 24}
                    textAnchor="middle"
                    className="fill-foreground text-[11px] font-semibold"
                  >
                    {node.name || node.id}
                  </text>
                  
                  {/* Elevation */}
                  <text
                    x={pos.x}
                    y={pos.y + 34}
                    textAnchor="middle"
                    className="fill-muted-foreground text-[8px] font-mono"
                  >
                    Cota: {node.elevation}m
                  </text>
                  
                  {/* Pressure */}
                  {pressure !== null && (
                    <text
                      x={pos.x}
                      y={pos.y + 46}
                      textAnchor="middle"
                      className="fill-primary text-[9px] font-mono font-semibold"
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
                {type === 'reservoir' ? 'Reservatório' :
                 type === 'source' ? 'Fonte' : 
                 type === 'pump' ? 'Bomba' :
                 type === 'junction' ? 'Junção' :
                 type === 'hydrant' ? 'Hidrante' : type}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
