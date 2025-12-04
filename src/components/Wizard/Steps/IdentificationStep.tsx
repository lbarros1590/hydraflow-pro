/**
 * Step 1 - Project Identification
 */
import { UseFormReturn } from 'react-hook-form';
import { ProjectFormData, processTypeOptions } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, User, MapPin, FileText } from 'lucide-react';

interface IdentificationStepProps {
  form: UseFormReturn<ProjectFormData>;
}

export function IdentificationStep({ form }: IdentificationStepProps) {
  return (
    <div className="space-y-6 pb-24">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Dados do Projeto
          </CardTitle>
          <CardDescription>
            Informações básicas de identificação do projeto PSCIP
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="projectName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Projeto *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Edifício Comercial Centro" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="processType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Processo *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {processTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Responsáveis
          </CardTitle>
          <CardDescription>
            Proprietário e responsável técnico pelo projeto
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="owner"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Proprietário / Razão Social *</FormLabel>
                <FormControl>
                  <Input placeholder="Nome completo ou razão social" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="technicalResponsible"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Responsável Técnico *</FormLabel>
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
            <MapPin className="h-5 w-5 text-primary" />
            Localização
          </CardTitle>
          <CardDescription>
            Endereço completo da edificação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Endereço *</FormLabel>
                <FormControl>
                  <Input placeholder="Rua, número, bairro" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cidade *</FormLabel>
                  <FormControl>
                    <Input placeholder="Cuiabá" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <FormControl>
                    <Input placeholder="MT" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
