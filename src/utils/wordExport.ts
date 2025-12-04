/**
 * Exportação de Relatório em Word - NTCB 19/2020
 * Inclui fórmulas, memorial detalhado e Tabela 6.7
 */

import {
  Document,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
  WidthType,
  PageBreak,
  convertInchesToTwip
} from 'docx';
import { saveAs } from 'file-saver';
import { Packer } from 'docx';
import type { Node, Pipe, SystemResult, PipeAccessory } from '@/models/types';
import { ACCESSORY_TYPES, type AccessoryType } from '@/core/equivalentLength';
import { m_to_mm } from '@/core/units';

interface ReportData {
  result: SystemResult;
  nodes: Node[];
  pipes: Pipe[];
}

// Bordas padrão para tabelas
const tableBorders = {
  top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  right: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
};

// Células de cabeçalho
function headerCell(text: string, width?: number): TableCell {
  return new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text, bold: true, size: 20 })],
      alignment: AlignmentType.CENTER
    })],
    shading: { fill: 'D9D9D9' },
    borders: tableBorders,
    width: width ? { size: width, type: WidthType.DXA } : undefined
  });
}

// Células normais
function cell(text: string, alignment: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.CENTER): TableCell {
  return new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text, size: 20 })],
      alignment
    })],
    borders: tableBorders
  });
}

export async function generateWordReport(data: ReportData): Promise<void> {
  const { result, nodes, pipes } = data;

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // Título
        new Paragraph({
          text: 'MEMORIAL DE CÁLCULO - SISTEMA DE HIDRANTES',
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 }
        }),
        new Paragraph({
          children: [new TextRun({ text: 'NTCB 19/2020 - Corpo de Bombeiros Militar do Estado de Mato Grosso', italics: true })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        }),

        // 1. Enquadramento
        new Paragraph({
          text: '1. ENQUADRAMENTO NORMATIVO',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 }
        }),
        createEnquadramentoTable(result),

        // 2. Fórmulas
        new Paragraph({
          text: '2. FÓRMULAS UTILIZADAS',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 100 }
        }),
        ...createFormulasSection(),

        // 3. Memorial de Cálculo
        new Paragraph({
          text: '3. MEMORIAL DE CÁLCULO - TRECHOS',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 100 }
        }),
        createMemorialTable(result, nodes, pipes),

        // 4. Detalhamento de Acessórios
        new Paragraph({
          text: '4. DETALHAMENTO DE ACESSÓRIOS POR TRECHO',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 100 }
        }),
        ...createAccessoriesSection(pipes),

        // 5. Análise de Hidrantes
        new Paragraph({
          text: '5. ANÁLISE DE HIDRANTES',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 100 }
        }),
        createHydrantsTable(result, nodes),

        // 6. Bomba
        new Paragraph({
          text: '6. BOMBA DE INCÊNDIO',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 100 }
        }),
        createPumpTable(result),

        // 7. Tabela 6.7 - Dimensionamento
        new Paragraph({ children: [new PageBreak()] }),
        new Paragraph({
          text: 'TABELA 6.7 - DIMENSIONAMENTO DO SISTEMA',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 }
        }),
        createTable67(result, nodes, pipes),

        // Rodapé
        new Paragraph({
          children: [new TextRun({ text: `Relatório gerado em: ${new Date().toLocaleString('pt-BR')}`, size: 18, italics: true })],
          spacing: { before: 400 },
          alignment: AlignmentType.RIGHT
        })
      ]
    }]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `memorial_hidraulico_${new Date().toISOString().slice(0, 10)}.docx`);
}

function createEnquadramentoTable(result: SystemResult): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell('Parâmetro', 4000), headerCell('Valor', 3000), headerCell('Unidade', 2000)] }),
      new TableRow({ children: [cell('Tipo de Sistema', AlignmentType.LEFT), cell(result.config.ntcbSystemType || '-'), cell('-')] }),
      new TableRow({ children: [cell('Vazão por Hidrante', AlignmentType.LEFT), cell(result.config.demandConfig.flowPerHydrant.toFixed(0)), cell('L/min')] }),
      new TableRow({ children: [cell('Hidrantes Simultâneos', AlignmentType.LEFT), cell(result.config.demandConfig.simultaneousHydrants.toString()), cell('un')] }),
      new TableRow({ children: [cell('Vazão Total', AlignmentType.LEFT), cell(result.config.demandConfig.totalFlow.toFixed(0)), cell('L/min')] }),
      new TableRow({ children: [cell('Pressão Mín. Esguicho', AlignmentType.LEFT), cell(result.config.demandConfig.minNozzlePressure.toFixed(0)), cell('mca')] }),
      new TableRow({ children: [cell('Comprimento Mangueira', AlignmentType.LEFT), cell(result.config.demandConfig.hoseLength.toString()), cell('m')] }),
      new TableRow({ children: [cell('Diâmetro Mangueira', AlignmentType.LEFT), cell(result.config.demandConfig.hoseDiameter.toString()), cell('mm')] }),
      new TableRow({ children: [cell('RTI', AlignmentType.LEFT), cell(result.reserve.volumeM3.toFixed(1)), cell('m³')] }),
    ]
  });
}

function createFormulasSection(): Paragraph[] {
  return [
    new Paragraph({
      children: [new TextRun({ text: 'Perda de Carga - Hazen-Williams:', bold: true })],
      spacing: { before: 100 }
    }),
    new Paragraph({
      children: [new TextRun({ text: 'J = 10,643 × Q^1,852 × C^(-1,852) × D^(-4,87)  [m/m]', font: 'Courier New', size: 20 })],
      indent: { left: convertInchesToTwip(0.5) }
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Onde: Q = vazão (m³/s), C = coef. rugosidade, D = diâmetro (m)', size: 18, italics: true })],
      indent: { left: convertInchesToTwip(0.5) }
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Perda Total no Trecho:', bold: true })],
      spacing: { before: 200 }
    }),
    new Paragraph({
      children: [new TextRun({ text: 'ΔH = J × (L + Leq)  [mca]', font: 'Courier New', size: 20 })],
      indent: { left: convertInchesToTwip(0.5) }
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Onde: L = comprimento real (m), Leq = comprimento equivalente (m)', size: 18, italics: true })],
      indent: { left: convertInchesToTwip(0.5) }
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Pressão Final:', bold: true })],
      spacing: { before: 200 }
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Pf = Pi - ΔH - (Zf - Zi)  [mca]', font: 'Courier New', size: 20 })],
      indent: { left: convertInchesToTwip(0.5) }
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Onde: Pi = pressão inicial, Zf/Zi = elevações dos nós', size: 18, italics: true })],
      indent: { left: convertInchesToTwip(0.5) }
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Velocidade:', bold: true })],
      spacing: { before: 200 }
    }),
    new Paragraph({
      children: [new TextRun({ text: 'V = Q / A = 4Q / (π × D²)  [m/s]', font: 'Courier New', size: 20 })],
      indent: { left: convertInchesToTwip(0.5) }
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Potência da Bomba:', bold: true })],
      spacing: { before: 200 }
    }),
    new Paragraph({
      children: [new TextRun({ text: 'P = (γ × Q × H) / (75 × η)  [CV]', font: 'Courier New', size: 20 })],
      indent: { left: convertInchesToTwip(0.5) }
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Onde: γ = 1000 kgf/m³, η = rendimento', size: 18, italics: true })],
      indent: { left: convertInchesToTwip(0.5) },
      spacing: { after: 200 }
    }),
  ];
}

function createMemorialTable(result: SystemResult, nodes: Node[], pipes: Pipe[]): Table {
  const rows: TableRow[] = [
    new TableRow({
      children: [
        headerCell('Trecho'),
        headerCell('Nó Início'),
        headerCell('Zi (m)'),
        headerCell('Nó Fim'),
        headerCell('Zf (m)'),
        headerCell('Q (L/min)'),
        headerCell('V (m/s)'),
        headerCell('L (m)'),
        headerCell('Leq (m)'),
        headerCell('J (m/m)'),
        headerCell('ΔH (mca)'),
        headerCell('Pi (mca)'),
        headerCell('Pf (mca)')
      ]
    })
  ];

  for (const detail of result.hydraulics.pipeDetails) {
    const pipe = pipes.find(p => p.id === detail.pipeId);
    if (!pipe) continue;
    
    const startNode = nodes.find(n => n.id === pipe.startNodeId);
    const endNode = nodes.find(n => n.id === pipe.endNodeId);
    const totalLength = pipe.length + (pipe.equivalentLength || 0);
    const headLossFromJ = detail.headLossUnit * totalLength;

    rows.push(new TableRow({
      children: [
        cell(pipe.name || pipe.id),
        cell(startNode?.name || pipe.startNodeId),
        cell(startNode?.elevation.toFixed(2) || '0'),
        cell(endNode?.name || pipe.endNodeId),
        cell(endNode?.elevation.toFixed(2) || '0'),
        cell(detail.flowLmin.toFixed(1)),
        cell(detail.velocity.toFixed(2)),
        cell(pipe.length.toFixed(1)),
        cell((pipe.equivalentLength || 0).toFixed(1)),
        cell(detail.headLossUnit.toFixed(5)),
        cell(detail.headLossTotal.toFixed(2)),
        cell(detail.startPressure.toFixed(2)),
        cell(detail.endPressure.toFixed(2))
      ]
    }));
  }

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows
  });
}

function createAccessoriesSection(pipes: Pipe[]): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  for (const pipe of pipes) {
    if (!pipe.accessories || pipe.accessories.length === 0) continue;

    elements.push(new Paragraph({
      children: [new TextRun({ text: `Trecho: ${pipe.name || pipe.id} (Ø${Math.round(m_to_mm(pipe.diameter))}mm - ${pipe.material})`, bold: true })],
      spacing: { before: 200, after: 50 }
    }));

    const rows: TableRow[] = [
      new TableRow({
        children: [
          headerCell('Conexão/Acessório'),
          headerCell('Qtd'),
          headerCell('Leq Unit. (m)'),
          headerCell('Leq Total (m)')
        ]
      })
    ];

    let totalLeq = 0;
    for (const acc of pipe.accessories) {
      const accName = ACCESSORY_TYPES[acc.type as AccessoryType] || acc.type;
      rows.push(new TableRow({
        children: [
          cell(accName, AlignmentType.LEFT),
          cell(acc.quantity.toString()),
          cell(acc.equivalentLengthUnit.toFixed(2)),
          cell(acc.equivalentLengthTotal.toFixed(2))
        ]
      }));
      totalLeq += acc.equivalentLengthTotal;
    }

    rows.push(new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'TOTAL', bold: true, size: 20 })], alignment: AlignmentType.RIGHT })],
          columnSpan: 3,
          borders: tableBorders,
          shading: { fill: 'E6E6E6' }
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: totalLeq.toFixed(2), bold: true, size: 20 })], alignment: AlignmentType.CENTER })],
          borders: tableBorders,
          shading: { fill: 'E6E6E6' }
        })
      ]
    }));

    elements.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows
    }));
  }

  if (elements.length === 0) {
    elements.push(new Paragraph({
      children: [new TextRun({ text: 'Nenhum acessório cadastrado nos trechos.', italics: true })],
      spacing: { before: 100 }
    }));
  }

  return elements;
}

function createHydrantsTable(result: SystemResult, nodes: Node[]): Table {
  const rows: TableRow[] = [
    new TableRow({
      children: [
        headerCell('Hidrante'),
        headerCell('Tipo'),
        headerCell('P. Válvula (mca)'),
        headerCell('P. Esguicho (mca)'),
        headerCell('Status')
      ]
    })
  ];

  // Mais desfavoráveis
  for (const h of result.hydrants.mostUnfavorable) {
    const node = nodes.find(n => n.id === h.id);
    const isOk = h.nozzlePressure >= result.config.demandConfig.minNozzlePressure;
    rows.push(new TableRow({
      children: [
        cell(node?.name || h.id, AlignmentType.LEFT),
        cell('Desfavorável'),
        cell(h.pressure.toFixed(2)),
        cell(h.nozzlePressure.toFixed(2)),
        new TableCell({
          children: [new Paragraph({
            children: [new TextRun({ text: isOk ? 'OK' : 'FALHA', bold: true, color: isOk ? '008000' : 'FF0000', size: 20 })],
            alignment: AlignmentType.CENTER
          })],
          borders: tableBorders
        })
      ]
    }));
  }

  // Mais favorável
  if (result.hydrants.mostFavorable) {
    const node = nodes.find(n => n.id === result.hydrants.mostFavorable!.id);
    rows.push(new TableRow({
      children: [
        cell(node?.name || result.hydrants.mostFavorable.id, AlignmentType.LEFT),
        cell('Favorável'),
        cell(result.hydrants.mostFavorable.pressure.toFixed(2)),
        cell(result.hydrants.mostFavorable.nozzlePressure.toFixed(2)),
        new TableCell({
          children: [new Paragraph({
            children: [new TextRun({ text: 'OK', bold: true, color: '008000', size: 20 })],
            alignment: AlignmentType.CENTER
          })],
          borders: tableBorders
        })
      ]
    }));
  }

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows
  });
}

function createPumpTable(result: SystemResult): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell('Parâmetro', 5000), headerCell('Valor', 3000), headerCell('Unidade', 2000)] }),
      new TableRow({ children: [cell('Altura Manométrica Total', AlignmentType.LEFT), cell(result.pump.minPressure.toFixed(2)), cell('mca')] }),
      new TableRow({ children: [cell('Vazão Total', AlignmentType.LEFT), cell(result.pump.totalFlowLmin.toFixed(1)), cell('L/min')] }),
      new TableRow({ children: [cell('Potência Hidráulica', AlignmentType.LEFT), cell(result.pump.hydraulicPower.toFixed(2)), cell('kW')] }),
      new TableRow({ children: [cell('Potência Motor', AlignmentType.LEFT), cell(result.pump.motorPower.toFixed(2)), cell('kW')] }),
      new TableRow({ children: [cell('Potência Comercial', AlignmentType.LEFT), cell(result.pump.commercialPowerCV.toString()), cell('CV')] }),
      new TableRow({ children: [cell('Rendimento', AlignmentType.LEFT), cell((result.pump.efficiency * 100).toFixed(0)), cell('%')] }),
    ]
  });
}

// Tabela 6.7 conforme NTCB - Dimensionamento do Sistema
function createTable67(result: SystemResult, nodes: Node[], pipes: Pipe[]): Table {
  const rows: TableRow[] = [
    // Cabeçalho
    new TableRow({
      children: [
        headerCell('TRECHO'),
        headerCell('Q (L/min)'),
        headerCell('Ø (mm)'),
        headerCell('V (m/s)'),
        headerCell('J (m/m)'),
        headerCell('L (m)'),
        headerCell('Leq (m)'),
        headerCell('L+Leq (m)'),
        headerCell('ΔH (mca)'),
        headerCell('ΔZ (m)'),
        headerCell('Pi (mca)'),
        headerCell('Pf (mca)')
      ]
    })
  ];

  for (const detail of result.hydraulics.pipeDetails) {
    const pipe = pipes.find(p => p.id === detail.pipeId);
    if (!pipe) continue;

    const startNode = nodes.find(n => n.id === pipe.startNodeId);
    const endNode = nodes.find(n => n.id === pipe.endNodeId);
    const diamMm = Math.round(m_to_mm(pipe.diameter));
    const leq = pipe.equivalentLength || 0;
    const totalL = pipe.length + leq;
    const dZ = (endNode?.elevation || 0) - (startNode?.elevation || 0);

    rows.push(new TableRow({
      children: [
        cell(`${startNode?.name || pipe.startNodeId} → ${endNode?.name || pipe.endNodeId}`),
        cell(detail.flowLmin.toFixed(1)),
        cell(diamMm.toString()),
        cell(detail.velocity.toFixed(2)),
        cell(detail.headLossUnit.toFixed(5)),
        cell(pipe.length.toFixed(1)),
        cell(leq.toFixed(1)),
        cell(totalL.toFixed(1)),
        cell(detail.headLossTotal.toFixed(2)),
        cell(dZ.toFixed(2)),
        cell(detail.startPressure.toFixed(2)),
        cell(detail.endPressure.toFixed(2))
      ]
    }));
  }

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows
  });
}
