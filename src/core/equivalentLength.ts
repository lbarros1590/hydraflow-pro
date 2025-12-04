/**
 * Tabela de Comprimentos Equivalentes (L_eq)
 * Baseado na NBR 5626/82 e Tabela de Perda de Carga Tigre/Tupy
 * 
 * Valores exatos conforme PDF "Comprimento Equivalente.pdf"
 */

// Diâmetros nominais em polegadas e mm
export const DIAMETERS_INCH = ['3/4"', '1"', '1 1/4"', '1 1/2"', '2"', '2 1/2"', '3"', '4"', '5"'] as const;
export const DIAMETERS_MM = [20, 25, 32, 40, 50, 65, 80, 100, 125] as const;

// Mapeamento polegadas -> mm
export const INCH_TO_MM: Record<string, number> = {
  '3/4"': 20,
  '1"': 25,
  '1 1/4"': 32,
  '1 1/2"': 40,
  '2"': 50,
  '2 1/2"': 65,
  '3"': 80,
  '4"': 100,
  '5"': 125,
};

export type Material = 'PVC' | 'Metal';

export type AccessoryType = 
  | 'curve_90'
  | 'curve_45'
  | 'elbow_90'
  | 'elbow_45'
  | 'tee_straight'
  | 'tee_branch'
  | 'tee_bilateral'
  | 'union'
  | 'pipe_exit'
  | 'reducer'
  | 'gate_valve'
  | 'globe_valve'
  | 'angle_valve'
  | 'foot_valve'
  | 'check_valve_horizontal'
  | 'check_valve_vertical';

export interface AccessoryInfo {
  type: AccessoryType;
  name: string;
  namePt: string;
  materials: Material[];
}

export const ACCESSORY_INFO: AccessoryInfo[] = [
  { type: 'curve_90', name: 'Curve 90°', namePt: 'Curva 90°', materials: ['PVC', 'Metal'] },
  { type: 'curve_45', name: 'Curve 45°', namePt: 'Curva 45°', materials: ['PVC', 'Metal'] },
  { type: 'elbow_90', name: 'Elbow 90°', namePt: 'Joelho 90°', materials: ['PVC', 'Metal'] },
  { type: 'elbow_45', name: 'Elbow 45°', namePt: 'Joelho 45°', materials: ['PVC', 'Metal'] },
  { type: 'tee_straight', name: 'Tee (straight)', namePt: 'Tê passagem direta', materials: ['PVC', 'Metal'] },
  { type: 'tee_branch', name: 'Tee (branch)', namePt: 'Tê saída lateral', materials: ['PVC', 'Metal'] },
  { type: 'tee_bilateral', name: 'Tee (bilateral)', namePt: 'Tê saída bilateral', materials: ['PVC', 'Metal'] },
  { type: 'union', name: 'Union', namePt: 'União', materials: ['PVC', 'Metal'] },
  { type: 'pipe_exit', name: 'Pipe Exit', namePt: 'Saída de canalização', materials: ['PVC', 'Metal'] },
  { type: 'reducer', name: 'Reducer', namePt: 'Luva de redução', materials: ['PVC', 'Metal'] },
  { type: 'gate_valve', name: 'Gate Valve', namePt: 'Registro de gaveta/esfera', materials: ['PVC', 'Metal'] },
  { type: 'globe_valve', name: 'Globe Valve', namePt: 'Registro de globo', materials: ['Metal'] },
  { type: 'angle_valve', name: 'Angle Valve', namePt: 'Registro de ângulo', materials: ['Metal'] },
  { type: 'foot_valve', name: 'Foot Valve w/ Strainer', namePt: 'Válvula de pé com crivo', materials: ['PVC', 'Metal'] },
  { type: 'check_valve_horizontal', name: 'Check Valve (horiz)', namePt: 'Válvula retenção horizontal', materials: ['Metal'] },
  { type: 'check_valve_vertical', name: 'Check Valve (vert)', namePt: 'Válvula retenção vertical', materials: ['Metal'] },
];

/**
 * Tabela de comprimentos equivalentes em metros
 * Index corresponde ao DIAMETERS_MM: [20, 25, 32, 40, 50, 65, 80, 100, 125]
 * 
 * Valores exatos do PDF "Comprimento Equivalente"
 */
export const EQUIVALENT_LENGTHS: Record<AccessoryType, Record<Material, (number | null)[]>> = {
  // Curva 90°
  curve_90: {
    PVC: [0.5, 0.6, 0.7, 1.2, 1.3, 1.4, 1.5, 1.6, 1.9],
    Metal: [0.4, 0.5, 0.6, 0.7, 0.9, 1.0, 1.3, 1.6, 2.1],
  },
  // Curva 45°
  curve_45: {
    PVC: [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1],
    Metal: [0.2, 0.2, 0.3, 0.3, 0.4, 0.5, 0.6, 0.7, 0.9],
  },
  // Joelho 90°
  elbow_90: {
    PVC: [1.2, 1.5, 2.0, 3.2, 3.4, 3.7, 3.9, 4.3, 4.9],
    Metal: [0.7, 0.8, 1.1, 1.3, 1.7, 2.0, 2.5, 3.4, 4.2],
  },
  // Joelho 45°
  elbow_45: {
    PVC: [0.5, 0.7, 1.0, 1.3, 1.5, 1.7, 1.8, 1.9, 2.5],
    Metal: [0.3, 0.4, 0.5, 0.6, 0.8, 0.9, 1.2, 1.5, 1.9],
  },
  // Tê passagem direta
  tee_straight: {
    PVC: [0.8, 0.9, 1.5, 2.2, 2.3, 2.4, 2.5, 2.6, 3.3],
    Metal: [0.4, 0.5, 0.7, 0.9, 1.1, 1.3, 1.6, 2.1, 2.7],
  },
  // Tê saída lateral
  tee_branch: {
    PVC: [2.4, 3.1, 4.6, 7.3, 7.6, 7.8, 8.0, 8.3, 10.0],
    Metal: [1.4, 1.7, 2.3, 2.8, 3.5, 4.3, 5.2, 6.7, 8.4],
  },
  // Tê saída bilateral
  tee_bilateral: {
    PVC: [2.4, 3.1, 4.6, 7.3, 7.6, 7.8, 8.0, 8.3, 10.0],
    Metal: [1.4, 1.7, 2.3, 2.8, 3.5, 4.3, 5.2, 6.7, 8.4],
  },
  // União
  union: {
    PVC: [0.1, 0.1, 0.1, 0.1, 0.1, 0.15, 0.2, 0.25, null],
    Metal: [0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.02, 0.03, 0.04],
  },
  // Saída de canalização
  pipe_exit: {
    PVC: [0.9, 1.3, 1.4, 3.2, 3.3, 3.5, 3.7, 3.9, 4.9],
    Metal: [0.5, 0.7, 0.9, 1.0, 1.5, 1.9, 2.2, 3.2, 4.0],
  },
  // Luva de redução
  reducer: {
    PVC: [0.3, 0.2, 0.15, 0.4, 0.7, 0.8, 0.85, 0.95, 1.2],
    Metal: [0.29, 0.16, 0.12, 0.38, 0.64, 0.71, 0.78, 0.9, 1.07],
  },
  // Registro de gaveta ou esfera aberto
  gate_valve: {
    PVC: [0.2, 0.3, 0.4, 0.7, 0.8, 0.9, 0.9, 1.0, 1.1],
    Metal: [0.1, 0.2, 0.2, 0.3, 0.4, 0.4, 0.5, 0.7, 0.9],
  },
  // Registro de globo aberto (somente metal)
  globe_valve: {
    PVC: [null, null, null, null, null, null, null, null, null],
    Metal: [6.7, 8.2, 11.3, 13.4, 17.4, 21.0, 26.0, 34.0, 43.0],
  },
  // Registro de ângulo aberto (somente metal)
  angle_valve: {
    PVC: [null, null, null, null, null, null, null, null, null],
    Metal: [3.6, 4.6, 5.6, 6.7, 8.5, 10.0, 13.0, 17.0, 21.0],
  },
  // Válvula de pé com crivo
  foot_valve: {
    PVC: [9.5, 13.3, 15.3, 18.3, 23.7, 25.0, 26.8, 28.8, 37.4],
    Metal: [5.6, 7.3, 10.0, 11.6, 14.0, 17.0, 22.0, 23.0, 30.0],
  },
  // Válvula de retenção horizontal (somente metal)
  check_valve_horizontal: {
    PVC: [null, null, null, null, null, null, null, null, null],
    Metal: [1.6, 2.1, 2.7, 3.2, 4.2, 5.2, 6.3, 6.4, 10.4],
  },
  // Válvula de retenção vertical (somente metal)
  check_valve_vertical: {
    PVC: [null, null, null, null, null, null, null, null, null],
    Metal: [2.4, 3.2, 4.0, 4.8, 6.4, 8.1, 9.7, 12.9, 16.1],
  },
};

/**
 * Obtém o comprimento equivalente para um acessório
 * 
 * @param accessoryType - Tipo do acessório
 * @param material - Material da tubulação
 * @param diameterMm - Diâmetro em mm
 * @returns Comprimento equivalente em metros ou null se não disponível
 */
export function getEquivalentLength(
  accessoryType: AccessoryType,
  material: Material,
  diameterMm: number
): number | null {
  const accessory = EQUIVALENT_LENGTHS[accessoryType];
  if (!accessory) return null;

  const materialData = accessory[material];
  if (!materialData) return null;

  // Encontra o índice do diâmetro
  const index = DIAMETERS_MM.indexOf(diameterMm as typeof DIAMETERS_MM[number]);
  if (index === -1) {
    // Interpola para diâmetros intermediários
    return interpolateEquivalentLength(materialData, diameterMm);
  }

  return materialData[index];
}

/**
 * Interpola comprimento equivalente para diâmetros não tabelados
 */
function interpolateEquivalentLength(data: (number | null)[], diameterMm: number): number | null {
  // Encontra os diâmetros vizinhos
  let lowerIndex = -1;
  let upperIndex = -1;

  for (let i = 0; i < DIAMETERS_MM.length; i++) {
    if (DIAMETERS_MM[i] <= diameterMm) lowerIndex = i;
    if (DIAMETERS_MM[i] >= diameterMm && upperIndex === -1) upperIndex = i;
  }

  if (lowerIndex === -1 || upperIndex === -1) return null;
  if (lowerIndex === upperIndex) return data[lowerIndex];

  const lowerValue = data[lowerIndex];
  const upperValue = data[upperIndex];

  if (lowerValue === null || upperValue === null) return null;

  // Interpolação linear
  const lowerDiam = DIAMETERS_MM[lowerIndex];
  const upperDiam = DIAMETERS_MM[upperIndex];
  const ratio = (diameterMm - lowerDiam) / (upperDiam - lowerDiam);

  return lowerValue + ratio * (upperValue - lowerValue);
}

/**
 * Calcula o comprimento equivalente total de uma lista de acessórios
 */
export interface AccessoryItem {
  type: AccessoryType;
  quantity: number;
}

export function calculateTotalEquivalentLength(
  accessories: AccessoryItem[],
  material: Material,
  diameterMm: number
): number {
  let total = 0;

  for (const item of accessories) {
    const leq = getEquivalentLength(item.type, material, diameterMm);
    if (leq !== null) {
      total += leq * item.quantity;
    }
  }

  return total;
}

/**
 * Retorna os coeficientes de Hazen-Williams por material
 */
export const HAZEN_WILLIAMS_C: Record<string, number> = {
  PVC: 150,
  CPVC: 150,
  Metal: 120,
  'Aço Galvanizado': 120,
  'Aço Novo': 130,
  'Aço Usado': 100,
  'Ferro Fundido Novo': 130,
  'Ferro Fundido Usado': 100,
  Cobre: 140,
};

export function getHazenWilliamsC(material: string): number {
  return HAZEN_WILLIAMS_C[material] || 120;
}
