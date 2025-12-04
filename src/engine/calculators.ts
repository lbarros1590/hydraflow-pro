/**
 * Calculadoras para Dimensionamento de Sistemas de Proteção
 * Baseado em NTCB 13/2020, NTCB 18/2020, NTCB 07/2020
 */

import type { 
  BuildingSector, 
  RiskClass, 
  PopulationResult, 
  ExitCalculation, 
  ExtinguisherCalculation,
  FireLoadCalculation,
  AnexoG_Table6_7_Row
} from '../models/project';
import { POPULATION_PARAMS, getTypicalFireLoad, calculatePopulation as calcPop } from '../core/ntcbData';
import { OCCUPANCY_DIVISIONS } from '../core/ntcbClassification';

// ============================================
// CONSTANTES (NTCB 13/2020, NTCB 18/2020)
// ============================================

const EXIT_CONSTANTS = {
  // 1 UP = 0,55m (NTCB 13/2020)
  UP_WIDTH: 0.55,
  
  // Capacidade por UP (NTCB 13/2020 - Tabela 4)
  CAPACITY: {
    door: 60,           // Acessos e descargas
    corridor: 60,       // Corredores
    stair: 45,          // Escadas
    ramp: 60,           // Rampas
    stair_protected: 60 // Escadas protegidas
  },
  
  // Largura mínima
  MIN_WIDTH: 1.10,      // mínimo 2 UP
  MIN_WIDTH_HOSPITAL: 2.20, // mínimo 4 UP para hospitais
};

const EXTINGUISHER_CONSTANTS = {
  // Área de cobertura por classe de risco (NTCB 18/2020)
  COVERAGE_AREA: {
    baixo: 500,    // m² - risco baixo
    medio: 250,    // m² - risco médio  
    alto: 150,     // m² - risco alto
  },
  
  // Distância máxima de caminhamento (NTCB 18/2020)
  MAX_DISTANCE: {
    baixo: 25,     // metros
    medio: 20,     // metros
    alto: 15,      // metros
  },
  
  // Tipos recomendados
  TYPES: {
    baixo: 'ABC 4kg ou água 10L',
    medio: 'ABC 6kg ou CO2 6kg',
    alto: 'ABC 8kg + CO2 6kg',
  }
};

// ============================================
// CÁLCULO DE POPULAÇÃO
// ============================================

/**
 * Calcula a população de um setor
 * Conforme NTCB 08/2020 e NTCB 13/2020
 */
export function calculatePopulation(area: number, divisionCode: string): number {
  return calcPop(divisionCode, area);
}

/**
 * Calcula população para todos os setores
 */
export function calculateSectorPopulations(sectors: BuildingSector[]): PopulationResult[] {
  return sectors.map(sector => {
    const params = POPULATION_PARAMS[sector.occupancyCode];
    const population = sector.population ?? calculatePopulation(sector.area, sector.occupancyCode);
    
    return {
      sectorId: sector.id,
      sectorName: sector.name,
      area: sector.area,
      occupancyCode: sector.occupancyCode,
      method: params?.method ?? 'area',
      factor: params?.description ?? '1 pessoa/10m²',
      population,
    };
  });
}

/**
 * Calcula população total
 */
export function calculateTotalPopulation(sectors: BuildingSector[]): number {
  return sectors.reduce((total, sector) => {
    return total + (sector.population ?? calculatePopulation(sector.area, sector.occupancyCode));
  }, 0);
}

// ============================================
// CÁLCULO DE SAÍDAS DE EMERGÊNCIA
// ============================================

/**
 * Calcula as saídas de emergência necessárias
 * Conforme NTCB 13/2020
 */
export function calculateExits(population: number, isHospital: boolean = false): ExitCalculation {
  // Capacidade padrão: 60 pessoas por UP para portas
  const capacityPerUP = EXIT_CONSTANTS.CAPACITY.door;
  
  // UP necessárias (arredondado para cima)
  const unitsRequired = Math.ceil(population / capacityPerUP);
  
  // Largura mínima (NTCB 13/2020)
  const minWidth = isHospital ? EXIT_CONSTANTS.MIN_WIDTH_HOSPITAL : EXIT_CONSTANTS.MIN_WIDTH;
  
  // Largura necessária (não pode ser menor que o mínimo)
  const widthRequired = Math.max(unitsRequired * EXIT_CONSTANTS.UP_WIDTH, minWidth);
  
  // Número de saídas (mínimo 2 para > 50 pessoas)
  let numberOfExits = 1;
  if (population > 50) numberOfExits = 2;
  if (population > 200) numberOfExits = 3;
  if (population > 400) numberOfExits = 4;
  
  // Largura por saída (dividido pelo número de saídas, arredondado)
  const widthPerExit = Math.ceil((widthRequired / numberOfExits) / EXIT_CONSTANTS.UP_WIDTH) * EXIT_CONSTANTS.UP_WIDTH;
  
  return {
    totalPopulation: population,
    unitsRequired,
    widthRequired,
    numberOfExits,
    doorWidth: Math.max(widthPerExit, minWidth),
    corridorWidth: Math.max(widthPerExit, minWidth),
    stairWidth: Math.max(widthPerExit, minWidth),
    capacityPerUP,
  };
}

// ============================================
// CÁLCULO DE EXTINTORES
// ============================================

/**
 * Estima a quantidade de extintores necessários
 * Conforme NTCB 18/2020
 */
export function estimateExtinguishers(area: number, riskClass: RiskClass): ExtinguisherCalculation {
  const coverageArea = EXTINGUISHER_CONSTANTS.COVERAGE_AREA[riskClass];
  const maxDistance = EXTINGUISHER_CONSTANTS.MAX_DISTANCE[riskClass];
  const type = EXTINGUISHER_CONSTANTS.TYPES[riskClass];
  
  // Quantidade necessária (mínimo 1)
  const quantityRequired = Math.max(1, Math.ceil(area / coverageArea));
  
  // Capacidade recomendada
  let capacity = '4kg ABC';
  if (riskClass === 'medio') capacity = '6kg ABC';
  if (riskClass === 'alto') capacity = '8kg ABC';
  
  return {
    riskClass,
    coverageRadius: Math.sqrt(coverageArea / Math.PI),
    coverageArea,
    quantityRequired,
    type,
    capacity,
  };
}

// ============================================
// CÁLCULO DE CARGA DE INCÊNDIO
// ============================================

/**
 * Calcula a carga de incêndio de um setor
 */
export function calculateFireLoad(sector: BuildingSector): FireLoadCalculation {
  const specificFireLoad = sector.fireLoad ?? getTypicalFireLoad(sector.occupancyCode);
  const totalFireLoad = specificFireLoad * sector.area;
  
  let riskClass: RiskClass = 'baixo';
  if (specificFireLoad > 300 && specificFireLoad <= 1200) riskClass = 'medio';
  if (specificFireLoad > 1200) riskClass = 'alto';
  
  return {
    sectorId: sector.id,
    sectorName: sector.name,
    area: sector.area,
    specificFireLoad,
    totalFireLoad,
    riskClass,
  };
}

/**
 * Calcula carga de incêndio para todos os setores
 */
export function calculateAllFireLoads(sectors: BuildingSector[]): {
  results: FireLoadCalculation[];
  totalFireLoad: number;
  averageFireLoad: number;
} {
  const results = sectors.map(calculateFireLoad);
  const totalFireLoad = results.reduce((sum, r) => sum + r.totalFireLoad, 0);
  const totalArea = sectors.reduce((sum, s) => sum + s.area, 0);
  const averageFireLoad = totalArea > 0 ? totalFireLoad / totalArea : 0;
  
  return { results, totalFireLoad, averageFireLoad };
}

// ============================================
// FORMATAÇÃO PARA TABELAS DO ANEXO G
// ============================================

/**
 * Gera dados para Tabela 6.7 do Anexo G (Memorial de Cálculo Hidráulico)
 * Esta função recebe os resultados do cálculo hidráulico
 */
export function generateTable6_7Data(
  pipeResults: Array<{
    pipeId: string;
    pipeName?: string;
    flow: number;           // L/min
    length: number;         // m
    equivalentLength: number; // m
    diameter: number;       // mm
    unitLoss: number;       // m/m
    headLoss: number;       // m
    startElevation: number; // m
    endElevation: number;   // m
    startPressure: number;  // mca
    endPressure: number;    // mca
  }>
): AnexoG_Table6_7_Row[] {
  return pipeResults.map((pipe, index) => ({
    trecho: pipe.pipeName || `T${index + 1}`,
    vazao: Math.round(pipe.flow * 100) / 100,
    comprimento: Math.round(pipe.length * 100) / 100,
    leq: Math.round(pipe.equivalentLength * 100) / 100,
    diametro: pipe.diameter,
    j: Math.round(pipe.unitLoss * 10000) / 10000,
    deltaH: Math.round(pipe.headLoss * 100) / 100,
    cota: Math.round(pipe.endElevation * 100) / 100,
    pressao: Math.round(pipe.endPressure * 100) / 100,
  }));
}

// ============================================
// UTILITÁRIOS
// ============================================

/**
 * Formata número para exibição
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return value.toFixed(decimals).replace('.', ',');
}

/**
 * Converte UP para metros
 */
export function upToMeters(up: number): number {
  return up * EXIT_CONSTANTS.UP_WIDTH;
}

/**
 * Converte metros para UP
 */
export function metersToUp(meters: number): number {
  return Math.ceil(meters / EXIT_CONSTANTS.UP_WIDTH);
}
