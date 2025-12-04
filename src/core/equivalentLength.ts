/**
 * Tabela de Comprimentos Equivalentes (L_eq)
 * Baseado na NBR 5626/82 e Tabela de Perda de Carga Tigre/Tupy
 */

export const DIAMETERS_MM = [20, 25, 32, 40, 50, 65, 80, 100, 125] as const;

export type Material = 'PVC' | 'Metal';

export type AccessoryType = 
  | 'curve_90' | 'curve_45' | 'elbow_90' | 'elbow_45'
  | 'tee_straight' | 'tee_branch' | 'tee_bilateral'
  | 'union' | 'pipe_exit' | 'reducer'
  | 'gate_valve' | 'globe_valve' | 'angle_valve'
  | 'foot_valve' | 'check_valve_horizontal' | 'check_valve_vertical';

export const ACCESSORY_TYPES: Record<AccessoryType, string> = {
  curve_90: 'Curva 90°',
  curve_45: 'Curva 45°',
  elbow_90: 'Joelho 90°',
  elbow_45: 'Joelho 45°',
  tee_straight: 'Tê passagem direta',
  tee_branch: 'Tê saída lateral',
  tee_bilateral: 'Tê saída bilateral',
  union: 'União',
  pipe_exit: 'Saída de canalização',
  reducer: 'Luva de redução',
  gate_valve: 'Registro gaveta/esfera',
  globe_valve: 'Registro de globo',
  angle_valve: 'Registro de ângulo',
  foot_valve: 'Válvula de pé com crivo',
  check_valve_horizontal: 'Válvula retenção horiz.',
  check_valve_vertical: 'Válvula retenção vert.',
};

export const EQUIVALENT_LENGTHS: Record<AccessoryType, Record<Material, (number | null)[]>> = {
  curve_90: { PVC: [0.5, 0.6, 0.7, 1.2, 1.3, 1.4, 1.5, 1.6, 1.9], Metal: [0.4, 0.5, 0.6, 0.7, 0.9, 1.0, 1.3, 1.6, 2.1] },
  curve_45: { PVC: [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1], Metal: [0.2, 0.2, 0.3, 0.3, 0.4, 0.5, 0.6, 0.7, 0.9] },
  elbow_90: { PVC: [1.2, 1.5, 2.0, 3.2, 3.4, 3.7, 3.9, 4.3, 4.9], Metal: [0.7, 0.8, 1.1, 1.3, 1.7, 2.0, 2.5, 3.4, 4.2] },
  elbow_45: { PVC: [0.5, 0.7, 1.0, 1.3, 1.5, 1.7, 1.8, 1.9, 2.5], Metal: [0.3, 0.4, 0.5, 0.6, 0.8, 0.9, 1.2, 1.5, 1.9] },
  tee_straight: { PVC: [0.8, 0.9, 1.5, 2.2, 2.3, 2.4, 2.5, 2.6, 3.3], Metal: [0.4, 0.5, 0.7, 0.9, 1.1, 1.3, 1.6, 2.1, 2.7] },
  tee_branch: { PVC: [2.4, 3.1, 4.6, 7.3, 7.6, 7.8, 8.0, 8.3, 10.0], Metal: [1.4, 1.7, 2.3, 2.8, 3.5, 4.3, 5.2, 6.7, 8.4] },
  tee_bilateral: { PVC: [2.4, 3.1, 4.6, 7.3, 7.6, 7.8, 8.0, 8.3, 10.0], Metal: [1.4, 1.7, 2.3, 2.8, 3.5, 4.3, 5.2, 6.7, 8.4] },
  union: { PVC: [0.1, 0.1, 0.1, 0.1, 0.1, 0.15, 0.2, 0.25, null], Metal: [0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.02, 0.03, 0.04] },
  pipe_exit: { PVC: [0.9, 1.3, 1.4, 3.2, 3.3, 3.5, 3.7, 3.9, 4.9], Metal: [0.5, 0.7, 0.9, 1.0, 1.5, 1.9, 2.2, 3.2, 4.0] },
  reducer: { PVC: [0.3, 0.2, 0.15, 0.4, 0.7, 0.8, 0.85, 0.95, 1.2], Metal: [0.29, 0.16, 0.12, 0.38, 0.64, 0.71, 0.78, 0.9, 1.07] },
  gate_valve: { PVC: [0.2, 0.3, 0.4, 0.7, 0.8, 0.9, 0.9, 1.0, 1.1], Metal: [0.1, 0.2, 0.2, 0.3, 0.4, 0.4, 0.5, 0.7, 0.9] },
  globe_valve: { PVC: [null, null, null, null, null, null, null, null, null], Metal: [6.7, 8.2, 11.3, 13.4, 17.4, 21.0, 26.0, 34.0, 43.0] },
  angle_valve: { PVC: [null, null, null, null, null, null, null, null, null], Metal: [3.6, 4.6, 5.6, 6.7, 8.5, 10.0, 13.0, 17.0, 21.0] },
  foot_valve: { PVC: [9.5, 13.3, 15.3, 18.3, 23.7, 25.0, 26.8, 28.8, 37.4], Metal: [5.6, 7.3, 10.0, 11.6, 14.0, 17.0, 22.0, 23.0, 30.0] },
  check_valve_horizontal: { PVC: [null, null, null, null, null, null, null, null, null], Metal: [1.6, 2.1, 2.7, 3.2, 4.2, 5.2, 6.3, 6.4, 10.4] },
  check_valve_vertical: { PVC: [null, null, null, null, null, null, null, null, null], Metal: [2.4, 3.2, 4.0, 4.8, 6.4, 8.1, 9.7, 12.9, 16.1] },
};

export function getEquivalentLength(accessoryType: AccessoryType, diameterMm: number, material: Material): number {
  const accessory = EQUIVALENT_LENGTHS[accessoryType];
  if (!accessory) return 0;
  const materialData = accessory[material];
  if (!materialData) return 0;
  const index = DIAMETERS_MM.indexOf(diameterMm as typeof DIAMETERS_MM[number]);
  if (index === -1) {
    // Interpolate
    let lowerIndex = -1, upperIndex = -1;
    for (let i = 0; i < DIAMETERS_MM.length; i++) {
      if (DIAMETERS_MM[i] <= diameterMm) lowerIndex = i;
      if (DIAMETERS_MM[i] >= diameterMm && upperIndex === -1) upperIndex = i;
    }
    if (lowerIndex === -1 || upperIndex === -1) return 0;
    const lv = materialData[lowerIndex], uv = materialData[upperIndex];
    if (lv === null || uv === null) return 0;
    const ratio = (diameterMm - DIAMETERS_MM[lowerIndex]) / (DIAMETERS_MM[upperIndex] - DIAMETERS_MM[lowerIndex]);
    return lv + ratio * (uv - lv);
  }
  return materialData[index] ?? 0;
}

export interface AccessoryItem { type: AccessoryType; quantity: number; }

export function calculateTotalEquivalentLength(accessories: AccessoryItem[], diameterMm: number, material: Material): number {
  let total = 0;
  for (const item of accessories) {
    const leq = getEquivalentLength(item.type, diameterMm, material);
    total += leq * item.quantity;
  }
  return total;
}

export const HAZEN_WILLIAMS_C: Record<string, number> = {
  PVC: 150, CPVC: 150, Metal: 120, 'Aço Galvanizado': 120, 'Aço Novo': 130, 'Aço Usado': 100, 'Ferro Fundido Novo': 130, 'Ferro Fundido Usado': 100, Cobre: 140,
};

export function getHazenWilliamsC(material: string): number {
  return HAZEN_WILLIAMS_C[material] || 120;
}
