/**
 * Step 2: Sectors and Occupations
 */
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { Plus, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ProjectFormData } from './types';
import { SectorCard } from './SectorCard';

interface SectorsStepProps {
  form: UseFormReturn<ProjectFormData>;
}

function generateId(): string {
  return `sector-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function SectorsStep({ form }: SectorsStepProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'sectors',
  });

  const handleAddSector = () => {
    append({
      id: generateId(),
      name: '',
      area: 0,
      occupancyCode: '',
      occupancyName: '',
      cnaeCode: '',
      fireLoad: 0,
      fireLoadOverride: false,
      population: 0,
      populationOverride: false,
      floorHeight: 3,
      numberOfFloors: 1,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Setores e Ocupações
          </CardTitle>
          <CardDescription>
            Cadastre os setores da edificação com suas respectivas ocupações conforme NTCB 01/2025.
            Cada setor pode ter uma ocupação diferente (ex: térreo comercial, pavimentos superiores residenciais).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            <Button
              type="button"
              onClick={handleAddSector}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Adicionar Novo Setor
            </Button>
          </div>

          {fields.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">Nenhum setor cadastrado</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Clique em "Adicionar Novo Setor" para começar
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={handleAddSector}
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Setor
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => (
                <SectorCard
                  key={field.id}
                  index={index}
                  form={form}
                  onRemove={() => remove(index)}
                  canRemove={fields.length > 1}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Floating Add Button */}
      {fields.length > 0 && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={handleAddSector}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Adicionar Outro Setor
          </Button>
        </div>
      )}
    </div>
  );
}
