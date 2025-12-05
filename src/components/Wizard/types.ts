/**
 * Types for Project Input Wizard - Extended with Buildings/Floors/Sectors hierarchy
 */
import { z } from 'zod';

// Door for emergency exit calculations
export const doorSchema = z.object({
  id: z.string(),
  width: z.number().min(0.6, 'Largura mínima 0.60m'),
  height: z.number().min(2.0).default(2.1),
  quantity: z.number().min(1).default(1),
  observation: z.string().optional(),
});

export type DoorData = z.infer<typeof doorSchema>;

// Sector within a floor
export const projectSectorSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Nome do setor é obrigatório'),
  area: z.number().min(0, 'Área deve ser maior ou igual a 0'),
  occupancyCode: z.string().optional(),
  occupancyName: z.string().optional(),
  cnaeCode: z.string().optional(),
  fireLoad: z.number().min(0).optional(),
  fireLoadOverride: z.boolean().default(false),
  population: z.number().min(0).optional(),
  populationOverride: z.boolean().default(false),
  densityM2PerPerson: z.number().min(1).default(10),
  doors: z.array(doorSchema).default([]),
});

export type ProjectSectorData = z.infer<typeof projectSectorSchema>;

// Floor within a building
export const projectFloorSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Nome do pavimento é obrigatório'),
  height: z.number().min(2).default(3),
  observation: z.string().optional(),
  sectors: z.array(projectSectorSchema).default([]),
});

export type ProjectFloorData = z.infer<typeof projectFloorSchema>;

// Building in the project (for separation calculations)
export const projectBuildingSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Nome da edificação é obrigatório'),
  address: z.string().optional(),
  // Separation calculation fields
  facadeWidth: z.number().min(0).optional(),
  facadeHeight: z.number().min(0).optional(),
  openingArea: z.number().min(0).optional(),
  trrf: z.number().min(0).optional(),
  hasSprinklers: z.boolean().default(false),
  hasFireWall: z.boolean().default(false),
  hasWaterCurtain: z.boolean().default(false),
  hasOpeningProtection: z.boolean().default(false),
  floors: z.array(projectFloorSchema).default([]),
});

export type ProjectBuildingData = z.infer<typeof projectBuildingSchema>;

// Special risks checkboxes
export const specialRisks = [
  { id: 'subsolo', label: 'Subsolo', description: 'Edificação possui subsolo' },
  { id: 'glp', label: 'Central de GLP', description: 'Central de gás liquefeito' },
  { id: 'vasosPressao', label: 'Vasos de Pressão', description: 'Equipamentos pressurizados' },
  { id: 'inflamaveis', label: 'Líquidos Inflamáveis', description: 'Armazenamento de inflamáveis' },
  { id: 'caldeira', label: 'Caldeiras', description: 'Equipamentos térmicos' },
  { id: 'heliponto', label: 'Heliponto', description: 'Área para pouso de helicópteros' },
] as const;

// Legacy sector schema (for backward compatibility)
export const sectorSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Nome do setor é obrigatório'),
  area: z.number().min(0, 'Área deve ser maior ou igual a 0'),
  occupancyCode: z.string().optional(),
  occupancyName: z.string().optional(),
  cnaeCode: z.string().optional(),
  fireLoad: z.number().min(0).optional(),
  fireLoadOverride: z.boolean().default(false),
  population: z.number().min(0).optional(),
  populationOverride: z.boolean().default(false),
  floorHeight: z.number().min(2).default(3),
  numberOfFloors: z.number().min(1).default(1),
});

export type SectorFormData = z.infer<typeof sectorSchema>;

export const projectFormSchema = z.object({
  // Step 1 - Identification
  projectName: z.string().min(1, 'Nome do projeto é obrigatório'),
  owner: z.string().min(1, 'Proprietário é obrigatório'),
  technicalResponsible: z.string().min(1, 'Responsável técnico é obrigatório'),
  address: z.string().min(1, 'Endereço é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().default('MT'),
  stateCode: z.string().default('MT'),
  processType: z.enum(['pscip', 'simplificado', 'evento']),
  
  // Step 2 - Geometry & Risk
  totalHeight: z.number().min(0, 'Altura deve ser maior ou igual a 0'),
  totalArea: z.number().min(1, 'Área deve ser maior que 0'),
  numberOfFloors: z.number().min(1, 'Número de pavimentos deve ser pelo menos 1'),
  specialRisks: z.array(z.string()).default([]),
  
  // Step 3 - Buildings/Floors/Sectors (NEW hierarchical structure)
  buildings: z.array(projectBuildingSchema).default([]),
  
  // Legacy: sectors array (for backward compatibility)
  sectors: z.array(sectorSchema).default([]),
  
  // Step 4 - Measures
  mandatoryMeasures: z.array(z.string()).optional(),
  exemptMeasures: z.array(z.string()).optional(),
  voluntaryMeasures: z.array(z.string()).optional(),
  
  // Separation between buildings
  actualSeparationDistance: z.number().min(0).optional(),
  hasFireDepartment: z.boolean().default(true),
});

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

// Helper functions to generate IDs
export function generateBuildingId(): string {
  return `bld_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function generateFloorId(): string {
  return `flr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function generateSectorId(): string {
  return `sec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function generateDoorId(): string {
  return `door_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
