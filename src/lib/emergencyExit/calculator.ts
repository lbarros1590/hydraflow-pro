/**
 * NTCB 13/2020 - Motor de Cálculo de Saídas de Emergência
 */

import type {
  Door,
  EmergencySector,
  EmergencyFloor,
  EmergencyBuilding,
  SectorCalculationResult,
  BuildingCalculationResult,
  EmergencyExitReport,
} from './types';
import { getOccupancyDensity } from './tables';

// Constantes NTCB 13/2020
const UP_WIDTH = 0.55; // Largura de 1 UP em metros
const CAPACITY_PER_UP = 100; // Capacidade por UP (pessoas)

/**
 * Calcula a população de um setor
 * População = Área / Densidade (arredondado para cima)
 */
export function calculatePopulation(area: number, densityM2PerPerson: number): number {
  if (area <= 0 || densityM2PerPerson <= 0) return 0;
  return Math.ceil(area / densityM2PerPerson);
}

/**
 * Calcula o número de UPs exigidas
 * UP_exigida = População / 100 (arredondado para cima)
 */
export function calculateUP(population: number): number {
  if (population <= 0) return 0;
  return Math.ceil(population / CAPACITY_PER_UP);
}

/**
 * Calcula a largura mínima exigida das saídas
 * Largura = UP × 0,55m
 */
export function calculateRequiredWidth(upRequired: number): number {
  return upRequired * UP_WIDTH;
}

/**
 * Calcula a largura total existente das portas
 */
export function calculateExistingWidth(doors: Door[]): number {
  return doors.reduce((total, door) => total + (door.width * door.quantity), 0);
}

/**
 * Verifica se o setor atende à norma
 */
export function validateSector(widthRequired: number, widthExisting: number): boolean {
  return widthExisting >= widthRequired;
}

/**
 * Calcula todos os dados de um setor
 */
export function calculateSector(
  sector: EmergencySector,
  floorName: string
): SectorCalculationResult {
  const occupancyData = getOccupancyDensity(sector.occupancyCode);
  const density = sector.densityM2PerPerson || occupancyData?.densityM2PerPerson || 10;
  
  const population = calculatePopulation(sector.area, density);
  const upRequired = calculateUP(population);
  const widthRequired = calculateRequiredWidth(upRequired);
  const widthExisting = calculateExistingWidth(sector.doors);
  const isCompliant = validateSector(widthRequired, widthExisting);
  
  return {
    sectorId: sector.id,
    sectorName: sector.name,
    floorName,
    occupancyCode: sector.occupancyCode,
    occupancyDescription: occupancyData?.description || sector.occupancyDescription || 'Não especificado',
    densityDescription: occupancyData?.densityDescription || `1 Pessoa/${density}m²`,
    area: sector.area,
    population,
    capacityPerUP: CAPACITY_PER_UP,
    upRequired,
    widthRequired: Math.round(widthRequired * 100) / 100,
    widthExisting: Math.round(widthExisting * 100) / 100,
    doors: sector.doors,
    isCompliant,
  };
}

/**
 * Calcula todos os dados de uma edificação
 */
export function calculateBuilding(building: EmergencyBuilding): BuildingCalculationResult {
  const sectors: SectorCalculationResult[] = [];
  const notes: string[] = [];
  const warnings: string[] = [];
  
  // Processa todos os pavimentos e setores
  building.floors.forEach(floor => {
    floor.sectors.forEach(sector => {
      const result = calculateSector(sector, floor.name);
      sectors.push(result);
      
      if (!result.isCompliant) {
        warnings.push(`${sector.name} (${floor.name}): Largura insuficiente - Exigido: ${result.widthRequired.toFixed(2)}m, Existente: ${result.widthExisting.toFixed(2)}m`);
      }
    });
  });
  
  // Totais
  const totalArea = sectors.reduce((sum, s) => sum + s.area, 0);
  const totalPopulation = sectors.reduce((sum, s) => sum + s.population, 0);
  const totalUpRequired = Math.ceil(totalPopulation / CAPACITY_PER_UP);
  const totalWidthRequired = totalUpRequired * UP_WIDTH;
  const totalWidthExisting = sectors.reduce((sum, s) => sum + s.widthExisting, 0);
  const isCompliant = sectors.every(s => s.isCompliant);
  
  // Notas
  notes.push(`Total de ${sectors.length} setor(es) analisado(s)`);
  notes.push(`População total: ${totalPopulation} pessoas`);
  notes.push(`UPs totais necessárias: ${totalUpRequired}`);
  
  return {
    buildingId: building.id,
    buildingName: building.name,
    totalArea: Math.round(totalArea * 100) / 100,
    totalPopulation,
    totalUpRequired,
    totalWidthRequired: Math.round(totalWidthRequired * 100) / 100,
    totalWidthExisting: Math.round(totalWidthExisting * 100) / 100,
    isCompliant,
    sectors,
    notes,
    warnings,
  };
}

/**
 * Gera o relatório completo de saídas de emergência
 */
export function generateEmergencyExitReport(
  buildings: EmergencyBuilding[],
  projectName?: string
): EmergencyExitReport {
  return {
    buildings: buildings.map(calculateBuilding),
    generatedAt: new Date(),
    projectName,
  };
}

/**
 * Formata as portas existentes para exibição
 */
export function formatDoorsDisplay(doors: Door[]): string {
  if (doors.length === 0) return '-';
  
  return doors.map(door => {
    const dims = `${door.quantity} - ${door.width.toFixed(2)} x ${door.height.toFixed(2)}`;
    return door.observation ? `${dims}\n${door.observation}` : dims;
  }).join('\n');
}

/**
 * Largura mínima segundo a norma (2 UP = 1,10m)
 */
export function getMinimumWidth(): number {
  return UP_WIDTH * 2; // 1,10m
}
