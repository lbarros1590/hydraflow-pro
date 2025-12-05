/**
 * NTCB 09/2020 - Gerador de Relatório PDF
 * Conforme Anexo G.4 da NTCB 01/2025
 */

import type { SeparationCalculationResult, SingleScenarioResult } from './types';

/**
 * Gera o HTML da tabela de cálculo conforme o modelo do Anexo G.4
 */
function generateScenarioTableHTML(scenario: SingleScenarioResult): string {
  const reducerText = scenario.reducers.length > 0
    ? scenario.reducers.map(r => r.description).join('; ')
    : '-------';
  
  const advantageText = scenario.reducers.length > 0
    ? scenario.reducers.map(r => `${r.reductionPercent.toFixed(0)}%`).join(', ')
    : '-------';

  return `
    <div class="calculation-table">
      <div class="table-header">
        <strong>3.1 CÁLCULO DE SEPARAÇÃO</strong>
        <span>(NTCB 09/2020)</span>
      </div>
      
      <table class="main-table">
        <tr class="buildings-row">
          <td class="building-cell">
            <span class="label">EDIFICAÇÃO EXPOSITORA:</span>
            <span class="value">${scenario.expositoraName}</span>
          </td>
          <td class="building-cell">
            <span class="label">EDIFICAÇÃO EM EXPOSIÇÃO:</span>
            <span class="value">${scenario.emExposicaoName}</span>
          </td>
        </tr>
      </table>
      
      <table class="data-table">
        <tr>
          <td>
            <span class="label">Severidade da carga de incêndio<br/>- y</span>
          </td>
          <td>
            <span class="label">Largura<br/>(Fachada)</span>
          </td>
          <td>
            <span class="label">Altura<br/>(Fachada)</span>
          </td>
          <td>
            <span class="label">Relação largura/altura ou<br/>altura/largura (fachada) - X</span>
          </td>
          <td colspan="2">
            <span class="label">Coeficientes</span>
          </td>
        </tr>
        <tr class="values-row">
          <td class="center"><strong>${scenario.severity}</strong></td>
          <td class="center">${scenario.facadeWidth.toFixed(2)} m</td>
          <td class="center">${scenario.facadeHeight.toFixed(2)} m</td>
          <td class="center">${scenario.relationCalculated.toFixed(2)}( Adotado ${scenario.relationAdopted})</td>
          <td class="center"><strong>a</strong><br/>${scenario.coefficientA.toFixed(2)}</td>
          <td class="center"><strong>b</strong><br/>${scenario.coefficientB} m</td>
        </tr>
      </table>
      
      <table class="formula-table">
        <tr>
          <td class="label-cell">Porcentagem de aberturas</td>
          <td class="formula-cell">
            <span class="label">Distância de separação - a x (largura ou altura) + b</span>
          </td>
        </tr>
        <tr>
          <td class="value-cell"><strong>${scenario.openingPercentage}%</strong></td>
          <td class="value-cell"><strong>${scenario.coefficientA.toFixed(2)}*${scenario.dimensionValue.toFixed(2)}+${scenario.coefficientB}</strong></td>
        </tr>
      </table>
      
      <table class="reducer-table">
        <tr>
          <td class="label-cell">
            <span class="label">Redutor de distância de separação de acordo com a Tabela B-1</span><br/>
            <span class="sub-label">(Tipo de proteção)</span>
          </td>
          <td class="value-cell">
            <span class="label">Vantagens</span>
          </td>
        </tr>
        <tr>
          <td class="reducer-value">${reducerText}</td>
          <td class="advantage-value">${advantageText}</td>
        </tr>
      </table>
      
      <table class="result-table">
        <tr class="total-row">
          <td colspan="2">
            <strong>DISTÂNCIA TOTAL</strong> = Distância de separação (D) subtraída da vantagem
          </td>
        </tr>
        <tr>
          <td colspan="2" class="total-value">
            <strong>${scenario.finalDistance.toFixed(2)}</strong>
          </td>
        </tr>
        <tr>
          <td colspan="2" class="existing-label">
            Distância (prevista / existente)
          </td>
        </tr>
        <tr>
          <td colspan="2" class="existing-value">
            <strong>${scenario.existingDistance.toFixed(2)}</strong>
          </td>
        </tr>
      </table>
    </div>
  `;
}

/**
 * Gera o CSS para o relatório
 */
function generateReportCSS(): string {
  return `
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: Arial, Helvetica, sans-serif;
        font-size: 10pt;
        line-height: 1.4;
        color: #000;
        padding: 20px;
      }
      
      .report-header {
        text-align: center;
        margin-bottom: 20px;
        border-bottom: 2px solid #000;
        padding-bottom: 10px;
      }
      
      .report-header h1 {
        font-size: 14pt;
        margin-bottom: 5px;
      }
      
      .report-header h2 {
        font-size: 12pt;
        font-weight: normal;
      }
      
      .calculation-table {
        border: 1px solid #000;
        margin-bottom: 20px;
        page-break-inside: avoid;
      }
      
      .table-header {
        background-color: #f0f0f0;
        padding: 8px;
        text-align: center;
        border-bottom: 1px solid #000;
      }
      
      .table-header strong {
        font-size: 11pt;
      }
      
      .main-table, .data-table, .formula-table, .reducer-table, .result-table {
        width: 100%;
        border-collapse: collapse;
      }
      
      .main-table td, .data-table td, .formula-table td, .reducer-table td, .result-table td {
        border: 1px solid #000;
        padding: 6px 8px;
        vertical-align: middle;
      }
      
      .buildings-row td {
        width: 50%;
      }
      
      .building-cell .label {
        display: block;
        font-size: 8pt;
        color: #666;
      }
      
      .building-cell .value {
        display: block;
        font-weight: bold;
        font-size: 10pt;
      }
      
      .data-table .label {
        font-size: 8pt;
        color: #333;
      }
      
      .data-table .values-row td {
        text-align: center;
        font-size: 10pt;
      }
      
      .center {
        text-align: center;
      }
      
      .formula-table .label-cell,
      .reducer-table .label-cell {
        width: 40%;
      }
      
      .formula-table .label {
        font-size: 8pt;
        color: #333;
      }
      
      .formula-table .value-cell,
      .reducer-table .value-cell {
        font-weight: bold;
      }
      
      .reducer-table .sub-label {
        font-size: 7pt;
        color: #666;
      }
      
      .reducer-table .reducer-value,
      .reducer-table .advantage-value {
        font-size: 9pt;
      }
      
      .result-table .total-row td {
        background-color: #f5f5f5;
        font-size: 9pt;
      }
      
      .result-table .total-value {
        text-align: center;
        font-size: 16pt;
        padding: 10px;
        background-color: #e8f5e9;
      }
      
      .result-table .existing-label {
        font-size: 8pt;
        color: #666;
      }
      
      .result-table .existing-value {
        text-align: center;
        font-size: 12pt;
        padding: 8px;
      }
      
      .summary-section {
        margin-top: 20px;
        padding: 15px;
        border: 2px solid #000;
        background-color: #fff;
      }
      
      .summary-section h3 {
        font-size: 12pt;
        margin-bottom: 10px;
        border-bottom: 1px solid #000;
        padding-bottom: 5px;
      }
      
      .summary-item {
        margin: 8px 0;
        padding: 5px;
      }
      
      .compliant {
        color: #2e7d32;
        background-color: #e8f5e9;
        padding: 10px;
        border: 1px solid #2e7d32;
        text-align: center;
        font-weight: bold;
      }
      
      .non-compliant {
        color: #c62828;
        background-color: #ffebee;
        padding: 10px;
        border: 1px solid #c62828;
        text-align: center;
        font-weight: bold;
      }
      
      .notes-section {
        margin-top: 20px;
        padding: 10px;
        border: 1px solid #ccc;
        background-color: #fafafa;
      }
      
      .notes-section h4 {
        font-size: 10pt;
        margin-bottom: 8px;
      }
      
      .notes-section ul {
        margin-left: 20px;
        font-size: 9pt;
      }
      
      .signature-section {
        margin-top: 40px;
        display: flex;
        justify-content: space-between;
      }
      
      .signature-block {
        width: 45%;
        text-align: center;
        padding-top: 30px;
        border-top: 1px solid #000;
      }
      
      .signature-block .name {
        font-weight: bold;
      }
      
      .signature-block .title {
        font-size: 9pt;
        color: #666;
      }
      
      @media print {
        body {
          padding: 0;
        }
        
        .calculation-table {
          page-break-inside: avoid;
        }
      }
    </style>
  `;
}

/**
 * Gera o HTML completo do relatório
 */
export function generateReportHTML(result: SeparationCalculationResult): string {
  const scenario1HTML = generateScenarioTableHTML(result.scenario1);
  const scenario2HTML = generateScenarioTableHTML(result.scenario2);
  
  const complianceClass = result.isCompliant ? 'compliant' : 'non-compliant';
  const complianceText = result.isCompliant 
    ? '✓ ATENDE À NORMA NTCB 09/2020' 
    : '✗ NÃO ATENDE À NORMA NTCB 09/2020';
  
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Cálculo de Separação - NTCB 09/2020</title>
      ${generateReportCSS()}
    </head>
    <body>
      <div class="report-header">
        <h1>CORPO DE BOMBEIROS MILITAR DO ESTADO DE MATO GROSSO</h1>
        <h2>Cálculo de Separação entre Edificações - NTCB 09/2020</h2>
        <p>Anexo G.4 - NTCB 01/2025</p>
      </div>
      
      <h3 style="margin-bottom: 15px;">3. ISOLAMENTO DE RISCO</h3>
      <p style="margin-bottom: 15px; font-size: 9pt;">
        Esta medida de segurança foi dimensionada atendendo à NTCB 09 do Corpo de Bombeiros Militar de Mato Grosso.
        Conforme a norma, são apresentados dois cenários de cálculo: EXPOSITORA × EM EXPOSIÇÃO e EM EXPOSIÇÃO × EXPOSITORA.
      </p>
      
      <!-- Cenário 1 -->
      ${scenario1HTML}
      
      <!-- Cenário 2 -->
      ${scenario2HTML}
      
      <!-- Resumo -->
      <div class="summary-section">
        <h3>RESULTADO FINAL</h3>
        
        <div class="summary-item">
          <strong>Distância mínima de separação exigida:</strong> ${result.minimumDistance.toFixed(2)} m
        </div>
        
        <div class="summary-item">
          <strong>Distância existente/prevista:</strong> ${result.existingDistance.toFixed(2)} m
        </div>
        
        <div class="summary-item">
          <strong>Ponto mais desfavorável:</strong> 
          ${result.mostUnfavorablePoint === 'scenario1' 
            ? `${result.scenario1.expositoraName} → ${result.scenario1.emExposicaoName}` 
            : `${result.scenario2.expositoraName} → ${result.scenario2.emExposicaoName}`}
          (${result.mostUnfavorablePoint === 'scenario1' ? result.scenario1.finalDistance : result.scenario2.finalDistance} m)
        </div>
        
        <div class="summary-item">
          <strong>Ponto mais favorável:</strong>
          ${result.mostFavorablePoint === 'scenario1' 
            ? `${result.scenario1.expositoraName} → ${result.scenario1.emExposicaoName}` 
            : `${result.scenario2.expositoraName} → ${result.scenario2.emExposicaoName}`}
          (${result.mostFavorablePoint === 'scenario1' ? result.scenario1.finalDistance : result.scenario2.finalDistance} m)
        </div>
        
        <div class="${complianceClass}" style="margin-top: 15px;">
          ${complianceText}
        </div>
      </div>
      
      <!-- Notas -->
      ${result.notes.length > 0 || result.warnings.length > 0 ? `
        <div class="notes-section">
          <h4>Observações Técnicas</h4>
          <ul>
            ${result.notes.map(note => `<li>${note}</li>`).join('')}
            ${result.warnings.map(warning => `<li style="color: #c62828;">${warning}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      
      <!-- Assinaturas -->
      <div class="signature-section">
        <div class="signature-block">
          <div class="name">_________________________________</div>
          <div class="title">Responsável Técnico</div>
          <div class="title">CREA/CAU: _______________</div>
        </div>
        <div class="signature-block">
          <div class="name">_________________________________</div>
          <div class="title">ART/RRT nº</div>
        </div>
      </div>
      
      <div style="margin-top: 30px; font-size: 8pt; color: #666; text-align: center;">
        Documento gerado automaticamente pelo sistema Hydraflow Pro<br/>
        Data: ${new Date().toLocaleDateString('pt-BR')} - ${new Date().toLocaleTimeString('pt-BR')}
      </div>
    </body>
    </html>
  `;
}

/**
 * Abre o relatório em uma nova janela para impressão/PDF
 */
export function openReportForPrint(result: SeparationCalculationResult): void {
  const html = generateReportHTML(result);
  const printWindow = window.open('', '_blank');
  
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    
    // Aguardar carregamento e abrir diálogo de impressão
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };
  }
}

/**
 * Baixa o relatório como HTML (pode ser convertido para PDF pelo navegador)
 */
export function downloadReportHTML(result: SeparationCalculationResult, filename?: string): void {
  const html = generateReportHTML(result);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `calculo_separacao_${Date.now()}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
