/**
 * Dados NTCB - Banco de dados CNAE e parâmetros de população
 * Baseado em NTCB 01/2025, NTCB 07/2020, NTCB 08/2020, NTCB 13/2020
 */

// ============================================
// PARÂMETROS DE POPULAÇÃO (NTCB 08/2020 + NTCB 13/2020)
// ============================================

export interface PopulationParams {
  method: 'area' | 'fixed' | 'seats' | 'beds';
  factorM2PerPerson?: number;    // 1 pessoa por X m²
  personsPerM2?: number;         // X pessoas por m²
  description: string;
}

/**
 * Parâmetros de cálculo de população por divisão de ocupação
 * Conforme NTCB 08/2020 (Tabela de lotação) e NTCB 13/2020 (Tabela 1)
 */
export const POPULATION_PARAMS: Record<string, PopulationParams> = {
  // GRUPO A - RESIDENCIAL
  'A-1': { method: 'fixed', description: '2 pessoas por dormitório' },
  'A-2': { method: 'fixed', description: '2 pessoas por dormitório' },
  'A-3': { method: 'area', factorM2PerPerson: 10, description: '1 pessoa/10m² de área útil' },
  
  // GRUPO B - HOSPEDAGEM
  'B-1': { method: 'area', factorM2PerPerson: 15, description: '1 pessoa/15m² de área de UH' },
  'B-2': { method: 'area', factorM2PerPerson: 15, description: '1 pessoa/15m² de área de UH' },
  
  // GRUPO C - COMERCIAL
  'C-1': { method: 'area', factorM2PerPerson: 6, description: '1 pessoa/6m² de área de vendas' },
  'C-2': { method: 'area', factorM2PerPerson: 3, description: '1 pessoa/3m² de área de vendas' },
  'C-3': { method: 'area', factorM2PerPerson: 3, description: '1 pessoa/3m² (shopping)' },
  
  // GRUPO D - SERVIÇOS
  'D-1': { method: 'area', factorM2PerPerson: 7, description: '1 pessoa/7m² de área útil' },
  'D-2': { method: 'area', factorM2PerPerson: 5, description: '1 pessoa/5m² (bancos)' },
  'D-3': { method: 'area', factorM2PerPerson: 7, description: '1 pessoa/7m² de área útil' },
  'D-4': { method: 'area', factorM2PerPerson: 7, description: '1 pessoa/7m² de área útil' },
  
  // GRUPO E - EDUCACIONAL
  'E-1': { method: 'area', factorM2PerPerson: 1.5, description: '1 pessoa/1,5m² de sala de aula' },
  'E-2': { method: 'area', factorM2PerPerson: 1.5, description: '1 pessoa/1,5m² de sala de aula' },
  'E-3': { method: 'area', factorM2PerPerson: 4, description: '1 pessoa/4m² de área útil' },
  'E-4': { method: 'area', factorM2PerPerson: 1.5, description: '1 pessoa/1,5m² de área útil' },
  'E-5': { method: 'area', factorM2PerPerson: 3, description: '1 pessoa/3m² (creches)' },
  'E-6': { method: 'area', factorM2PerPerson: 3, description: '1 pessoa/3m² (especial)' },
  
  // GRUPO F - REUNIÃO DE PÚBLICO
  'F-1': { method: 'area', factorM2PerPerson: 3, description: '1 pessoa/3m² de área de exposição' },
  'F-2': { method: 'area', factorM2PerPerson: 1, description: '1 pessoa/m² (templos)' },
  'F-3': { method: 'seats', description: 'Conforme nº de assentos' },
  'F-4': { method: 'area', factorM2PerPerson: 1.5, description: '1 pessoa/1,5m² de área de espera' },
  'F-5': { method: 'seats', description: 'Conforme nº de assentos' },
  'F-6': { method: 'area', personsPerM2: 2, description: '2 pessoas/m² (boates/clubes)' },
  'F-7': { method: 'seats', description: 'Conforme nº de assentos' },
  'F-8': { method: 'area', factorM2PerPerson: 1, description: '1 pessoa/m² de salão' },
  'F-9': { method: 'area', factorM2PerPerson: 1.5, description: '1 pessoa/1,5m²' },
  'F-10': { method: 'area', factorM2PerPerson: 3, description: '1 pessoa/3m²' },
  'F-11': { method: 'area', personsPerM2: 2, description: '2 pessoas/m² (boates)' },
  
  // GRUPO G - AUTOMOTIVOS
  'G-1': { method: 'area', factorM2PerPerson: 30, description: '1 pessoa/30m² (garagem)' },
  'G-2': { method: 'area', factorM2PerPerson: 30, description: '1 pessoa/30m² (garagem)' },
  'G-3': { method: 'area', factorM2PerPerson: 20, description: '1 pessoa/20m² (postos)' },
  'G-4': { method: 'area', factorM2PerPerson: 10, description: '1 pessoa/10m² (oficinas)' },
  'G-5': { method: 'area', factorM2PerPerson: 50, description: '1 pessoa/50m² (hangares)' },
  
  // GRUPO H - SAÚDE
  'H-1': { method: 'area', factorM2PerPerson: 7, description: '1 pessoa/7m²' },
  'H-2': { method: 'beds', description: 'Conforme nº de leitos + funcionários' },
  'H-3': { method: 'beds', description: 'Conforme nº de leitos + funcionários' },
  'H-4': { method: 'area', factorM2PerPerson: 5, description: '1 pessoa/5m²' },
  'H-5': { method: 'beds', description: 'Conforme nº de leitos' },
  'H-6': { method: 'area', factorM2PerPerson: 7, description: '1 pessoa/7m²' },
  
  // GRUPO I - INDUSTRIAL
  'I-1': { method: 'area', factorM2PerPerson: 10, description: '1 pessoa/10m²' },
  'I-2': { method: 'area', factorM2PerPerson: 10, description: '1 pessoa/10m²' },
  'I-3': { method: 'area', factorM2PerPerson: 10, description: '1 pessoa/10m²' },
  
  // GRUPO J - DEPÓSITOS
  'J-1': { method: 'area', factorM2PerPerson: 30, description: '1 pessoa/30m²' },
  'J-2': { method: 'area', factorM2PerPerson: 30, description: '1 pessoa/30m²' },
  'J-3': { method: 'area', factorM2PerPerson: 30, description: '1 pessoa/30m²' },
  'J-4': { method: 'area', factorM2PerPerson: 30, description: '1 pessoa/30m²' },
  
  // GRUPO L - EXPLOSIVOS
  'L-1': { method: 'area', factorM2PerPerson: 10, description: '1 pessoa/10m²' },
  'L-2': { method: 'area', factorM2PerPerson: 20, description: '1 pessoa/20m²' },
  'L-3': { method: 'area', factorM2PerPerson: 50, description: '1 pessoa/50m²' },
  
  // GRUPO M - ESPECIAL
  'M-1': { method: 'area', factorM2PerPerson: 20, description: '1 pessoa/20m²' },
  'M-3': { method: 'area', factorM2PerPerson: 10, description: '1 pessoa/10m²' },
  'M-4': { method: 'area', factorM2PerPerson: 20, description: '1 pessoa/20m²' },
  'M-5': { method: 'area', factorM2PerPerson: 50, description: '1 pessoa/50m²' },
  'M-8': { method: 'area', factorM2PerPerson: 100, description: '1 pessoa/100m²' },
};

// ============================================
// CARGA DE INCÊNDIO ESPECÍFICA (NTCB 07/2020)
// ============================================

export interface FireLoadData {
  occupancyCode: string;
  description: string;
  fireLoadMJm2: number;  // Carga de incêndio específica média
  riskClass: 'baixo' | 'medio' | 'alto';
}

/**
 * Cargas de incêndio típicas por ocupação (NTCB 07/2020 - Tabela A.1)
 */
export const FIRE_LOAD_BY_OCCUPANCY: FireLoadData[] = [
  // RESIDENCIAL
  { occupancyCode: 'A-1', description: 'Residência unifamiliar', fireLoadMJm2: 300, riskClass: 'baixo' },
  { occupancyCode: 'A-2', description: 'Apartamentos', fireLoadMJm2: 300, riskClass: 'baixo' },
  { occupancyCode: 'A-3', description: 'Pensionatos', fireLoadMJm2: 400, riskClass: 'medio' },
  
  // HOSPEDAGEM
  { occupancyCode: 'B-1', description: 'Hotéis', fireLoadMJm2: 500, riskClass: 'medio' },
  { occupancyCode: 'B-2', description: 'Apart-hotéis', fireLoadMJm2: 400, riskClass: 'medio' },
  
  // COMERCIAL
  { occupancyCode: 'C-1', description: 'Comércio baixa carga', fireLoadMJm2: 200, riskClass: 'baixo' },
  { occupancyCode: 'C-2', description: 'Comércio em geral', fireLoadMJm2: 600, riskClass: 'medio' },
  { occupancyCode: 'C-3', description: 'Shopping centers', fireLoadMJm2: 800, riskClass: 'medio' },
  
  // SERVIÇOS
  { occupancyCode: 'D-1', description: 'Escritórios', fireLoadMJm2: 700, riskClass: 'medio' },
  { occupancyCode: 'D-2', description: 'Agências bancárias', fireLoadMJm2: 300, riskClass: 'baixo' },
  { occupancyCode: 'D-3', description: 'Serviços de reparação', fireLoadMJm2: 500, riskClass: 'medio' },
  { occupancyCode: 'D-4', description: 'Laboratórios', fireLoadMJm2: 500, riskClass: 'medio' },
  
  // EDUCACIONAL
  { occupancyCode: 'E-1', description: 'Escolas', fireLoadMJm2: 300, riskClass: 'baixo' },
  { occupancyCode: 'E-2', description: 'Escolas especiais', fireLoadMJm2: 300, riskClass: 'baixo' },
  { occupancyCode: 'E-3', description: 'Academias', fireLoadMJm2: 200, riskClass: 'baixo' },
  { occupancyCode: 'E-4', description: 'Centros de treinamento', fireLoadMJm2: 400, riskClass: 'medio' },
  { occupancyCode: 'E-5', description: 'Pré-escolas', fireLoadMJm2: 300, riskClass: 'baixo' },
  { occupancyCode: 'E-6', description: 'Escolas especiais', fireLoadMJm2: 300, riskClass: 'baixo' },
  
  // REUNIÃO DE PÚBLICO
  { occupancyCode: 'F-1', description: 'Museus/bibliotecas', fireLoadMJm2: 500, riskClass: 'medio' },
  { occupancyCode: 'F-2', description: 'Igrejas/velórios', fireLoadMJm2: 300, riskClass: 'baixo' },
  { occupancyCode: 'F-3', description: 'Centros esportivos', fireLoadMJm2: 200, riskClass: 'baixo' },
  { occupancyCode: 'F-4', description: 'Estações/terminais', fireLoadMJm2: 300, riskClass: 'baixo' },
  { occupancyCode: 'F-5', description: 'Teatros/cinemas', fireLoadMJm2: 400, riskClass: 'medio' },
  { occupancyCode: 'F-6', description: 'Clubes sociais', fireLoadMJm2: 400, riskClass: 'medio' },
  { occupancyCode: 'F-7', description: 'Construções provisórias', fireLoadMJm2: 200, riskClass: 'baixo' },
  { occupancyCode: 'F-8', description: 'Restaurantes', fireLoadMJm2: 300, riskClass: 'baixo' },
  { occupancyCode: 'F-9', description: 'Recreação pública', fireLoadMJm2: 200, riskClass: 'baixo' },
  { occupancyCode: 'F-10', description: 'Exposições', fireLoadMJm2: 300, riskClass: 'baixo' },
  { occupancyCode: 'F-11', description: 'Boates', fireLoadMJm2: 400, riskClass: 'medio' },
  
  // AUTOMOTIVOS
  { occupancyCode: 'G-1', description: 'Garagem automática', fireLoadMJm2: 200, riskClass: 'baixo' },
  { occupancyCode: 'G-2', description: 'Garagem coletiva', fireLoadMJm2: 200, riskClass: 'baixo' },
  { occupancyCode: 'G-3', description: 'Postos de combustível', fireLoadMJm2: 800, riskClass: 'alto' },
  { occupancyCode: 'G-4', description: 'Oficinas mecânicas', fireLoadMJm2: 500, riskClass: 'medio' },
  { occupancyCode: 'G-5', description: 'Hangares', fireLoadMJm2: 800, riskClass: 'alto' },
  
  // SAÚDE
  { occupancyCode: 'H-1', description: 'Veterinário', fireLoadMJm2: 300, riskClass: 'baixo' },
  { occupancyCode: 'H-2', description: 'Asilos', fireLoadMJm2: 300, riskClass: 'baixo' },
  { occupancyCode: 'H-3', description: 'Hospitais', fireLoadMJm2: 300, riskClass: 'baixo' },
  { occupancyCode: 'H-4', description: 'Edificações públicas', fireLoadMJm2: 400, riskClass: 'medio' },
  { occupancyCode: 'H-5', description: 'Prisões', fireLoadMJm2: 300, riskClass: 'baixo' },
  { occupancyCode: 'H-6', description: 'Clínicas', fireLoadMJm2: 300, riskClass: 'baixo' },
  
  // INDUSTRIAL
  { occupancyCode: 'I-1', description: 'Industrial baixo', fireLoadMJm2: 200, riskClass: 'baixo' },
  { occupancyCode: 'I-2', description: 'Industrial médio', fireLoadMJm2: 800, riskClass: 'medio' },
  { occupancyCode: 'I-3', description: 'Industrial alto', fireLoadMJm2: 2000, riskClass: 'alto' },
  
  // DEPÓSITOS
  { occupancyCode: 'J-1', description: 'Depósito incombustível', fireLoadMJm2: 50, riskClass: 'baixo' },
  { occupancyCode: 'J-2', description: 'Depósito baixa carga', fireLoadMJm2: 200, riskClass: 'baixo' },
  { occupancyCode: 'J-3', description: 'Depósito média carga', fireLoadMJm2: 800, riskClass: 'medio' },
  { occupancyCode: 'J-4', description: 'Depósito alta carga', fireLoadMJm2: 2000, riskClass: 'alto' },
  
  // EXPLOSIVOS
  { occupancyCode: 'L-1', description: 'Comércio explosivos', fireLoadMJm2: 500, riskClass: 'alto' },
  { occupancyCode: 'L-2', description: 'Indústria explosivos', fireLoadMJm2: 1000, riskClass: 'alto' },
  { occupancyCode: 'L-3', description: 'Depósito explosivos', fireLoadMJm2: 1000, riskClass: 'alto' },
  
  // ESPECIAL
  { occupancyCode: 'M-1', description: 'Túneis', fireLoadMJm2: 300, riskClass: 'medio' },
  { occupancyCode: 'M-3', description: 'Central telefônica', fireLoadMJm2: 600, riskClass: 'medio' },
  { occupancyCode: 'M-4', description: 'Em construção', fireLoadMJm2: 500, riskClass: 'medio' },
  { occupancyCode: 'M-5', description: 'Silos', fireLoadMJm2: 800, riskClass: 'alto' },
  { occupancyCode: 'M-8', description: 'Parques eólicos/solares', fireLoadMJm2: 100, riskClass: 'baixo' },
];

// ============================================
// MAPEAMENTO CNAE → NTCB
// ============================================

export interface CNAEMapping {
  code: string;
  description: string;
  suggestedDivisions: string[];
  defaultFireLoad?: number;  // MJ/m²
}

/**
 * Mapeamento de códigos CNAE para divisões NTCB
 * Um CNAE pode se enquadrar em mais de uma divisão
 */
export const CNAE_MAPPING: CNAEMapping[] = [
  // COMÉRCIO VAREJISTA
  { code: '47.11-3', description: 'Comércio varejista de mercadorias em geral (supermercados)', suggestedDivisions: ['C-2', 'C-3'], defaultFireLoad: 700 },
  { code: '47.12-1', description: 'Comércio varejista de mercadorias em geral (lojas de departamentos)', suggestedDivisions: ['C-2', 'C-3'], defaultFireLoad: 800 },
  { code: '47.21-1', description: 'Comércio varejista de produtos de padaria, laticínio e frios', suggestedDivisions: ['C-2'], defaultFireLoad: 400 },
  { code: '47.22-9', description: 'Comércio varejista de carnes (açougues)', suggestedDivisions: ['C-2'], defaultFireLoad: 300 },
  { code: '47.23-7', description: 'Comércio varejista de bebidas', suggestedDivisions: ['C-2'], defaultFireLoad: 300 },
  { code: '47.24-5', description: 'Comércio varejista de hortifrutigranjeiros', suggestedDivisions: ['C-2'], defaultFireLoad: 200 },
  { code: '47.29-6', description: 'Comércio varejista de produtos alimentícios em geral', suggestedDivisions: ['C-2'], defaultFireLoad: 500 },
  { code: '47.41-5', description: 'Comércio varejista de tintas e materiais para pintura', suggestedDivisions: ['C-2'], defaultFireLoad: 800 },
  { code: '47.42-3', description: 'Comércio varejista de material elétrico', suggestedDivisions: ['C-2'], defaultFireLoad: 600 },
  { code: '47.43-1', description: 'Comércio varejista de vidros', suggestedDivisions: ['C-1'], defaultFireLoad: 100 },
  { code: '47.44-0', description: 'Comércio varejista de ferragens, madeira e materiais de construção', suggestedDivisions: ['C-2', 'J-3'], defaultFireLoad: 800 },
  { code: '47.51-2', description: 'Comércio varejista especializado de equipamentos de informática', suggestedDivisions: ['C-2'], defaultFireLoad: 500 },
  { code: '47.52-1', description: 'Comércio varejista de equipamentos de telefonia e comunicação', suggestedDivisions: ['C-2'], defaultFireLoad: 400 },
  { code: '47.53-9', description: 'Comércio varejista de eletrodomésticos e equipamentos de áudio e vídeo', suggestedDivisions: ['C-2'], defaultFireLoad: 600 },
  { code: '47.54-7', description: 'Comércio varejista de móveis', suggestedDivisions: ['C-2'], defaultFireLoad: 700 },
  { code: '47.55-5', description: 'Comércio varejista de tecidos', suggestedDivisions: ['C-2'], defaultFireLoad: 800 },
  { code: '47.56-3', description: 'Comércio varejista de artigos de cama, mesa e banho', suggestedDivisions: ['C-2'], defaultFireLoad: 700 },
  { code: '47.57-1', description: 'Comércio varejista de artigos de uso doméstico', suggestedDivisions: ['C-2'], defaultFireLoad: 500 },
  { code: '47.59-8', description: 'Comércio varejista de artigos de uso pessoal e doméstico', suggestedDivisions: ['C-2'], defaultFireLoad: 600 },
  { code: '47.61-0', description: 'Comércio varejista de livros, jornais, revistas e papelaria', suggestedDivisions: ['C-2'], defaultFireLoad: 1000 },
  { code: '47.62-8', description: 'Comércio varejista de discos, CDs, DVDs e fitas', suggestedDivisions: ['C-2'], defaultFireLoad: 700 },
  { code: '47.63-6', description: 'Comércio varejista de artigos recreativos e esportivos', suggestedDivisions: ['C-2'], defaultFireLoad: 500 },
  { code: '47.71-7', description: 'Comércio varejista de produtos farmacêuticos', suggestedDivisions: ['C-2'], defaultFireLoad: 400 },
  { code: '47.72-5', description: 'Comércio varejista de cosméticos e perfumaria', suggestedDivisions: ['C-2'], defaultFireLoad: 500 },
  { code: '47.73-3', description: 'Comércio varejista de artigos médicos e ortopédicos', suggestedDivisions: ['C-2'], defaultFireLoad: 300 },
  { code: '47.74-1', description: 'Comércio varejista de artigos de óptica', suggestedDivisions: ['C-2'], defaultFireLoad: 300 },
  { code: '47.81-4', description: 'Comércio varejista de artigos do vestuário e acessórios', suggestedDivisions: ['C-2'], defaultFireLoad: 800 },
  { code: '47.82-2', description: 'Comércio varejista de calçados e artigos de viagem', suggestedDivisions: ['C-2'], defaultFireLoad: 700 },
  { code: '47.83-1', description: 'Comércio varejista de jóias e relógios', suggestedDivisions: ['C-2'], defaultFireLoad: 300 },
  { code: '47.84-9', description: 'Comércio varejista de gás liquefeito de petróleo (GLP)', suggestedDivisions: ['C-2', 'L-1'], defaultFireLoad: 500 },
  { code: '47.89-0', description: 'Comércio varejista de outros produtos', suggestedDivisions: ['C-2'], defaultFireLoad: 500 },
  
  // SERVIÇOS DE ALIMENTAÇÃO
  { code: '56.11-2', description: 'Restaurantes e outros estabelecimentos de serviços de alimentação e bebidas', suggestedDivisions: ['F-8'], defaultFireLoad: 300 },
  { code: '56.12-1', description: 'Serviços ambulantes de alimentação', suggestedDivisions: ['F-8'], defaultFireLoad: 200 },
  { code: '56.20-1', description: 'Serviços de catering, bufê e outros serviços de comida preparada', suggestedDivisions: ['F-8'], defaultFireLoad: 400 },
  
  // ALOJAMENTO
  { code: '55.10-8', description: 'Hotéis e similares', suggestedDivisions: ['B-1'], defaultFireLoad: 500 },
  { code: '55.90-6', description: 'Outros tipos de alojamento', suggestedDivisions: ['B-1', 'B-2'], defaultFireLoad: 400 },
  
  // EDUCAÇÃO
  { code: '85.11-2', description: 'Educação infantil - creche', suggestedDivisions: ['E-5'], defaultFireLoad: 300 },
  { code: '85.12-1', description: 'Educação infantil - pré-escola', suggestedDivisions: ['E-5'], defaultFireLoad: 300 },
  { code: '85.13-9', description: 'Ensino fundamental', suggestedDivisions: ['E-1'], defaultFireLoad: 300 },
  { code: '85.20-1', description: 'Ensino médio', suggestedDivisions: ['E-1'], defaultFireLoad: 300 },
  { code: '85.31-7', description: 'Educação superior - graduação', suggestedDivisions: ['E-1'], defaultFireLoad: 400 },
  { code: '85.32-5', description: 'Educação superior - graduação e pós-graduação', suggestedDivisions: ['E-1'], defaultFireLoad: 400 },
  { code: '85.33-3', description: 'Educação superior - pós-graduação e extensão', suggestedDivisions: ['E-1'], defaultFireLoad: 400 },
  { code: '85.41-4', description: 'Educação profissional de nível técnico', suggestedDivisions: ['E-4'], defaultFireLoad: 400 },
  { code: '85.42-2', description: 'Educação profissional de nível tecnológico', suggestedDivisions: ['E-4'], defaultFireLoad: 400 },
  { code: '85.50-3', description: 'Atividades de apoio à educação', suggestedDivisions: ['E-2'], defaultFireLoad: 300 },
  { code: '85.91-1', description: 'Ensino de esportes', suggestedDivisions: ['E-3'], defaultFireLoad: 200 },
  { code: '85.92-9', description: 'Ensino de arte e cultura', suggestedDivisions: ['E-2'], defaultFireLoad: 400 },
  { code: '85.93-7', description: 'Ensino de idiomas', suggestedDivisions: ['E-2'], defaultFireLoad: 300 },
  { code: '85.99-6', description: 'Atividades de ensino não especificadas', suggestedDivisions: ['E-2'], defaultFireLoad: 300 },
  
  // SAÚDE
  { code: '86.10-1', description: 'Atividades de atendimento hospitalar', suggestedDivisions: ['H-3'], defaultFireLoad: 300 },
  { code: '86.21-6', description: 'Serviços móveis de atendimento a urgências', suggestedDivisions: ['H-6'], defaultFireLoad: 300 },
  { code: '86.22-4', description: 'Serviços de remoção de pacientes', suggestedDivisions: ['H-6'], defaultFireLoad: 200 },
  { code: '86.30-5', description: 'Atividades de atenção ambulatorial', suggestedDivisions: ['H-6'], defaultFireLoad: 300 },
  { code: '86.40-2', description: 'Atividades de serviços de complementação diagnóstica e terapêutica', suggestedDivisions: ['H-6'], defaultFireLoad: 400 },
  { code: '86.50-0', description: 'Atividades de profissionais da área de saúde', suggestedDivisions: ['H-6'], defaultFireLoad: 300 },
  { code: '86.60-7', description: 'Atividades de apoio à gestão de saúde', suggestedDivisions: ['H-6'], defaultFireLoad: 300 },
  { code: '86.90-9', description: 'Atividades de atenção à saúde humana não especificadas', suggestedDivisions: ['H-6'], defaultFireLoad: 300 },
  
  // SERVIÇOS SOCIAIS
  { code: '87.11-5', description: 'Atividades de assistência a idosos, deficientes físicos, imunodeprimidos e convalescentes, e de infraestrutura de apoio a pacientes, com alojamento', suggestedDivisions: ['H-2'], defaultFireLoad: 300 },
  { code: '87.12-3', description: 'Atividades de fornecimento de infraestrutura de apoio e assistência a paciente no domicílio', suggestedDivisions: ['H-2'], defaultFireLoad: 200 },
  { code: '87.20-4', description: 'Atividades de assistência psicossocial e à saúde a portadores de distúrbios psíquicos', suggestedDivisions: ['H-5'], defaultFireLoad: 300 },
  { code: '87.30-1', description: 'Atividades de assistência social prestadas em residências coletivas e particulares', suggestedDivisions: ['H-2'], defaultFireLoad: 300 },
  
  // INDÚSTRIAS
  { code: '10.11-2', description: 'Abate de reses, exceto suínos', suggestedDivisions: ['I-1'], defaultFireLoad: 200 },
  { code: '10.12-1', description: 'Abate de suínos, aves e outros pequenos animais', suggestedDivisions: ['I-1'], defaultFireLoad: 200 },
  { code: '10.13-9', description: 'Fabricação de produtos de carne', suggestedDivisions: ['I-2'], defaultFireLoad: 400 },
  { code: '10.20-1', description: 'Preservação do pescado e fabricação de produtos do pescado', suggestedDivisions: ['I-1'], defaultFireLoad: 200 },
  { code: '10.31-7', description: 'Fabricação de conservas de frutas', suggestedDivisions: ['I-1'], defaultFireLoad: 300 },
  { code: '10.32-5', description: 'Fabricação de conservas de legumes e outros vegetais', suggestedDivisions: ['I-1'], defaultFireLoad: 300 },
  { code: '10.33-3', description: 'Fabricação de sucos de frutas, hortaliças e legumes', suggestedDivisions: ['I-1'], defaultFireLoad: 300 },
  { code: '10.41-4', description: 'Fabricação de óleos vegetais em bruto, exceto óleo de milho', suggestedDivisions: ['I-2'], defaultFireLoad: 800 },
  { code: '10.42-2', description: 'Fabricação de óleos vegetais refinados, exceto óleo de milho', suggestedDivisions: ['I-2'], defaultFireLoad: 800 },
  { code: '10.43-1', description: 'Fabricação de margarina e outras gorduras vegetais', suggestedDivisions: ['I-2'], defaultFireLoad: 700 },
  { code: '10.51-1', description: 'Preparação do leite', suggestedDivisions: ['I-1'], defaultFireLoad: 200 },
  { code: '10.52-0', description: 'Fabricação de laticínios', suggestedDivisions: ['I-1'], defaultFireLoad: 300 },
  { code: '10.53-8', description: 'Fabricação de sorvetes e outros gelados comestíveis', suggestedDivisions: ['I-1'], defaultFireLoad: 300 },
  { code: '10.61-9', description: 'Beneficiamento de arroz e fabricação de produtos do arroz', suggestedDivisions: ['I-2'], defaultFireLoad: 600 },
  { code: '10.62-7', description: 'Moagem de trigo e fabricação de derivados', suggestedDivisions: ['I-2'], defaultFireLoad: 700 },
  { code: '10.63-5', description: 'Fabricação de farinha de mandioca e derivados', suggestedDivisions: ['I-2'], defaultFireLoad: 600 },
  { code: '10.64-3', description: 'Fabricação de farinha de milho e derivados, exceto óleos de milho', suggestedDivisions: ['I-2'], defaultFireLoad: 600 },
  { code: '10.65-1', description: 'Fabricação de amidos e féculas de vegetais', suggestedDivisions: ['I-2'], defaultFireLoad: 600 },
  { code: '10.66-0', description: 'Fabricação de alimentos para animais', suggestedDivisions: ['I-2'], defaultFireLoad: 700 },
  { code: '10.71-6', description: 'Fabricação de açúcar em bruto', suggestedDivisions: ['I-2'], defaultFireLoad: 500 },
  { code: '10.72-4', description: 'Fabricação de açúcar refinado', suggestedDivisions: ['I-2'], defaultFireLoad: 500 },
  { code: '10.81-3', description: 'Torrefação e moagem de café', suggestedDivisions: ['I-2'], defaultFireLoad: 800 },
  { code: '10.82-1', description: 'Fabricação de produtos à base de café', suggestedDivisions: ['I-2'], defaultFireLoad: 600 },
  { code: '10.91-1', description: 'Fabricação de produtos de panificação', suggestedDivisions: ['I-1'], defaultFireLoad: 400 },
  { code: '10.92-9', description: 'Fabricação de biscoitos e bolachas', suggestedDivisions: ['I-2'], defaultFireLoad: 600 },
  { code: '10.93-7', description: 'Fabricação de produtos derivados do cacau, de chocolates e confeitos', suggestedDivisions: ['I-2'], defaultFireLoad: 600 },
  { code: '10.94-5', description: 'Fabricação de massas alimentícias', suggestedDivisions: ['I-1'], defaultFireLoad: 400 },
  { code: '10.95-3', description: 'Fabricação de especiarias, molhos, temperos e condimentos', suggestedDivisions: ['I-1'], defaultFireLoad: 400 },
  { code: '10.96-1', description: 'Fabricação de alimentos e pratos prontos', suggestedDivisions: ['I-1'], defaultFireLoad: 400 },
  { code: '10.99-6', description: 'Fabricação de produtos alimentícios não especificados', suggestedDivisions: ['I-2'], defaultFireLoad: 500 },
  
  // BEBIDAS
  { code: '11.11-9', description: 'Fabricação de aguardentes e outras bebidas destiladas', suggestedDivisions: ['I-2'], defaultFireLoad: 800 },
  { code: '11.12-7', description: 'Fabricação de vinho', suggestedDivisions: ['I-2'], defaultFireLoad: 600 },
  { code: '11.13-5', description: 'Fabricação de malte, cervejas e chopes', suggestedDivisions: ['I-2'], defaultFireLoad: 500 },
  { code: '11.21-6', description: 'Fabricação de águas envasadas', suggestedDivisions: ['I-1'], defaultFireLoad: 200 },
  { code: '11.22-4', description: 'Fabricação de refrigerantes e de outras bebidas não alcoólicas', suggestedDivisions: ['I-1'], defaultFireLoad: 300 },
  
  // TÊXTIL
  { code: '13.11-1', description: 'Preparação e fiação de fibras de algodão', suggestedDivisions: ['I-3'], defaultFireLoad: 1500 },
  { code: '13.12-0', description: 'Preparação e fiação de fibras têxteis naturais, exceto algodão', suggestedDivisions: ['I-3'], defaultFireLoad: 1500 },
  { code: '13.13-8', description: 'Fiação de fibras artificiais e sintéticas', suggestedDivisions: ['I-3'], defaultFireLoad: 1500 },
  { code: '13.14-6', description: 'Fabricação de linhas para costurar e bordar', suggestedDivisions: ['I-2'], defaultFireLoad: 1000 },
  { code: '13.21-9', description: 'Tecelagem de fios de algodão', suggestedDivisions: ['I-3'], defaultFireLoad: 1500 },
  { code: '13.22-7', description: 'Tecelagem de fios de fibras têxteis naturais, exceto algodão', suggestedDivisions: ['I-3'], defaultFireLoad: 1500 },
  { code: '13.23-5', description: 'Tecelagem de fios de fibras artificiais e sintéticas', suggestedDivisions: ['I-3'], defaultFireLoad: 1500 },
  { code: '13.30-8', description: 'Fabricação de tecidos de malha', suggestedDivisions: ['I-2'], defaultFireLoad: 1000 },
  { code: '13.40-5', description: 'Acabamentos em fios, tecidos e artefatos têxteis', suggestedDivisions: ['I-2'], defaultFireLoad: 800 },
  { code: '13.51-1', description: 'Fabricação de artefatos têxteis para uso doméstico', suggestedDivisions: ['I-2'], defaultFireLoad: 1000 },
  { code: '13.52-9', description: 'Fabricação de artefatos de tapeçaria', suggestedDivisions: ['I-2'], defaultFireLoad: 1000 },
  { code: '13.53-7', description: 'Fabricação de artefatos de cordoaria', suggestedDivisions: ['I-2'], defaultFireLoad: 800 },
  { code: '13.54-5', description: 'Fabricação de tecidos especiais, inclusive artefatos', suggestedDivisions: ['I-2'], defaultFireLoad: 800 },
  { code: '13.59-6', description: 'Fabricação de outros produtos têxteis não especificados', suggestedDivisions: ['I-2'], defaultFireLoad: 800 },
  
  // VESTUÁRIO
  { code: '14.11-8', description: 'Confecção de roupas íntimas', suggestedDivisions: ['I-2'], defaultFireLoad: 1000 },
  { code: '14.12-6', description: 'Confecção de peças de vestuário, exceto roupas íntimas', suggestedDivisions: ['I-2'], defaultFireLoad: 1000 },
  { code: '14.13-4', description: 'Confecção de roupas profissionais', suggestedDivisions: ['I-2'], defaultFireLoad: 1000 },
  { code: '14.14-2', description: 'Fabricação de acessórios do vestuário, exceto para segurança e proteção', suggestedDivisions: ['I-2'], defaultFireLoad: 800 },
  { code: '14.21-5', description: 'Fabricação de meias', suggestedDivisions: ['I-2'], defaultFireLoad: 1000 },
  { code: '14.22-3', description: 'Fabricação de artigos do vestuário, produzidos em malharias e tricotagens, exceto meias', suggestedDivisions: ['I-2'], defaultFireLoad: 1000 },
  
  // MADEIRA
  { code: '16.10-2', description: 'Desdobramento de madeira', suggestedDivisions: ['I-3'], defaultFireLoad: 2000 },
  { code: '16.21-8', description: 'Fabricação de madeira laminada e de chapas de madeira compensada', suggestedDivisions: ['I-3'], defaultFireLoad: 2000 },
  { code: '16.22-6', description: 'Fabricação de estruturas de madeira e de artigos de carpintaria para construção', suggestedDivisions: ['I-3'], defaultFireLoad: 2000 },
  { code: '16.23-4', description: 'Fabricação de artefatos de tanoaria e de embalagens de madeira', suggestedDivisions: ['I-3'], defaultFireLoad: 1800 },
  { code: '16.29-3', description: 'Fabricação de artefatos de madeira, palha, cortiça, vime e material trançado', suggestedDivisions: ['I-3'], defaultFireLoad: 1800 },
  
  // PAPEL E CELULOSE
  { code: '17.10-9', description: 'Fabricação de celulose e outras pastas para a fabricação de papel', suggestedDivisions: ['I-3'], defaultFireLoad: 1500 },
  { code: '17.21-4', description: 'Fabricação de papel', suggestedDivisions: ['I-3'], defaultFireLoad: 1500 },
  { code: '17.22-2', description: 'Fabricação de cartolina e papel-cartão', suggestedDivisions: ['I-3'], defaultFireLoad: 1500 },
  { code: '17.31-1', description: 'Fabricação de embalagens de papel', suggestedDivisions: ['I-2'], defaultFireLoad: 1200 },
  { code: '17.32-0', description: 'Fabricação de embalagens de cartolina e papel-cartão', suggestedDivisions: ['I-2'], defaultFireLoad: 1200 },
  { code: '17.33-8', description: 'Fabricação de chapas e de embalagens de papelão ondulado', suggestedDivisions: ['I-2'], defaultFireLoad: 1200 },
  { code: '17.41-9', description: 'Fabricação de produtos de papel, cartolina, papel-cartão e papelão ondulado para uso industrial, comercial e de escritório', suggestedDivisions: ['I-2'], defaultFireLoad: 1000 },
  { code: '17.42-7', description: 'Fabricação de produtos de papel para usos doméstico e higiênico-sanitário', suggestedDivisions: ['I-2'], defaultFireLoad: 1000 },
  { code: '17.49-4', description: 'Fabricação de produtos de pastas celulósicas, papel, cartolina, papel-cartão e papelão ondulado não especificados anteriormente', suggestedDivisions: ['I-2'], defaultFireLoad: 1000 },
  
  // ATIVIDADES FINANCEIRAS
  { code: '64.10-7', description: 'Banco Central', suggestedDivisions: ['D-2'], defaultFireLoad: 300 },
  { code: '64.21-2', description: 'Bancos comerciais', suggestedDivisions: ['D-2'], defaultFireLoad: 300 },
  { code: '64.22-1', description: 'Bancos múltiplos, com carteira comercial', suggestedDivisions: ['D-2'], defaultFireLoad: 300 },
  { code: '64.23-9', description: 'Caixas econômicas', suggestedDivisions: ['D-2'], defaultFireLoad: 300 },
  { code: '64.24-7', description: 'Crédito cooperativo', suggestedDivisions: ['D-2'], defaultFireLoad: 300 },
  
  // SERVIÇOS PROFISSIONAIS
  { code: '69.11-7', description: 'Atividades jurídicas, exceto cartórios', suggestedDivisions: ['D-1'], defaultFireLoad: 700 },
  { code: '69.12-5', description: 'Cartórios', suggestedDivisions: ['D-1'], defaultFireLoad: 700 },
  { code: '69.20-6', description: 'Atividades de contabilidade, consultoria e auditoria contábil e tributária', suggestedDivisions: ['D-1'], defaultFireLoad: 700 },
  { code: '70.10-7', description: 'Sedes de empresas e unidades administrativas locais', suggestedDivisions: ['D-1'], defaultFireLoad: 700 },
  { code: '70.20-4', description: 'Atividades de consultoria em gestão empresarial', suggestedDivisions: ['D-1'], defaultFireLoad: 700 },
  { code: '71.11-1', description: 'Serviços de arquitetura', suggestedDivisions: ['D-1'], defaultFireLoad: 700 },
  { code: '71.12-0', description: 'Serviços de engenharia', suggestedDivisions: ['D-1'], defaultFireLoad: 700 },
  { code: '71.19-7', description: 'Atividades técnicas relacionadas à arquitetura e engenharia', suggestedDivisions: ['D-1'], defaultFireLoad: 700 },
  { code: '71.20-1', description: 'Testes e análises técnicas', suggestedDivisions: ['D-4'], defaultFireLoad: 500 },
  
  // CULTURA E LAZER
  { code: '59.14-6', description: 'Atividades de exibição cinematográfica', suggestedDivisions: ['F-5'], defaultFireLoad: 400 },
  { code: '90.01-9', description: 'Artes cênicas, espetáculos e atividades complementares', suggestedDivisions: ['F-5'], defaultFireLoad: 400 },
  { code: '90.02-7', description: 'Criação artística', suggestedDivisions: ['F-1'], defaultFireLoad: 500 },
  { code: '90.03-5', description: 'Gestão de espaços para artes cênicas, espetáculos e outras atividades artísticas', suggestedDivisions: ['F-5'], defaultFireLoad: 400 },
  { code: '91.01-5', description: 'Atividades de bibliotecas e arquivos', suggestedDivisions: ['F-1'], defaultFireLoad: 1000 },
  { code: '91.02-3', description: 'Atividades de museus e de exploração, restauração artística e conservação de lugares e prédios históricos e atrações similares', suggestedDivisions: ['F-1'], defaultFireLoad: 500 },
  { code: '91.03-1', description: 'Atividades de jardins botânicos, zoológicos, parques nacionais, reservas ecológicas e áreas de proteção ambiental', suggestedDivisions: ['F-9'], defaultFireLoad: 200 },
  { code: '93.11-5', description: 'Gestão de instalações de esportes', suggestedDivisions: ['F-3'], defaultFireLoad: 200 },
  { code: '93.12-3', description: 'Clubes sociais, esportivos e similares', suggestedDivisions: ['F-6'], defaultFireLoad: 400 },
  { code: '93.13-1', description: 'Atividades de condicionamento físico', suggestedDivisions: ['E-3'], defaultFireLoad: 200 },
  { code: '93.19-1', description: 'Atividades esportivas não especificadas', suggestedDivisions: ['E-3'], defaultFireLoad: 200 },
  { code: '93.21-2', description: 'Parques de diversão e parques temáticos', suggestedDivisions: ['F-9'], defaultFireLoad: 300 },
  { code: '93.29-8', description: 'Atividades de recreação e lazer não especificadas', suggestedDivisions: ['F-6', 'F-11'], defaultFireLoad: 400 },
  
  // DEPÓSITOS E ARMAZENAGEM
  { code: '52.11-7', description: 'Armazenamento', suggestedDivisions: ['J-2', 'J-3'], defaultFireLoad: 500 },
  { code: '52.12-5', description: 'Carga e descarga', suggestedDivisions: ['J-2'], defaultFireLoad: 300 },
  { code: '52.21-4', description: 'Concessionárias de rodovias, pontes, túneis e serviços relacionados', suggestedDivisions: ['F-4'], defaultFireLoad: 300 },
  { code: '52.22-2', description: 'Terminais rodoviários e ferroviários', suggestedDivisions: ['F-4'], defaultFireLoad: 300 },
  { code: '52.23-1', description: 'Estacionamento de veículos', suggestedDivisions: ['G-2'], defaultFireLoad: 200 },
  { code: '52.29-0', description: 'Atividades auxiliares dos transportes terrestres não especificadas', suggestedDivisions: ['F-4'], defaultFireLoad: 300 },
  { code: '52.31-1', description: 'Gestão de portos e terminais', suggestedDivisions: ['F-4'], defaultFireLoad: 400 },
  { code: '52.32-0', description: 'Atividades de agenciamento marítimo', suggestedDivisions: ['D-1'], defaultFireLoad: 300 },
  { code: '52.39-7', description: 'Atividades auxiliares dos transportes aquaviários não especificadas', suggestedDivisions: ['F-4'], defaultFireLoad: 300 },
  { code: '52.40-1', description: 'Atividades auxiliares dos transportes aéreos', suggestedDivisions: ['F-4', 'G-5'], defaultFireLoad: 500 },
  
  // AUTOMOTIVOS
  { code: '45.11-1', description: 'Comércio a varejo e por atacado de veículos automotores', suggestedDivisions: ['C-2', 'G-4'], defaultFireLoad: 500 },
  { code: '45.12-9', description: 'Representantes comerciais e agentes do comércio de veículos automotores', suggestedDivisions: ['D-1'], defaultFireLoad: 300 },
  { code: '45.20-0', description: 'Manutenção e reparação de veículos automotores', suggestedDivisions: ['G-4'], defaultFireLoad: 500 },
  { code: '45.30-7', description: 'Comércio de peças e acessórios para veículos automotores', suggestedDivisions: ['C-2'], defaultFireLoad: 600 },
  { code: '45.41-2', description: 'Comércio por atacado e a varejo de motocicletas, peças e acessórios', suggestedDivisions: ['C-2', 'G-4'], defaultFireLoad: 500 },
  { code: '45.42-1', description: 'Representantes comerciais e agentes do comércio de motocicletas e motonetas, peças e acessórios', suggestedDivisions: ['D-1'], defaultFireLoad: 300 },
  { code: '45.43-9', description: 'Manutenção e reparação de motocicletas e motonetas', suggestedDivisions: ['G-4'], defaultFireLoad: 500 },
  { code: '47.31-8', description: 'Comércio varejista de combustíveis para veículos automotores', suggestedDivisions: ['G-3'], defaultFireLoad: 800 },
  { code: '47.32-6', description: 'Comércio varejista de lubrificantes', suggestedDivisions: ['G-3', 'C-2'], defaultFireLoad: 700 },
];

// ============================================
// FUNÇÕES UTILITÁRIAS
// ============================================

/**
 * Busca CNAEs por código ou descrição
 */
export function searchCNAE(query: string): CNAEMapping[] {
  const normalizedQuery = query.toLowerCase().replace(/[.-]/g, '');
  return CNAE_MAPPING.filter(cnae => 
    cnae.code.replace(/[.-]/g, '').includes(normalizedQuery) ||
    cnae.description.toLowerCase().includes(normalizedQuery)
  );
}

/**
 * Obtém CNAE por código exato
 */
export function getCNAEByCode(code: string): CNAEMapping | undefined {
  const normalizedCode = code.replace(/[.-]/g, '');
  return CNAE_MAPPING.find(cnae => 
    cnae.code.replace(/[.-]/g, '') === normalizedCode
  );
}

/**
 * Obtém parâmetros de população para uma divisão
 */
export function getPopulationParams(divisionCode: string): PopulationParams | undefined {
  return POPULATION_PARAMS[divisionCode];
}

/**
 * Obtém carga de incêndio típica para uma ocupação
 */
export function getTypicalFireLoad(occupancyCode: string): number {
  const data = FIRE_LOAD_BY_OCCUPANCY.find(f => f.occupancyCode === occupancyCode);
  return data?.fireLoadMJm2 ?? 500; // default 500 MJ/m²
}

/**
 * Calcula população baseado na divisão e área
 */
export function calculatePopulation(divisionCode: string, areaM2: number): number {
  const params = POPULATION_PARAMS[divisionCode];
  if (!params) return Math.ceil(areaM2 / 10); // fallback: 1 pessoa/10m²
  
  if (params.method === 'area') {
    if (params.personsPerM2) {
      return Math.ceil(areaM2 * params.personsPerM2);
    }
    if (params.factorM2PerPerson) {
      return Math.ceil(areaM2 / params.factorM2PerPerson);
    }
  }
  
  // Para métodos 'fixed', 'seats', 'beds' - retorna estimativa baseada na área
  return Math.ceil(areaM2 / 10);
}
