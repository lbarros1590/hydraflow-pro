/**
 * Step 1: General Building Data
 */
import { UseFormReturn } from 'react-hook-form';
import { Building2, User, Ruler, SquareStack } from 'lucide-react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ProjectFormData, processTypeOptions } from './types';

interface GeneralDataStepProps {
  form: UseFormReturn<ProjectFormData>;
}

export function GeneralDataStep({ form }: GeneralDataStepProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Identificação do Projeto
          </CardTitle>
          <CardDescription>
            Informações básicas do projeto para o PSCIP
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="projectName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título do Projeto</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Edifício Comercial Centro" {...field} />
                </FormControl>
                <FormDescription>
                  Nome identificador da edificação
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="processType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Processo</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de processo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-background border z-50">
                    {processTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Tipo de procedimento junto ao Corpo de Bombeiros
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="technicalResponsible"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Responsável Técnico
                </FormLabel>
                <FormControl>
                  <Input placeholder="Nome do engenheiro/arquiteto responsável" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-primary" />
            Dimensões da Edificação
          </CardTitle>
          <CardDescription>
            Dados dimensionais para classificação normativa
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="totalHeight"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <SquareStack className="h-4 w-4" />
                  Altura da Edificação (m)
                </FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.1"
                    placeholder="Ex: 15.5" 
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>
                  Altura total até a última laje habitável
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="totalArea"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Área Total Construída (m²)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01"
                    placeholder="Ex: 2500.00" 
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>
                  Soma de todas as áreas cobertas
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
