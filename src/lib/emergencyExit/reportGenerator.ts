/**
 * NTCB 13/2020 - Gerador de Relatório PDF
 * Conforme Anexo G Item 6.3 da NTCB 01/2025
 */

import type { BuildingCalculationResult, SectorCalculationResult } from './types';
import { formatDoorsDisplay } from './calculator';

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
        font-size: 9pt;
        line-height: 1.3;
        color: #000;
        padding: 15px;
      }
      
      .report-header {
        text-align: center;
        margin-bottom: 15px;
        border-bottom: 2px solid #000;
        padding-bottom: 8px;
      }
      
      .report-header h1 {
        font-size: 12pt;
        margin-bottom: 3px;
      }
      
      .report-header h2 {
        font-size: 10pt;
        font-weight: normal;
      }
      
      .section-title {
        font-size: 10pt;
        font-weight: bold;
        margin: 15px 0 8px 0;
        padding: 5px;
        background-color: #f0f0f0;
        border: 1px solid #000;
      }
      
      .sector-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 15px;
        page-break-inside: avoid;
      }
      
      .sector-table th,
      .sector-table td {
        border: 1px solid #000;
        padding: 4px 6px;
        vertical-align: middle;
        text-align: center;
      }
      
      .sector-table th {
        background-color: #e8e8e8;
        font-weight: bold;
        font-size: 8pt;
      }
      
      .sector-header {
        background-color: #d0d0d0;
        font-weight: bold;
        text-align: center;
        font-size: 10pt;
      }
      
      .sector-subheader {
        background-color: #e8e8e8;
        font-size: 9pt;
      }
      
      .data-cell {
        font-size: 9pt;
      }
      
      .data-cell.number {
        font-family: 'Courier New', monospace;
      }
      
      .metragem-header {
        font-size: 8pt;
      }
      
      .metragem-subheader th {
        font-size: 7pt;
        font-weight: normal;
      }
      
      .door-list {
        font-size: 8pt;
        text-align: left;
        white-space: pre-line;
      }
      
      .summary-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 15px;
      }
      
      .summary-table th,
      .summary-table td {
        border: 1px solid #000;
        padding: 5px 8px;
      }
      
      .summary-table th {
        background-color: #e8e8e8;
        text-align: left;
      }
      
      .compliant {
        color: #006600;
        font-weight: bold;
      }
      
      .non-compliant {
        color: #cc0000;
        font-weight: bold;
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
      
      @media print {
        body {
          padding: 0;
        }
        
        .sector-table {
          page-break-inside: avoid;
        }
      }
    </style>
  `;
}

/**
 * Gera a tabela de um setor no formato do Anexo G Item 6.3
 */
function generateSectorTableHTML(sector: SectorCalculationResult): string {
  const doorsDisplay = formatDoorsDisplay(sector.doors);
  
  return `
    <table class="sector-table">
      <tr>
        <td colspan="5" class="sector-header">${sector.sectorName}</td>
      </tr>
      <tr>
        <td colspan="5" class="sector-subheader">
          ${sector.floorName}–${sector.occupancyDescription} Divisão ${sector.occupancyCode}- ${sector.densityDescription}
        </td>
      </tr>
      <tr>
        <th rowspan="2">Área computada (m²)</th>
        <th rowspan="2">População</th>
        <th rowspan="2">Capacidade da unidade de passagem – C</th>
        <th colspan="2" class="metragem-header">Metragem das saídas</th>
      </tr>
      <tr class="metragem-subheader">
        <th>Exigido</th>
        <th>Existente</th>
      </tr>
      <tr>
        <td class="data-cell number">${sector.area.toFixed(2).replace('.', ',')}</td>
        <td class="data-cell number">${sector.population}</td>
        <td class="data-cell number">${sector.capacityPerUP}</td>
        <td class="data-cell number">${sector.widthRequired.toFixed(2).replace('.', ',')}</td>
        <td class="data-cell door-list">${doorsDisplay}</td>
      </tr>
    </table>
  `;
}

/**
 * Gera o HTML completo do relatório de saídas de emergência
 */
export function generateEmergencyExitReportHTML(
  result: BuildingCalculationResult,
  projectName?: string
): string {
  const sectorsHTML = result.sectors.map(generateSectorTableHTML).join('');
  
  const complianceClass = result.isCompliant ? 'compliant' : 'non-compliant';
  const complianceText = result.isCompliant ? 'ATENDE' : 'NÃO ATENDE';
  
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Saídas de Emergência - NTCB 13/2020</title>
      ${generateReportCSS()}
    </head>
    <body>
      <div class="report-header">
        <h1>CORPO DE BOMBEIROS MILITAR DO ESTADO DE MATO GROSSO</h1>
        <h2>Dimensionamento de Saídas de Emergência - NTCB 13/2020</h2>
        <p>Anexo G - Item 6.3 - NTCB 01/2025</p>
        ${projectName ? `<p><strong>Projeto:</strong> ${projectName}</p>` : ''}
      </div>
      
      <div class="section-title">6.3 SAÍDAS DE EMERGÊNCIA</div>
      <p style="margin-bottom: 10px; font-size: 9pt;">
        Esta medida de segurança foi dimensionada atendendo à NTCB 13 do Corpo de Bombeiros Militar de Mato Grosso.
        A capacidade por unidade de passagem (C) é de 100 pessoas/UP para portas.
      </p>
      
      <p style="margin-bottom: 15px; font-size: 9pt;">
        <strong>Edificação:</strong> ${result.buildingName}
      </p>
      
      <!-- Tabelas por setor -->
      ${sectorsHTML}
      
      <!-- Resumo -->
      <table class="summary-table">
        <tr>
          <th colspan="2" style="text-align: center; background-color: #d0d0d0;">RESUMO DA EDIFICAÇÃO</th>
        </tr>
        <tr>
          <th>Área total computada</th>
          <td>${result.totalArea.toFixed(2).replace('.', ',')} m²</td>
        </tr>
        <tr>
          <th>População total</th>
          <td>${result.totalPopulation} pessoas</td>
        </tr>
        <tr>
          <th>UPs totais necessárias</th>
          <td>${result.totalUpRequired} UP</td>
        </tr>
        <tr>
          <th>Largura total exigida</th>
          <td>${result.totalWidthRequired.toFixed(2).replace('.', ',')} m</td>
        </tr>
        <tr>
          <th>Largura total existente</th>
          <td>${result.totalWidthExisting.toFixed(2).replace('.', ',')} m</td>
        </tr>
        <tr>
          <th>Situação</th>
          <td class="${complianceClass}">${complianceText}</td>
        </tr>
      </table>
      
      ${result.warnings.length > 0 ? `
        <div style="margin-top: 15px; padding: 10px; border: 1px solid #cc0000; background-color: #fff0f0;">
          <strong>Alertas:</strong>
          <ul style="margin-left: 20px; font-size: 9pt;">
            ${result.warnings.map(w => `<li>${w}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      
      <!-- Assinaturas -->
      <div class="signature-section">
        <div class="signature-block">
          <div>_________________________________</div>
          <div style="font-size: 9pt;">Responsável Técnico</div>
          <div style="font-size: 8pt;">CREA/CAU: _______________</div>
        </div>
        <div class="signature-block">
          <div>_________________________________</div>
          <div style="font-size: 9pt;">ART/RRT nº</div>
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
export function openEmergencyExitReportForPrint(
  result: BuildingCalculationResult,
  projectName?: string
): void {
  const html = generateEmergencyExitReportHTML(result, projectName);
  const printWindow = window.open('', '_blank');
  
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };
  }
}

/**
 * Baixa o relatório como HTML
 */
export function downloadEmergencyExitReportHTML(
  result: BuildingCalculationResult,
  projectName?: string,
  filename?: string
): void {
  const html = generateEmergencyExitReportHTML(result, projectName);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `saidas_emergencia_${Date.now()}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
