/**
 * Types for Project Input Wizard - Extended
 */
import { z } from 'zod';

// Special risks checkboxes
export const specialRisks = [
  { id: 'subsolo', label: 'Subsolo', description: 'Edificação possui subsolo' },
  { id: 'glp', label: 'Central de GLP', description: 'Central de gás liquefeito' },
  { id: 'vasosPressao', label: 'Vasos de Pressão', description: 'Equipamentos pressurizados' },
  { id: 'inflamaveis', label: 'Líquidos Inflamáveis', description: 'Armazenamento de inflamáveis' },
  { id: 'caldeira', label: 'Caldeiras', description: 'Equipamentos térmicos' },
  { id: 'heliponto', label: 'Heliponto', description: 'Área para pouso de helicópteros' },
] as const;

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
  // Step 1 - Identification
  projectName: z.string().min(1, 'Nome do projeto é obrigatório'),
  owner: z.string().min(1, 'Proprietário é obrigatório'),
  technicalResponsible: z.string().min(1, 'Responsável técnico é obrigatório'),
  address: z.string().min(1, 'Endereço é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().default('MT'),
  processType: z.enum(['pscip', 'simplificado', 'evento']),
  
  // Step 2 - Geometry & Risk
  totalHeight: z.number().min(0, 'Altura deve ser maior ou igual a 0'),
  totalArea: z.number().min(1, 'Área deve ser maior que 0'),
  numberOfFloors: z.number().min(1, 'Número de pavimentos deve ser pelo menos 1'),
  specialRisks: z.array(z.string()).default([]),
  
  // Step 3 - Sectors/Occupations
  sectors: z.array(sectorSchema).min(1, 'Adicione pelo menos um setor'),
  
  // Step 4 - Measures (filled by system + user overrides)
  mandatoryMeasures: z.array(z.string()).optional(),
  exemptMeasures: z.array(z.string()).optional(),
});

export type SectorFormData = z.infer<typeof sectorSchema>;
export type ProjectFormData = z.infer<typeof projectFormSchema>;

export const processTypeOptions = [
  { value: 'pscip', label: 'PSCIP Completo' },
  { value: 'simplificado', label: 'Processo Simplificado' },
  { value: 'evento', label: 'Evento Temporário' },
] as const;

// Project status for dashboard
export type ProjectStatus = 'rascunho' | 'em_andamento' | 'concluido';

export interface SavedProject {
  id: string;
  data: ProjectFormData;
  status: ProjectStatus;
  riskClass: 'baixo' | 'medio' | 'alto';
  createdAt: string;
  updatedAt: string;
}

// All mandatory measures
export const ALL_MEASURES = [
  { id: 'extintores', label: 'Extintores de Incêndio', icon: 'FireExtinguisher' },
  { id: 'sinalizacao', label: 'Sinalização de Emergência', icon: 'SignpostBig' },
  { id: 'iluminacao', label: 'Iluminação de Emergência', icon: 'Lightbulb' },
  { id: 'alarme', label: 'Sistema de Alarme', icon: 'Bell' },
  { id: 'hidrantes', label: 'Sistema de Hidrantes', icon: 'Droplets' },
  { id: 'spk', label: 'Sprinklers', icon: 'Waves' },
  { id: 'chuveiros', label: 'Chuveiros Automáticos', icon: 'CloudRain' },
  { id: 'deteccao', label: 'Detecção Automática', icon: 'Radar' },
  { id: 'brigada', label: 'Brigada de Incêndio', icon: 'Users' },
  { id: 'saidas', label: 'Saídas de Emergência', icon: 'DoorOpen' },
  { id: 'controleAcesso', label: 'Controle de Acesso', icon: 'KeyRound' },
  { id: 'ppcip', label: 'Plano de Emergência (PPCIP)', icon: 'FileText' },
] as const;
