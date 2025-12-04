/**
 * Editor de Acessórios por Trecho
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, Wrench } from 'lucide-react';
import type { PipeAccessory, PipeMaterial } from '@/models/types';
import { ACCESSORY_TYPES, getEquivalentLength, calculateTotalEquivalentLength, type AccessoryType, type Material } from '@/core/equivalentLength';
import { m_to_mm } from '@/core/units';

interface AccessoriesEditorProps {
  pipeId: string;
  pipeName: string;
  diameterM: number;
  material: PipeMaterial;
  accessories: PipeAccessory[];
  onAccessoriesChange: (accessories: PipeAccessory[]) => void;
}

export function AccessoriesEditor({ pipeId, pipeName, diameterM, material, accessories, onAccessoriesChange }: AccessoriesEditorProps) {
  const [open, setOpen] = useState(false);
  const diameterMm = Math.round(m_to_mm(diameterM));
  const mat = material as Material;
  const totalLeq = calculateTotalEquivalentLength(accessories.map(a => ({ type: a.type, quantity: a.quantity })), diameterMm, mat);

  const addAccessory = (type: AccessoryType) => {
    const leq = getEquivalentLength(type, diameterMm, mat);
    const newAccessory: PipeAccessory = { type, quantity: 1, equivalentLengthUnit: leq, equivalentLengthTotal: leq };
    onAccessoriesChange([...accessories, newAccessory]);
  };

  const updateQuantity = (index: number, quantity: number) => {
    const updated = [...accessories];
    updated[index] = { ...updated[index], quantity, equivalentLengthTotal: updated[index].equivalentLengthUnit * quantity };
    onAccessoriesChange(updated);
  };

  const removeAccessory = (index: number) => {
    onAccessoriesChange(accessories.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
          <Wrench className="h-3 w-3" />Acessórios
          {accessories.length > 0 && <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">{accessories.length}</Badge>}
          {totalLeq > 0 && <span className="font-mono text-muted-foreground ml-1">({totalLeq.toFixed(1)}m)</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Wrench className="h-5 w-5 text-primary" />Acessórios - {pipeName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg text-sm">
            <div><span className="text-muted-foreground">Diâmetro: </span><span className="font-mono font-semibold">{diameterMm} mm</span></div>
            <div><span className="text-muted-foreground">Material: </span><span className="font-mono font-semibold">{material}</span></div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Adicionar Acessório</Label>
            <Select onValueChange={(value) => addAccessory(value as AccessoryType)}>
              <SelectTrigger><SelectValue placeholder="Selecione um acessório..." /></SelectTrigger>
              <SelectContent>
                {(Object.keys(ACCESSORY_TYPES) as AccessoryType[]).map((key) => {
                  const leq = getEquivalentLength(key, diameterMm, mat);
                  return (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center justify-between gap-4 w-full">
                        <span>{ACCESSORY_TYPES[key]}</span>
                        <span className="font-mono text-xs text-muted-foreground">Leq: {leq.toFixed(2)}m</span>
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <ScrollArea className="h-[200px] pr-3">
            <div className="space-y-2">
              {accessories.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum acessório adicionado</p>
              ) : (
                accessories.map((acc, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 bg-muted/20 rounded border border-border">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{ACCESSORY_TYPES[acc.type]}</p>
                      <p className="text-xs text-muted-foreground font-mono">Leq: {acc.equivalentLengthUnit.toFixed(2)}m × {acc.quantity} = {acc.equivalentLengthTotal.toFixed(2)}m</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input type="number" min={1} max={99} value={acc.quantity} onChange={(e) => updateQuantity(index, parseInt(e.target.value) || 1)} className="w-16 h-8 text-sm font-mono text-center" />
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeAccessory(index)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Comprimento Equivalente Total</span>
              <span className="font-mono text-xl font-bold text-primary">{totalLeq.toFixed(2)} m</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
