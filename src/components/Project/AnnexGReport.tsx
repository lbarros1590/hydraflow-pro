/**
 * Annex G Report Generator - NTCB 01/2025
 * Generates Word document with formatted tables for fire safety report
 */
import { Button } from '@/components/ui/button';
import { FileText, Download, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
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
  PageOrientation,
  convertInchesToTwip
} from 'docx';
import { saveAs } from 'file-saver';
import { Packer } from 'docx';
import { ProjectFormData, ProjectBuildingData } from '@/components/Wizard/types';
import { 
  EXISTENCE_PERIODS, 
  HEIGHT_CLASSES, 
  SAFETY_MEASURES, 
  SPECIAL_RISKS,
  OCCUPANCY_GROUPS,
  getHeightClass,
  getFireRiskLevel 
} from './AnnexGReportData';

interface AnnexGReportProps {
  formData: ProjectFormData;
}

// Table borders
const borders = {
  top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  right: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
};

// Header cell
function headerCell(text: string, options?: { colspan?: number; rowspan?: number; width?: number }): TableCell {
  return new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text, bold: true, size: 18 })],
      alignment: AlignmentType.CENTER
    })],
    shading: { fill: 'D9D9D9' },
    borders,
    columnSpan: options?.colspan,
    rowSpan: options?.rowspan,
    width: options?.width ? { size: options.width, type: WidthType.DXA } : undefined,
    verticalAlign: 'center',
  });
}

// Normal cell
function cell(text: string, options?: { align?: typeof AlignmentType[keyof typeof AlignmentType]; colspan?: number; bold?: boolean }): TableCell {
  return new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text, size: 18, bold: options?.bold })],
      alignment: options?.align || AlignmentType.CENTER
    })],
    borders,
    columnSpan: options?.colspan,
    verticalAlign: 'center',
  });
}

// Checkbox cell
function checkCell(checked: boolean): TableCell {
  return new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text: checked ? 'x' : '', size: 18, bold: true })],
      alignment: AlignmentType.CENTER
    })],
    borders,
    verticalAlign: 'center',
  });
}

export function AnnexGReport({ formData }: AnnexGReportProps) {
  const [generating, setGenerating] = useState(false);

  const generateReport = async () => {
    setGenerating(true);
    try {
      const doc = new Document({
        sections: [{
          properties: {
            page: {
              size: { orientation: PageOrientation.PORTRAIT },
              margin: { top: convertInchesToTwip(0.5), bottom: convertInchesToTwip(0.5), left: convertInchesToTwip(0.5), right: convertInchesToTwip(0.5) }
            }
          },
          children: [
            // Title
            new Paragraph({
              text: '5.1 ENQUADRAMENTO LEGAL E NORMATIVO',
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 200 }
            }),

            // Table 2 - Existence Period
            ...createExistencePeriodTable(formData),

            // Table 8 - Classification
            ...createClassificationTable(formData),

            // Table 9 - Height
            ...createHeightTable(formData),

            // Table 10 - Fire Load
            ...createFireLoadTable(formData),

            // Section 5.1.2 - Building Characteristics
            new Paragraph({ children: [new PageBreak()] }),
            ...createBuildingCharacteristicsTable(formData),

            // Section 5.1.3 - Safety Measures
            new Paragraph({ children: [new PageBreak()] }),
            ...createSafetyMeasuresTable(formData),

            // Section 6.1 - Fire Resistance
            ...createFireResistanceSection(formData),

            // Section 6.2 - Vehicle Access
            ...createVehicleAccessSection(formData),

            // Section 6.3.1 - Stairs
            new Paragraph({ children: [new PageBreak()] }),
            ...createStairsSection(formData),

            // Footer
            new Paragraph({
              children: [new TextRun({ text: `Relatório gerado em: ${new Date().toLocaleString('pt-BR')}`, size: 16, italics: true })],
              spacing: { before: 400 },
              alignment: AlignmentType.RIGHT
            })
          ]
        }]
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `anexo_g_${formData.projectName?.replace(/\s+/g, '_') || 'projeto'}_${new Date().toISOString().slice(0, 10)}.docx`);
      toast.success('Relatório gerado com sucesso!');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Erro ao gerar relatório');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button onClick={generateReport} disabled={generating} className="gap-2">
      {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
      Gerar Relatório Anexo G
    </Button>
  );
}

// Table 2 - Existence Period
function createExistencePeriodTable(formData: ProjectFormData): (Paragraph | Table)[] {
  const building = formData.buildings?.[0];
  const selectedPeriod = building?.existencePeriod || 'pos_2023';

  return [
    new Paragraph({
      children: [new TextRun({ text: 'TABELA 2 do Anexo A.3 NTCB 01 – Parte 3 (Período de existência)', bold: true, size: 20 })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 100 }
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: EXISTENCE_PERIODS.map(period => 
        new TableRow({
          children: [
            cell(period.label, { align: AlignmentType.LEFT }),
            cell('('),
            cell(selectedPeriod === period.id ? 'x' : ''),
            cell(')')
          ]
        })
      )
    })
  ];
}

// Table 8 - Classification
function createClassificationTable(formData: ProjectFormData): (Paragraph | Table)[] {
  // Get unique occupancies from all sectors
  const occupancies = new Map<string, { division: string; description: string }>();
  formData.buildings?.forEach(building => {
    building.floors?.forEach(floor => {
      floor.sectors?.forEach(sector => {
        if (sector.occupancyCode && !occupancies.has(sector.occupancyCode)) {
          occupancies.set(sector.occupancyCode, {
            division: sector.occupancyCode,
            description: sector.occupancyName || ''
          });
        }
      });
    });
  });

  const rows: TableRow[] = [
    new TableRow({ children: [headerCell('Grupo'), headerCell('Uso'), headerCell('Divisão'), headerCell('Descrição')] })
  ];

  occupancies.forEach((occ, code) => {
    const group = code.charAt(0).toUpperCase();
    const groupData = OCCUPANCY_GROUPS.find(g => g.group === group);
    rows.push(new TableRow({
      children: [
        cell(group),
        cell(groupData?.use || ''),
        cell(code),
        cell(occ.description, { align: AlignmentType.LEFT })
      ]
    }));
  });

  return [
    new Paragraph({
      children: [new TextRun({ text: 'TABELA 8 da NTCB 01 (Classificação)', bold: true, size: 20 })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 300, after: 100 }
    }),
    new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows })
  ];
}

// Table 9 - Height
function createHeightTable(formData: ProjectFormData): (Paragraph | Table)[] {
  const building = formData.buildings?.[0];
  const height = building?.totalHeight || formData.totalHeight || 0;
  const hClass = getHeightClass(height);

  return [
    new Paragraph({
      children: [new TextRun({ text: 'TABELA 9 da NTCB 01 (Altura)', bold: true, size: 20 })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 300, after: 100 }
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [headerCell('Tipo'), headerCell('Denominação'), headerCell('Altura')] }),
        new TableRow({ children: [cell(hClass.type), cell(hClass.name), cell(hClass.heightRange)] })
      ]
    })
  ];
}

// Table 10 - Fire Load
function createFireLoadTable(formData: ProjectFormData): (Paragraph | Table)[] {
  let maxFireLoad = 0;
  formData.buildings?.forEach(building => {
    building.floors?.forEach(floor => {
      floor.sectors?.forEach(sector => {
        if (sector.fireLoad && sector.fireLoad > maxFireLoad) {
          maxFireLoad = sector.fireLoad;
        }
      });
    });
  });

  const risk = getFireRiskLevel(maxFireLoad);
  const riskRange = risk === 'BAIXO' ? 'Até 300 MJ/m²' : risk === 'MÉDIO' ? '300 a 500 MJ/m²' : 'Acima de 500 MJ/m²';

  return [
    new Paragraph({
      children: [new TextRun({ text: 'TABELA 10 da NTCB 01 (Carga de incêndio)', bold: true, size: 20 })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 300, after: 100 }
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [headerCell('Risco'), headerCell('Carga de incêndio')] }),
        new TableRow({ children: [cell(risk), cell(riskRange)] })
      ]
    })
  ];
}

// Section 5.1.2 - Building Characteristics
function createBuildingCharacteristicsTable(formData: ProjectFormData): (Paragraph | Table)[] {
  const rows: TableRow[] = [
    new TableRow({
      children: [
        headerCell('Discriminação do pavimento/setor'),
        headerCell('Ocupação'),
        headerCell('Risco'),
        headerCell('Nº de pisos'),
        headerCell('Pé direito (m)'),
        headerCell('Área (m²)'),
        headerCell('Carga de incêndio (MJ/m²)'),
        headerCell('Carga de Incêndio Total (área X Carga de Incêndio)')
      ]
    })
  ];

  formData.buildings?.forEach(building => {
    building.floors?.forEach(floor => {
      floor.sectors?.forEach(sector => {
        const fireLoad = sector.fireLoad || 300;
        const area = sector.area || 0;
        const totalLoad = area * fireLoad;
        const risk = getFireRiskLevel(fireLoad);

        rows.push(new TableRow({
          children: [
            cell(sector.name || 'Setor', { align: AlignmentType.LEFT }),
            cell(sector.occupancyName || sector.occupancyCode || '-'),
            cell(risk),
            cell('1'),
            cell(floor.height?.toFixed(2) || '3.00'),
            cell(area.toFixed(0)),
            cell(fireLoad.toFixed(0)),
            cell(totalLoad.toFixed(2))
          ]
        }));
      });
    });
  });

  return [
    new Paragraph({
      children: [new TextRun({ text: '5.1.2 CARACTERÍSTICAS DA EDIFICAÇÃO, INSTALAÇÃO OU LOCAL DE RISCO', bold: true, size: 20 })],
      spacing: { before: 200, after: 100 }
    }),
    new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows })
  ];
}

// Section 5.1.3 - Safety Measures
function createSafetyMeasuresTable(formData: ProjectFormData): (Paragraph | Table)[] {
  // Usa medidas globais do projeto
  const selectedMeasures = formData.mandatoryMeasures || formData.voluntaryMeasures || [];
  const selectedRisks = formData.specialRisks || [];

  // Split measures into two columns
  const col1Measures = SAFETY_MEASURES.slice(0, Math.ceil(SAFETY_MEASURES.length / 2));
  const col2Measures = SAFETY_MEASURES.slice(Math.ceil(SAFETY_MEASURES.length / 2));

  const measureRows: TableRow[] = [];
  const maxRows = Math.max(col1Measures.length, col2Measures.length);

  for (let i = 0; i < maxRows; i++) {
    const m1 = col1Measures[i];
    const m2 = col2Measures[i];
    measureRows.push(new TableRow({
      children: [
        cell(selectedMeasures.includes(m1?.id || '') ? 'x' : ''),
        cell(m1?.label || '', { align: AlignmentType.LEFT }),
        cell(selectedMeasures.includes(m2?.id || '') ? 'x' : ''),
        cell(m2?.label || '', { align: AlignmentType.LEFT })
      ]
    }));
  }

  // Special risks
  const col1Risks = SPECIAL_RISKS.slice(0, Math.ceil(SPECIAL_RISKS.length / 2));
  const col2Risks = SPECIAL_RISKS.slice(Math.ceil(SPECIAL_RISKS.length / 2));
  const riskRows: TableRow[] = [];
  const maxRiskRows = Math.max(col1Risks.length, col2Risks.length);

  for (let i = 0; i < maxRiskRows; i++) {
    const r1 = col1Risks[i];
    const r2 = col2Risks[i];
    riskRows.push(new TableRow({
      children: [
        cell(selectedRisks.includes(r1?.id || '') ? 'x' : ''),
        cell(r1?.label || '', { align: AlignmentType.LEFT }),
        cell(selectedRisks.includes(r2?.id || '') ? 'x' : ''),
        cell(r2?.label || '', { align: AlignmentType.LEFT })
      ]
    }));
  }

  return [
    new Paragraph({
      children: [new TextRun({ text: '5.1.3 MEDIDAS DE SEGURANÇA CONTRA INCÊNDIO E PÂNICO', bold: true, size: 20 })],
      spacing: { before: 200, after: 100 }
    }),
    new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: measureRows }),
    new Paragraph({
      children: [new TextRun({ text: 'RISCOS ESPECIAIS', bold: true, size: 18 })],
      spacing: { before: 200, after: 100 }
    }),
    new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: riskRows })
  ];
}

// Section 6.1 - Fire Resistance
function createFireResistanceSection(formData: ProjectFormData): (Paragraph | Table)[] {
  const building = formData.buildings?.[0];
  const fr = building?.fireResistance;
  const hClass = getHeightClass(building?.totalHeight || 0);

  return [
    new Paragraph({
      children: [new TextRun({ text: '6.1 RESISTÊNCIA AO FOGO DOS ELEMENTOS DE CONSTRUÇÃO', bold: true, size: 20 })],
      spacing: { before: 300, after: 50 }
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Esta medida de segurança foi dimensionada atendendo à NTCB 11 do Corpo de Bombeiros Militar de Mato Grosso.', size: 18, italics: true })],
      spacing: { after: 100 }
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [
          headerCell('Divisão'), 
          headerCell('Altura'), 
          headerCell('Tipo de Parede'), 
          headerCell('Espessura Total da Parede')
        ]}),
        new TableRow({ children: [
          cell(building?.floors?.[0]?.sectors?.[0]?.occupancyCode || '-'),
          cell(hClass.heightRange),
          cell(fr?.wallType || 'Meio tijolo com revestimento'),
          cell(fr?.wallThickness || '15 cm')
        ]})
      ]
    }),
    new Paragraph({ text: '', spacing: { after: 100 } }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [headerCell('Exigido'), headerCell('', { colspan: 2 }), headerCell('Existente')] }),
        new TableRow({ children: [
          cell(`${fr?.trrfRequired || 30} min`),
          cell('Integridade'),
          cell(`${fr?.trrfExisting?.integrity || 120} min`)
        ]}),
        new TableRow({ children: [
          cell(''),
          cell('Estanqueidade'),
          cell(`${fr?.trrfExisting?.tightness || 120} min`)
        ]}),
        new TableRow({ children: [
          cell(''),
          cell('Isolação térmica'),
          cell(`${fr?.trrfExisting?.thermalInsulation || 120} min`)
        ]}),
        new TableRow({ children: [
          cell(''),
          cell('TRRF'),
          cell(`${fr?.trrfExisting?.trrf || 120} min`)
        ]})
      ]
    })
  ];
}

// Section 6.2 - Vehicle Access
function createVehicleAccessSection(formData: ProjectFormData): (Paragraph | Table)[] {
  // Usa vehicleAccess global do projeto (não por edificação)
  const va = formData.vehicleAccess || formData.buildings?.[0]?.vehicleAccess;

  const roadRows: TableRow[] = [
    new TableRow({ children: [
      headerCell('Largura (m)'),
      headerCell('Altura livre (m)'),
      headerCell('Capacidade de suporte (Kg)'),
      headerCell('Tipo de Contorno')
    ]})
  ];

  (va?.roads || []).forEach(road => {
    roadRows.push(new TableRow({ children: [
      cell(typeof road.width === 'number' ? road.width.toFixed(2) : String(road.width)),
      cell(typeof road.freeHeight === 'number' ? road.freeHeight.toFixed(2) : String(road.freeHeight)),
      cell(String(road.loadCapacity)),
      cell(road.turnType || 'NA')
    ]}));
  });

  const gateRows: TableRow[] = [
    new TableRow({ children: [headerCell('Largura (m)'), headerCell('Altura (m)')] })
  ];

  (va?.gates || []).forEach(gate => {
    gateRows.push(new TableRow({ children: [
      cell(typeof gate.width === 'number' ? gate.width.toFixed(2) : String(gate.width)),
      cell(typeof gate.height === 'number' ? gate.height.toFixed(2) : String(gate.height))
    ]}));
  });

  return [
    new Paragraph({
      children: [new TextRun({ text: '6.2 ACESSO DE VIATURA NA EDIFICAÇÃO', bold: true, size: 20 })],
      spacing: { before: 300, after: 50 }
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Esta medida de segurança foi dimensionada atendendo à NTCB 08 do Corpo de Bombeiros Militar de Mato Grosso.', size: 18, italics: true })],
      spacing: { after: 100 }
    }),
    new Paragraph({ children: [new TextRun({ text: 'VIAS', bold: true, size: 18 })], spacing: { after: 50 } }),
    new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: roadRows }),
    new Paragraph({ children: [new TextRun({ text: 'PORTÃO', bold: true, size: 18 })], spacing: { before: 100, after: 50 } }),
    new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: gateRows })
  ];
}

// Section 6.3.1 - Stairs
function createStairsSection(formData: ProjectFormData): (Paragraph | Table)[] {
  const building = formData.buildings?.[0];
  const stairs = building?.stairs || [];

  const elements: (Paragraph | Table)[] = [
    new Paragraph({
      children: [new TextRun({ text: '6.3.1 ESCADAS', bold: true, size: 20 })],
      spacing: { before: 200, after: 100 }
    })
  ];

  // Quantity summary
  const stairTypes = { NE: 0, EP: 0, PF: 0 };
  stairs.forEach(s => { stairTypes[s.type]++; });

  elements.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [
        headerCell('', { colspan: 4 }), 
        new TableCell({ 
          children: [new Paragraph({ children: [new TextRun({ text: 'Quantidade de escadas', bold: true, size: 18 })], alignment: AlignmentType.CENTER })],
          columnSpan: 4, borders, shading: { fill: 'D9D9D9' }
        })
      ]}),
      new TableRow({ children: [
        headerCell('', { colspan: 2 }), headerCell('Previstas', { colspan: 2 }), headerCell('Instaladas', { colspan: 2 })
      ]}),
      new TableRow({ children: [
        headerCell('Quantidade'), headerCell('Tipo'), headerCell('Quantidade'), headerCell('Tipo')
      ]}),
      new TableRow({ children: [
        cell(String(stairs.length).padStart(2, '0')),
        cell(Object.entries(stairTypes).filter(([_, v]) => v > 0).map(([k]) => k).join(', ') || 'NE'),
        cell(String(stairs.length).padStart(2, '0')),
        cell(Object.entries(stairTypes).filter(([_, v]) => v > 0).map(([k]) => k).join(', ') || 'NE')
      ]})
    ]
  }));

  // Individual stairs
  stairs.forEach(stair => {
    const typeName = stair.type === 'NE' ? 'ESCADA NÃO ENCLAUSURADA (NE)' : 
                     stair.type === 'EP' ? 'ESCADA ENCLAUSURADA PROTEGIDA (EP)' : 
                     'ESCADA À PROVA DE FUMAÇA (PF)';

    elements.push(new Paragraph({
      children: [new TextRun({ text: `- ${stair.name}`, bold: true, size: 18 })],
      spacing: { before: 200, after: 50 }
    }));

    elements.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [headerCell(typeName, { colspan: 2 })] }),
        new TableRow({ children: [cell('Material de construção', { align: AlignmentType.LEFT }), cell(stair.material)] }),
        new TableRow({ children: [cell('Largura da escada', { align: AlignmentType.LEFT }), cell(`${stair.width.toFixed(2)} m`)] }),
        new TableRow({ children: [cell('Altura a vencer por lanço', { align: AlignmentType.LEFT }), cell(`${stair.heightPerRun.toFixed(2)} m`)] }),
        new TableRow({ children: [cell('Altura do guarda-corpo', { align: AlignmentType.LEFT }), cell(`${stair.guardRailHeight.toFixed(2)} m`)] }),
        new TableRow({ children: [headerCell('Corrimão', { colspan: 2 })] }),
        new TableRow({ children: [cell('Altura', { align: AlignmentType.LEFT }), cell(`${stair.handrail.height.toFixed(2)} m`)] }),
        new TableRow({ children: [cell('Diâmetro (circular)', { align: AlignmentType.LEFT }), cell(`${(stair.handrail.diameterCircular || 0.04).toFixed(2)} m`)] }),
        new TableRow({ children: [cell('Afastamento da parede', { align: AlignmentType.LEFT }), cell(`${stair.handrail.wallClearance} mm`)] }),
        new TableRow({ children: [headerCell('Degraus', { colspan: 2 })] }),
        new TableRow({ children: [cell('Quantidade por lanço', { align: AlignmentType.LEFT }), cell(String(stair.steps.quantityPerRun))] }),
        new TableRow({ children: [cell('Altura (espelho)', { align: AlignmentType.LEFT }), cell(`${stair.steps.riserHeight} cm`)] }),
        new TableRow({ children: [cell('Largura (passo)', { align: AlignmentType.LEFT }), cell(`${stair.steps.treadDepth} cm`)] })
      ]
    }));
  });

  return elements;
}

export default AnnexGReport;
