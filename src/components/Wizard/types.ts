/**
 * Types for Project Input Wizard
 */
import { z } from 'zod';

export const sectorSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Nome do setor é obrigatório'),
  area: z.number().min(1, 'Área deve ser maior que 0'),
  occupancyCode: z.string().min(1, 'Selecione uma ocupação'),
  occupancyName: z.string().optional(),
  cnaeCode: z.string().optional(),
  fireLoad: z.number().min(0).optional(),
  fireLoadOverride: z.boolean().default(false),
  population: z.number().min(0).optional(),
  populationOverride: z.boolean().default(false),
  floorHeight: z.number().min(2).default(3),
  numberOfFloors: z.number().min(1).default(1),
});

export const projectFormSchema = z.object({
  // Step 1 - General Data
  projectName: z.string().min(1, 'Nome do projeto é obrigatório'),
  processType: z.enum(['novo', 'renovacao', 'substituicao', 'existente']),
  technicalResponsible: z.string().min(1, 'Responsável técnico é obrigatório'),
  totalHeight: z.number().min(0, 'Altura deve ser maior ou igual a 0'),
  totalArea: z.number().min(1, 'Área deve ser maior que 0'),
  
  // Step 2 - Sectors
  sectors: z.array(sectorSchema).min(1, 'Adicione pelo menos um setor'),
});

export type SectorFormData = z.infer<typeof sectorSchema>;
export type ProjectFormData = z.infer<typeof projectFormSchema>;

export const processTypeOptions = [
  { value: 'novo', label: 'Novo PSCIP' },
  { value: 'renovacao', label: 'Renovação' },
  { value: 'substituicao', label: 'Substituição' },
  { value: 'existente', label: 'Área Existente' },
] as const;
