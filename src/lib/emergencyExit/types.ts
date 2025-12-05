/**
 * NTCB 13/2020 - Saídas de Emergência - Tipos
 */

export interface Door {
  id: string;
  width: number;       // Largura em metros
  height: number;      // Altura em metros
  quantity: number;    // Quantidade
  observation?: string; // ex: ABERTO, ENVIDRAÇADO, etc.
}

export interface EmergencySector {
  id: string;
  name: string;
  occupancyCode: string;      // ex: C-2, F-6, J-1
  occupancyDescription?: string;
  densityM2PerPerson: number; // 1 pessoa por X m²
  area: number;               // Área computada (m²)
  doors: Door[];
  
  // Campos calculados
  population?: number;
  upRequired?: number;
  widthRequired?: number;
  widthExisting?: number;
  isCompliant?: boolean;
}

export interface EmergencyFloor {
  id: string;
  name: string;              // ex: Pavimento 01, Mezanino, Subsolo
  height?: number;           // Altura do pavimento (opcional)
  observation?: string;
  sectors: EmergencySector[];
}

export interface EmergencyBuilding {
  id: string;
  name: string;
  address?: string;
  observation?: string;
  floors: EmergencyFloor[];
}

export interface SectorCalculationResult {
  sectorId: string;
  sectorName: string;
  floorName: string;
  occupancyCode: string;
  occupancyDescription: string;
  densityDescription: string;   // ex: "1 Pessoa/5m²"
  area: number;
  population: number;
  capacityPerUP: number;        // Sempre 100
  upRequired: number;
  widthRequired: number;        // UP × 0.55
  widthExisting: number;
  doors: Door[];
  isCompliant: boolean;
}

export interface BuildingCalculationResult {
  buildingId: string;
  buildingName: string;
  totalArea: number;
  totalPopulation: number;
  totalUpRequired: number;
  totalWidthRequired: number;
  totalWidthExisting: number;
  isCompliant: boolean;
  sectors: SectorCalculationResult[];
  notes: string[];
  warnings: string[];
}

export interface EmergencyExitReport {
  buildings: BuildingCalculationResult[];
  generatedAt: Date;
  projectName?: string;
}
