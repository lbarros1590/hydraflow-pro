/**
 * Módulo de Cálculo da Bomba
 * 
 * Implementa:
 * - Busca binária para determinar pressão mínima da bomba
 * - Cálculo de potência hidráulica
 * - Cálculo de potência do motor (com rendimento)
 */

import type { NetworkGraph, FlowResult, PumpResult } from '../models/types';
import { calculatePressures, findMostUnfavorableHydrants, calculateNozzlePressure } from './pressures';
import { WATER_DENSITY, GRAVITY, W_to_kW, kW_to_CV, m3s_to_Lmin } from './units';

/** Pressão máxima de busca (mca) */
const MAX_SEARCH_PRESSURE = 600;

/** Precisão da busca binária (mca) */
const SEARCH_PRECISION = 0.01;

/** Rendimento padrão da bomba */
const DEFAULT_EFFICIENCY = 0.65;

/**
 * Determina a pressão mínima da bomba usando busca binária
 * 
 * A bomba deve fornecer pressão tal que a menor pressão no esguicho
 * seja >= pressão mínima requerida
 * 
 * @param graph - Grafo da rede
 * @param flows - Vazões calculadas
 * @param requiredNozzlePressure - Pressão mínima no esguicho (mca)
 * @param flowPerHydrant - Vazão por hidrante (L/min)
 * @returns Pressão mínima da bomba (mca)
 */
export function findMinimumPumpPressure(
  graph: NetworkGraph,
  flows: Map<string, FlowResult>,
  requiredNozzlePressure: number,
  flowPerHydrant: number
): number {
  let low = 0;
  let high = MAX_SEARCH_PRESSURE;
  let result = high;

  while (high - low > SEARCH_PRECISION) {
    const mid = (low + high) / 2;

    // Calcula pressões com esta pressão de bomba
    const pressures = calculatePressures(graph, flows, mid);

    // Encontra os hidrantes mais desfavoráveis
    const unfavorable = findMostUnfavorableHydrants(graph, pressures);

    if (unfavorable.length === 0) {
      // Sem hidrantes - erro de configuração
      break;
    }

    // Calcula pressão no esguicho do hidrante mais desfavorável
    const worstHydrantPressure = unfavorable[0].pressure;
    const nozzlePressure = calculateNozzlePressure(worstHydrantPressure, flowPerHydrant);

    if (nozzlePressure >= requiredNozzlePressure) {
      // Pressão suficiente - tenta reduzir
      result = mid;
      high = mid;
    } else {
      // Pressão insuficiente - aumenta
      low = mid;
    }
  }

  // Arredonda para cima com margem de segurança
  return Math.ceil(result * 10) / 10;
}

/**
 * Calcula a potência hidráulica da bomba
 * 
 * Fórmula física:
 * P_h = ρ × g × Q × H
 * 
 * Onde:
 * - ρ = 1000 kg/m³ (densidade da água)
 * - g = 9.81 m/s²
 * - Q = vazão em m³/s
 * - H = altura manométrica em metros
 * 
 * @param flowM3s - Vazão em m³/s
 * @param headM - Altura manométrica (pressão) em mca
 * @returns Potência hidráulica em Watts
 */
export function calculateHydraulicPower(flowM3s: number, headM: number): number {
  return WATER_DENSITY * GRAVITY * flowM3s * headM;
}

/**
 * Calcula a potência do motor da bomba
 * 
 * P_motor = P_hidráulica / η
 * 
 * @param hydraulicPowerW - Potência hidráulica em Watts
 * @param efficiency - Rendimento da bomba (0-1)
 * @returns Potência do motor em Watts
 */
export function calculateMotorPower(
  hydraulicPowerW: number,
  efficiency: number = DEFAULT_EFFICIENCY
): number {
  return hydraulicPowerW / efficiency;
}

/**
 * Calcula todos os parâmetros da bomba
 * 
 * @param graph - Grafo da rede
 * @param flows - Vazões calculadas
 * @param requiredNozzlePressure - Pressão mínima no esguicho (mca)
 * @param flowPerHydrant - Vazão por hidrante (L/min)
 * @param efficiency - Rendimento da bomba
 * @returns Resultado completo da bomba
 */
export function calculatePumpParameters(
  graph: NetworkGraph,
  flows: Map<string, FlowResult>,
  requiredNozzlePressure: number,
  flowPerHydrant: number,
  efficiency: number = DEFAULT_EFFICIENCY
): PumpResult {
  // Encontra pressão mínima
  const minPressure = findMinimumPumpPressure(
    graph,
    flows,
    requiredNozzlePressure,
    flowPerHydrant
  );

  // Calcula vazão total do sistema
  let totalFlowM3s = 0;
  for (const [, flowResult] of flows) {
    // Soma apenas vazões que saem da fonte
    // Na prática, pegamos a maior vazão que representa a saída da bomba
    totalFlowM3s = Math.max(totalFlowM3s, Math.abs(flowResult.flow));
  }

  // Ou calcular a partir das demandas (mais preciso)
  // totalFlowM3s = soma das demandas ativas

  // Potência hidráulica
  const hydraulicPowerW = calculateHydraulicPower(totalFlowM3s, minPressure);
  const hydraulicPowerKW = W_to_kW(hydraulicPowerW);

  // Potência do motor
  const motorPowerW = calculateMotorPower(hydraulicPowerW, efficiency);
  const motorPowerKW = W_to_kW(motorPowerW);
  const motorPowerCV = kW_to_CV(motorPowerKW);

  // Arredonda para potência comercial
  const commercialPowerCV = getCommercialPower(motorPowerCV);

  return {
    minPressure,
    totalFlow: totalFlowM3s,
    totalFlowLmin: m3s_to_Lmin(totalFlowM3s),
    hydraulicPower: hydraulicPowerKW,
    motorPower: motorPowerKW,
    motorPowerCV,
    commercialPowerCV,
    efficiency
  };
}

/**
 * Retorna a potência comercial mais próxima (CV)
 */
function getCommercialPower(powerCV: number): number {
  const commercialPowers = [
    0.5, 0.75, 1, 1.5, 2, 3, 4, 5, 6, 7.5, 10, 
    12.5, 15, 20, 25, 30, 40, 50, 60, 75, 100, 
    125, 150, 175, 200, 250, 300, 350, 400, 450, 500
  ];

  for (const commercial of commercialPowers) {
    if (commercial >= powerCV) {
      return commercial;
    }
  }

  return Math.ceil(powerCV / 50) * 50;
}

/**
 * Calcula NPSH disponível (para verificação de cavitação)
 * 
 * NPSHd = P_atm/γ + h_s - P_v/γ - h_f
 * 
 * @param atmosphericPressure - Pressão atmosférica (mca, ~10.33 ao nível do mar)
 * @param suctionHead - Altura de sucção (positivo = afogada, negativo = aspiração)
 * @param vaporPressure - Pressão de vapor (mca, ~0.24 a 20°C)
 * @param suctionLoss - Perda de carga na sucção (mca)
 * @returns NPSH disponível em mca
 */
export function calculateNPSHAvailable(
  atmosphericPressure: number = 10.33,
  suctionHead: number,
  vaporPressure: number = 0.24,
  suctionLoss: number = 0
): number {
  return atmosphericPressure + suctionHead - vaporPressure - suctionLoss;
}
