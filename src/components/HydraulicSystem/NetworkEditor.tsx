/**
 * Editor de Rede Hidráulica
 * Permite entrada de dados de nós e tubulações com acessórios
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Settings2 } from 'lucide-react';
import type { Node, Pipe, NodeType, PipeMaterial, PipeAccessory } from '@/models/types';
import { getHazenWilliamsC } from '@/core/equivalentLength';
import { mm_to_m, m_to_mm } from '@/core/units';
import { AccessoriesEditor } from './AccessoriesEditor';
import { calculateTotalEquivalentLength } from '@/core/equivalentLength';

interface NetworkEditorProps {
  nodes: Node[];
  pipes: Pipe[];
  onNodesChange: (nodes: Node[]) => void;
  onPipesChange: (pipes: Pipe[]) => void;
}

const NODE_TYPES: { value: NodeType; label: string }[] = [
  { value: 'source', label: 'Fonte/Reservatório' },
  { value: 'pump', label: 'Bomba' },
  { value: 'junction', label: 'Junção/Derivação' },
  { value: 'hydrant', label: 'Hidrante' },
];

const PIPE_MATERIALS: { value: PipeMaterial; label: string; coefficient: number }[] = [
  { value: 'PVC', label: 'PVC', coefficient: getHazenWilliamsC('PVC') },
  { value: 'Metal', label: 'Aço/Ferro', coefficient: getHazenWilliamsC('Metal') },
];

const STANDARD_DIAMETERS = [25, 32, 40, 50, 65, 80, 100, 125, 150, 200];

export function NetworkEditor({ nodes, pipes, onNodesChange, onPipesChange }: NetworkEditorProps) {
  const [activeTab, setActiveTab] = useState('nodes');

  // Node handlers
  const addNode = () => {
    const newNode: Node = {
      id: `N${nodes.length + 1}`,
      type: 'junction',
      name: `Nó ${nodes.length + 1}`,
      elevation: 0,
    };
    onNodesChange([...nodes, newNode]);
  };

  const updateNode = (index: number, field: keyof Node, value: any) => {
    const updated = [...nodes];
    updated[index] = { ...updated[index], [field]: value };
    onNodesChange(updated);
  };

  const removeNode = (index: number) => {
    const nodeId = nodes[index].id;
    onNodesChange(nodes.filter((_, i) => i !== index));
    onPipesChange(pipes.filter(p => p.startNodeId !== nodeId && p.endNodeId !== nodeId));
  };

  // Pipe handlers
  const addPipe = () => {
    const newPipe: Pipe = {
      id: `P${pipes.length + 1}`,
      name: `Trecho ${pipes.length + 1}`,
      startNodeId: nodes[0]?.id || '',
      endNodeId: nodes[1]?.id || nodes[0]?.id || '',
      length: 10,
      diameter: mm_to_m(50),
      roughness: getHazenWilliamsC('PVC'),
      material: 'PVC',
      accessories: [],
      equivalentLength: 0,
    };
    onPipesChange([...pipes, newPipe]);
  };

  const updatePipe = (index: number, field: keyof Pipe, value: any) => {
    const updated = [...pipes];
    updated[index] = { ...updated[index], [field]: value };
    
    // Recalculate Leq if diameter or material changed
    if (field === 'diameter' || field === 'material') {
      const pipe = updated[index];
      const diameterMm = Math.round(m_to_mm(pipe.diameter));
      const leq = calculateTotalEquivalentLength(
        pipe.accessories || [], 
        diameterMm, 
        pipe.material as PipeMaterial
      );
      updated[index].equivalentLength = leq;
    }
    
    onPipesChange(updated);
  };

  const removePipe = (index: number) => {
    onPipesChange(pipes.filter((_, i) => i !== index));
  };

  const updatePipeMaterial = (index: number, material: PipeMaterial) => {
    const updated = [...pipes];
    updated[index] = { 
      ...updated[index], 
      material,
      roughness: getHazenWilliamsC(material)
    };
    
    // Recalculate Leq
    const pipe = updated[index];
    const diameterMm = Math.round(m_to_mm(pipe.diameter));
    const leq = calculateTotalEquivalentLength(
      pipe.accessories || [], 
      diameterMm, 
      material
    );
    updated[index].equivalentLength = leq;
    
    onPipesChange(updated);
  };

  const updatePipeAccessories = (index: number, accessories: PipeAccessory[]) => {
    const updated = [...pipes];
    const pipe = updated[index];
    const diameterMm = Math.round(m_to_mm(pipe.diameter));
    const leq = calculateTotalEquivalentLength(
      accessories, 
      diameterMm, 
      pipe.material as PipeMaterial
    );
    
    updated[index] = { 
      ...updated[index], 
      accessories,
      equivalentLength: leq
    };
    onPipesChange(updated);
  };

  return (
    <Card className="tech-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings2 className="h-5 w-5 text-primary" />
          Editor de Rede
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="nodes" className="font-mono text-sm">
              Nós ({nodes.length})
            </TabsTrigger>
            <TabsTrigger value="pipes" className="font-mono text-sm">
              Trechos ({pipes.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="nodes" className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin pr-2">
            {nodes.map((node, index) => (
              <div 
                key={node.id} 
                className="p-3 bg-muted/30 rounded-lg border border-border space-y-3 animate-fade-in"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-primary">{node.id}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => removeNode(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Nome</Label>
                    <Input
                      value={node.name}
                      onChange={(e) => updateNode(index, 'name', e.target.value)}
                      className="h-8 text-sm font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Tipo</Label>
                    <Select
                      value={node.type}
                      onValueChange={(value) => updateNode(index, 'type', value as NodeType)}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {NODE_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Cota (m)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={node.elevation}
                    onChange={(e) => updateNode(index, 'elevation', parseFloat(e.target.value) || 0)}
                    className="h-8 text-sm font-mono"
                  />
                </div>
              </div>
            ))}
            
            <Button onClick={addNode} variant="outline" className="w-full mt-2">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Nó
            </Button>
          </TabsContent>

          <TabsContent value="pipes" className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin pr-2">
            {pipes.map((pipe, index) => (
              <div 
                key={pipe.id} 
                className="p-3 bg-muted/30 rounded-lg border border-border space-y-3 animate-fade-in"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-primary">{pipe.id}</span>
                  <div className="flex items-center gap-2">
                    <AccessoriesEditor
                      pipeId={pipe.id}
                      pipeName={pipe.name}
                      diameterM={pipe.diameter}
                      material={pipe.material as PipeMaterial}
                      accessories={pipe.accessories || []}
                      onAccessoriesChange={(acc) => updatePipeAccessories(index, acc)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => removePipe(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Nome</Label>
                    <Input
                      value={pipe.name}
                      onChange={(e) => updatePipe(index, 'name', e.target.value)}
                      className="h-8 text-sm font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Material</Label>
                    <Select
                      value={pipe.material}
                      onValueChange={(value) => updatePipeMaterial(index, value as PipeMaterial)}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PIPE_MATERIALS.map(mat => (
                          <SelectItem key={mat.value} value={mat.value}>
                            {mat.label} (C={mat.coefficient})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Nó Inicial</Label>
                    <Select
                      value={pipe.startNodeId}
                      onValueChange={(value) => updatePipe(index, 'startNodeId', value)}
                    >
                      <SelectTrigger className="h-8 text-sm font-mono">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {nodes.map(node => (
                          <SelectItem key={node.id} value={node.id}>
                            {node.id} - {node.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Nó Final</Label>
                    <Select
                      value={pipe.endNodeId}
                      onValueChange={(value) => updatePipe(index, 'endNodeId', value)}
                    >
                      <SelectTrigger className="h-8 text-sm font-mono">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {nodes.map(node => (
                          <SelectItem key={node.id} value={node.id}>
                            {node.id} - {node.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Comprim. (m)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={pipe.length}
                      onChange={(e) => updatePipe(index, 'length', parseFloat(e.target.value) || 0)}
                      className="h-8 text-sm font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Diâm. (mm)</Label>
                    <Select
                      value={String(Math.round(pipe.diameter * 1000))}
                      onValueChange={(value) => updatePipe(index, 'diameter', mm_to_m(parseInt(value)))}
                    >
                      <SelectTrigger className="h-8 text-sm font-mono">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STANDARD_DIAMETERS.map(d => (
                          <SelectItem key={d} value={String(d)}>
                            DN {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Leq (m)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={(pipe.equivalentLength || 0).toFixed(2)}
                      readOnly
                      className="h-8 text-sm font-mono bg-muted/50"
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <Button 
              onClick={addPipe} 
              variant="outline" 
              className="w-full mt-2"
              disabled={nodes.length < 2}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Trecho
            </Button>
            {nodes.length < 2 && (
              <p className="text-xs text-muted-foreground text-center">
                Adicione pelo menos 2 nós para criar trechos
              </p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
