/**
 * Annex G Report Generator - NTCB 01/2025
 * Generates Word document with formatted tables for fire safety report
 * Now includes data from saved calculations (Hydraulic, Separation, Emergency Exit)
 */
import { Button } from '@/components/ui/button';
import { FileText, Download, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
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
  projectId?: string;
}

interface SavedCalculations {
  hydraulic: any | null;
  separation: any | null;
  emergencyExit: any | null;
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

export function AnnexGReport({ formData, projectId }: AnnexGReportProps) {
  const [generating, setGenerating] = useState(false);
  const [savedCalcs, setSavedCalcs] = useState<SavedCalculations>({
    hydraulic: null,
    separation: null,
    emergencyExit: null,
  });

  // Fetch saved calculations when component mounts
  useEffect(() => {
    if (projectId) {
      fetchSavedCalculations();
    }
  }, [projectId]);

  const fetchSavedCalculations = async () => {
    if (!projectId) return;
    
    try {
      const [hydraulicRes, separationRes, emergencyRes] = await Promise.all([
        supabase
          .from('hydraulic_calculations')
          .select('*')
          .eq('project_id', projectId)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single(),
        supabase
          .from('separation_calculations')
          .select('*')
          .eq('project_id', projectId)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single(),
        supabase
          .from('emergency_exit_calculations')
          .select('*')
          .eq('project_id', projectId)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single(),
      ]);

      setSavedCalcs({
        hydraulic: hydraulicRes.data,
        separation: separationRes.data,
        emergencyExit: emergencyRes.data,
      });
    } catch (error) {
      console.log('No saved calculations found');
    }
  };

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

            // Table 2 - Existence Period (GLOBAL)
            ...createExistencePeriodTable(formData),

            // Table 8 - Classification
            ...createClassificationTable(formData),

            // Table 9 - Height
            ...createHeightTable(formData),

            // Table 10 - Fire Load (TABELA 5)
            ...createFireLoadTable(formData),

            // Section 5.1.2 - Building Characteristics
            new Paragraph({ children: [new PageBreak()] }),
            ...createBuildingCharacteristicsTable(formData),

            // Section 5.1.3 - Safety Measures
            new Paragraph({ children: [new PageBreak()] }),
            ...createSafetyMeasuresTable(formData),

            // Section 4.1 - Excluded Areas for Measures (TABELA 4.1)
            ...createExcludedAreasTable(formData, 'measures'),

            // Section 4.2 - Excluded Areas for Hydraulics (TABELA 4.2)
            ...createExcludedAreasTable(formData, 'hydraulics'),

            // Section 6.1 - Fire Resistance
            new Paragraph({ children: [new PageBreak()] }),
            ...createFireResistanceSection(formData),

            // Section 6.12 - Finishing Materials Control (NTCB 12/2020)
            ...createFinishingMaterialsSection(formData),

            // Section 6.2 - Vehicle Access
            new Paragraph({ children: [new PageBreak()] }),
            ...createVehicleAccessSection(formData),

            // Separation Table (NTCB 09) - moved before emergency exits
            ...(savedCalcs.separation ? [
              new Paragraph({ children: [new PageBreak()] }),
              ...createSeparationTableFromCalc(savedCalcs.separation)
            ] : formData.buildings && formData.buildings.length > 1 ? [
              new Paragraph({ children: [new PageBreak()] }),
              ...createSeparationTable(formData)
            ] : []),

            // Table 6.3 - Emergency Exits (NTCB 13/2020)
            new Paragraph({ children: [new PageBreak()] }),
            ...createEmergencyExitsTable(formData, savedCalcs.emergencyExit),

            // Section 6.3.1 - Stairs
            ...createStairsSection(formData),
            
            // Section 6.3.2 - Ramps
            ...createRampsSection(formData),

            // Section 6.7 - Hydrants and Hose Reels
            ...(savedCalcs.hydraulic ? [
              new Paragraph({ children: [new PageBreak()] }),
              ...createHydraulicSystemTable(savedCalcs.hydraulic)
            ] : []),

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

// Table 2 - Existence Period (GLOBAL do projeto, não por edificação)
function createExistencePeriodTable(formData: ProjectFormData): (Paragraph | Table)[] {
  // Usa período de existência GLOBAL do projeto
  const selectedPeriod = formData.existencePeriod || formData.buildings?.[0]?.existencePeriod || 'pos_2023';

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

// TABELA 3 - Classificação PRINCIPAL do Projeto (Anexo A.3 NTCB 01 – Parte 3)
// Esta tabela mostra a classificação que determina todo o enquadramento do projeto
function createClassificationTable(formData: ProjectFormData): (Paragraph | Table)[] {
  // Usa a classificação PRINCIPAL do projeto (campo mainClassification)
  const mainClass = formData.mainClassification;
  
  // Fallback: se não tiver mainClassification, pega do primeiro setor
  let group = mainClass?.group || '';
  let use = mainClass?.use || '';
  let division = mainClass?.division || '';
  let description = mainClass?.description || '';
  
  // Se não houver classificação principal definida, busca do primeiro setor
  if (!division) {
    formData.buildings?.forEach(building => {
      building.floors?.forEach(floor => {
        floor.sectors?.forEach(sector => {
          if (sector.occupancyCode && !division) {
            division = sector.occupancyCode;
            description = sector.occupancyName || '';
            group = division.charAt(0).toUpperCase();
            const groupData = OCCUPANCY_GROUPS.find(g => g.group === group);
            use = groupData?.use || '';
          }
        });
      });
    });
  }

  const rows: TableRow[] = [
    new TableRow({ children: [headerCell('Grupo'), headerCell('Uso'), headerCell('Divisão'), headerCell('Descrição')] }),
    new TableRow({
      children: [
        cell(group),
        cell(use),
        cell(division),
        cell(description, { align: AlignmentType.LEFT })
      ]
    })
  ];

  return [
    new Paragraph({
      children: [new TextRun({ text: 'TABELA 3 do Anexo A.3 NTCB 01 – Parte 3 (Classificação)', bold: true, size: 20 })],
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

// Section 5.1.2 - Building Characteristics (AGORA POR EDIFICAÇÃO)
// As edificações cadastradas preenchem a tabela 5.1.2
function createBuildingCharacteristicsTable(formData: ProjectFormData): (Paragraph | Table)[] {
  const rows: TableRow[] = [
    new TableRow({
      children: [
        headerCell('Discriminação da edificação'),
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

  // Itera por EDIFICAÇÃO (não por setor)
  formData.buildings?.forEach(building => {
    // Calcula totais da edificação
    let totalArea = 0;
    let totalFloors = building.floors?.length || 1;
    let maxFireLoad = 0;
    let mainOccupancy = '';
    let avgHeight = 0;
    let heightCount = 0;

    building.floors?.forEach(floor => {
      if (floor.height) {
        avgHeight += floor.height;
        heightCount++;
      }
      floor.sectors?.forEach(sector => {
        totalArea += sector.area || 0;
        if (sector.fireLoad && sector.fireLoad > maxFireLoad) {
          maxFireLoad = sector.fireLoad;
          mainOccupancy = sector.occupancyName || sector.occupancyCode || '';
        }
      });
    });

    const fireLoad = maxFireLoad || 300;
    const totalLoad = totalArea * fireLoad;
    const risk = getFireRiskLevel(fireLoad);
    const height = heightCount > 0 ? (avgHeight / heightCount) : 3;

    rows.push(new TableRow({
      children: [
        cell(building.name || 'Edificação', { align: AlignmentType.LEFT }),
        cell(mainOccupancy || '-'),
        cell(risk),
        cell(String(totalFloors)),
        cell(height.toFixed(2)),
        cell(totalArea.toFixed(0)),
        cell(fireLoad.toFixed(0)),
        cell(totalLoad.toFixed(2))
      ]
    }));
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
  // Mapeia IDs do wizard para IDs do relatório
  const measureIdMap: Record<string, string> = {
    'extintores': 'extintores',
    'sinalizacao': 'sinalizacao',
    'iluminacao': 'iluminacao_emergencia',
    'alarme': 'alarme',
    'hidrantes': 'hidrantes',
    'spk': 'sprinklers',
    'chuveiros': 'sprinklers',
    'deteccao': 'deteccao',
    'brigada': 'brigada',
    'saidas': 'saidas_emergencia',
    'controleAcesso': 'controle_acabamento',
    'ppcip': 'plano_intervencao',
  };
  
  // Combina medidas obrigatórias, isentas e voluntárias para determinar quais estão ativas
  const mandatoryMeasures = formData.mandatoryMeasures || [];
  const exemptMeasures = formData.exemptMeasures || [];
  const voluntaryMeasures = formData.voluntaryMeasures || [];
  
  // Medidas selecionadas = (obrigatórias OU voluntárias) - isentas
  const selectedMeasureIds = [
    ...mandatoryMeasures.filter(m => !exemptMeasures.includes(m)),
    ...voluntaryMeasures
  ];
  
  // Converte IDs do wizard para IDs do relatório
  const mappedMeasureIds = selectedMeasureIds.map(id => measureIdMap[id] || id);
  
  // Adiciona medidas básicas que sempre estão presentes
  const basicMeasures = ['acesso_viatura', 'resistencia_fogo', 'saidas_emergencia', 'sinalizacao', 'iluminacao_emergencia', 'extintores'];
  const finalMeasures = [...new Set([...mappedMeasureIds, ...basicMeasures])];
  
  const selectedRisks = formData.specialRisks || [];
  
  // Mapeia IDs de riscos especiais do wizard para IDs do relatório
  const riskIdMap: Record<string, string> = {
    'subsolo': 'outros_especiais',
    'glp': 'central_glp',
    'vasosPressao': 'vasos_pressao',
    'inflamaveis': 'liquidos_inflamaveis',
    'caldeira': 'outros_especiais',
    'heliponto': 'heliponto',
  };
  
  const mappedRiskIds = selectedRisks.map(id => riskIdMap[id] || id);

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
        cell(finalMeasures.includes(m1?.id || '') ? 'x' : ''),
        cell(m1?.label || '', { align: AlignmentType.LEFT }),
        cell(finalMeasures.includes(m2?.id || '') ? 'x' : ''),
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
        cell(mappedRiskIds.includes(r1?.id || '') ? 'x' : ''),
        cell(r1?.label || '', { align: AlignmentType.LEFT }),
        cell(mappedRiskIds.includes(r2?.id || '') ? 'x' : ''),
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
  const hClass = getHeightClass(building?.totalHeight || formData.totalHeight || 0);
  
  // Get division from mainClassification or first sector
  let division = formData.mainClassification?.division || '';
  if (!division && building?.floors?.[0]?.sectors?.[0]?.occupancyCode) {
    division = building.floors[0].sectors[0].occupancyCode;
  }

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
          headerCell('Espessura Total da Parede'),
          headerCell('TRRF Exigido'),
          headerCell('TRRF Existente')
        ]}),
        new TableRow({ children: [
          cell(division || '-'),
          cell(hClass.heightRange),
          cell(fr?.wallType || 'Meio Tijolo com revestimento'),
          cell(fr?.wallThickness || '15'),
          cell(`${fr?.trrfRequired || 30} min`),
          cell(`${fr?.trrfExisting?.trrf || 120} min`)
        ]})
      ]
    }),
    new Paragraph({ text: '', spacing: { after: 50 } }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [headerCell('Critério'), headerCell('Exigido'), headerCell('Existente')] }),
        new TableRow({ children: [
          cell('Integridade'),
          cell(`${fr?.trrfRequired || 30} min`),
          cell(`${fr?.trrfExisting?.integrity || 120} min`)
        ]}),
        new TableRow({ children: [
          cell('Estanqueidade'),
          cell(`${fr?.trrfRequired || 30} min`),
          cell(`${fr?.trrfExisting?.tightness || 120} min`)
        ]}),
        new TableRow({ children: [
          cell('Isolação térmica'),
          cell(`${fr?.trrfRequired || 30} min`),
          cell(`${fr?.trrfExisting?.thermalInsulation || 12} min`)
        ]}),
        new TableRow({ children: [
          cell('TRRF', { bold: true }),
          cell(`${fr?.trrfRequired || 30} min`, { bold: true }),
          cell(`${fr?.trrfExisting?.trrf || 120} min`, { bold: true })
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

// Section 6.3 - Emergency Exits (NTCB 13/2020) - Formato conforme Anexo G.4 e imagem exemplo
// Os SETORES preenchem esta tabela de saída de emergência
function createEmergencyExitsTable(formData: ProjectFormData, emergencyCalc?: any): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [
    new Paragraph({
      children: [new TextRun({ text: '6.3 SAÍDAS DE EMERGÊNCIA', bold: true, size: 20 })],
      spacing: { before: 300, after: 50 }
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Esta medida de segurança foi dimensionada atendendo à NTCB 13 do Corpo de Bombeiros Militar de Mato Grosso.', size: 18, italics: true })],
      spacing: { after: 100 }
    })
  ];

  // Tabela resumo geral conforme modelo
  const building = formData.buildings?.[0];
  const hClass = getHeightClass(building?.totalHeight || formData.totalHeight || 0);
  const stairs = building?.stairs || [];
  const stairTypes = stairs.map(s => s.type).join(', ') || 'NE';
  
  // Pega divisão da classificação principal
  const mainDivision = formData.mainClassification?.division || 
    building?.floors?.[0]?.sectors?.[0]?.occupancyCode || '-';

  elements.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [
        headerCell('EDIFICAÇÃO/SETOR'),
        headerCell('Divisão'),
        headerCell('Altura'),
        headerCell('Acesso e descarga', { colspan: 2 })
      ]}),
      new TableRow({ children: [
        cell(''),
        cell(''),
        cell(''),
        cell('Tabela 1 - Escadas e rampas'),
        cell('Tabela 2 - Portas')
      ]}),
      new TableRow({ children: [
        cell(''),
        cell(''),
        cell(''),
        cell('Tabela 3 - Tipo de Escada'),
        cell('Qtde Saídas Existentes')
      ]}),
      new TableRow({ children: [
        cell(building?.name || formData.projectName || 'Edificação'),
        cell(mainDivision),
        cell(hClass.heightRange),
        cell(stairTypes),
        cell(String(stairs.length || 1))
      ]})
    ]
  }));

  // Para cada SETOR - tabela detalhada conforme imagem exemplo
  // Formato: Nome do Setor (como título)
  //          Pavimento XX – Divisão YY – Z Pessoa/Wm²
  formData.buildings?.forEach(building => {
    building.floors?.forEach(floor => {
      floor.sectors?.forEach(sector => {
        const density = sector.densityM2PerPerson || 10;
        const area = sector.area || 0;
        // População arredondada para BAIXO conforme NTCB 13/2020
        const population = Math.floor(area / density);
        const upRequired = Math.ceil(population / 100);
        const widthRequired = upRequired * 0.55;
        const widthExisting = (sector.doors || []).reduce((sum, d) => sum + (d.width * d.quantity), 0);
        
        // Formatar portas existentes conforme exemplo: "1 - 1,80 x 2,00\n1 - 1,00 x 2,10"
        const doorsExistingFormatted = (sector.doors || []).map(d => 
          `${d.quantity} - ${d.width.toFixed(2)} x ${d.height.toFixed(2)}`
        ).join('\n') || '-';

        // Nome do setor como título
        elements.push(new Paragraph({
          children: [new TextRun({ text: sector.name || 'Setor', bold: true, size: 20, underline: {} })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 300, after: 50 }
        }));

        // Subtítulo: Pavimento – Divisão – Densidade (conforme imagem)
        elements.push(new Paragraph({
          children: [new TextRun({ 
            text: `${floor.name}–${sector.occupancyName || 'Comercial'} Divisão ${sector.occupancyCode || '-'}- 1 Pessoa/${density}m²`, 
            bold: true, 
            size: 18 
          })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 }
        }));

        // Tabela com colunas conforme imagem
        elements.push(new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [
              headerCell('Área computada (m²)'),
              headerCell('População'),
              headerCell('Capacidade da unidade de passagem – C'),
              headerCell('Metragem das saídas', { colspan: 2 })
            ]}),
            new TableRow({ children: [
              cell(''),
              cell(''),
              cell(''),
              headerCell('Exigido'),
              headerCell('Existente')
            ]}),
            new TableRow({ children: [
              cell(area.toFixed(2)),
              cell(String(population)),
              cell('100'),
              cell(widthRequired.toFixed(2)),
              // Portas existentes em formato multilinha
              new TableCell({
                children: [new Paragraph({
                  children: [new TextRun({ text: doorsExistingFormatted, size: 18 })],
                  alignment: AlignmentType.CENTER
                })],
                borders,
                verticalAlign: 'center',
              })
            ]})
          ]
        }));
      });
    });
  });

  return elements;
}

// Section 4.1/4.2 - Excluded Areas Tables (NTCB 01/2025)
function createExcludedAreasTable(formData: ProjectFormData, type: 'measures' | 'hydraulics'): (Paragraph | Table)[] {
  const excludedAreas = type === 'measures' 
    ? (formData as any).excludedAreasForMeasures || []
    : (formData as any).excludedAreasForHydraulics || [];
  
  // If no excluded areas, return empty
  if (excludedAreas.length === 0) {
    return [];
  }

  const titleNumber = type === 'measures' ? '4.1' : '4.2';
  const title = type === 'measures'
    ? 'NÃO SERÃO COMPUTADAS AS SEGUINTES ÁREAS PARA ENQUADRAMENTO NA TABELA 6 DO ANEXO A.3 DESTA NTCB 01'
    : 'NÃO SERÃO COMPUTADAS PARA FINS DE DIMENSIONAMENTO DE SISTEMAS HIDRÁULICOS E COMPARTIMENTAÇÃO AS SEGUINTES ÁREAS:';
  
  const tableTitle = type === 'measures'
    ? 'EXCLUSÃO DE ÁREAS PARA ENQUADRAMENTO DE MEDIDAS DE SEGURANÇA'
    : 'EXCLUSÃO DE ÁREAS PARA SISTEMAS HIDRÁULICOS';

  const rows: TableRow[] = [
    new TableRow({ children: [headerCell(tableTitle, { colspan: 3 })] }),
    new TableRow({ children: [
      headerCell('Denominação'),
      headerCell('Referência Normativa'),
      headerCell('Área (m²)')
    ] }),
  ];

  // Add items from formData with new structure (description, reference, area)
  let totalExcluded = 0;
  excludedAreas.forEach((item: any) => {
    const description = item.description || item.denomination || '';
    const reference = item.reference || '';
    const area = item.area || 0;
    
    if (description) {
      totalExcluded += area;
      rows.push(new TableRow({ children: [
        cell(description, { align: AlignmentType.LEFT }),
        cell(reference),
        cell(area > 0 ? area.toFixed(2) : '-')
      ]}));
    }
  });

  // Add total row if any areas
  if (totalExcluded > 0) {
    rows.push(new TableRow({ children: [
      cell('Área total excluída', { align: AlignmentType.LEFT, bold: true }),
      cell(''),
      cell(totalExcluded.toFixed(2), { bold: true })
    ]}));
  }

  // If no items to show, return empty
  if (rows.length <= 2) {
    return [];
  }

  return [
    new Paragraph({
      children: [new TextRun({ text: `${titleNumber} ${title}`, bold: true, size: 18 })],
      spacing: { before: 300, after: 100 }
    }),
    new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows })
  ];
}

// Section 6.12 - Finishing Materials Control (NTCB 12/2020)
function createFinishingMaterialsSection(formData: ProjectFormData): (Paragraph | Table)[] {
  const building = formData.buildings?.[0];
  const materials = building?.finishingMaterials || [];
  
  // Se não houver materiais configurados, usar classificação principal
  const mainDivision = formData.mainClassification?.division || '-';
  const mainGroup = formData.mainClassification?.group || '-';
  const mainUse = formData.mainClassification?.use || '-';

  const rows: TableRow[] = [
    new TableRow({ children: [
      headerCell('6.12 CONTROLE DE MATERIAIS DE ACABAMENTO\n(NTCB 12/2020)', { colspan: 5 })
    ]}),
    new TableRow({ children: [
      headerCell(''),
      headerCell('FINALIDADE DO MATERIAL', { colspan: 4 })
    ]}),
    new TableRow({ children: [
      headerCell('Grupo/ Divisão'),
      headerCell('Piso\n(Acabamento/\nRevestimento)'),
      headerCell('Paredes e divisórias\n(Acabamento/\nRevestimento)'),
      headerCell('Teto e forro\n(Acabamento/\nRevestimento)'),
      headerCell('Fachada\n(Acabamento/\nRevestimento)')
    ]})
  ];

  if (materials.length > 0) {
    materials.forEach(mat => {
      rows.push(new TableRow({ children: [
        cell(mat.groupDivision),
        cell(mat.floor),
        cell(mat.wallsPartitions),
        cell(mat.ceilingRoof),
        cell(mat.facade)
      ]}));
    });
  } else {
    // Valor padrão baseado na classificação principal
    rows.push(new TableRow({ children: [
      cell(`${mainUse}\n${mainDivision}`),
      cell('Classe II-A'),
      cell('Classe II-A'),
      cell('Classe II-A'),
      cell('Classe I A IIB')
    ]}));
  }

  return [
    new Paragraph({
      children: [new TextRun({ text: 'Esta medida de segurança foi dimensionada atendendo à NTCB 12 do Corpo de Bombeiros Militar de Mato Grosso.', size: 18, italics: true })],
      spacing: { before: 300, after: 100 }
    }),
    new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows })
  ];
}

// Section 6.3.2 - Ramps (NTCB 13/2020)
function createRampsSection(formData: ProjectFormData): (Paragraph | Table)[] {
  const ramps = (formData as any).ramps || [];
  
  // Se não houver rampas, não mostrar seção
  if (ramps.length === 0) {
    return [];
  }

  const elements: (Paragraph | Table)[] = [
    new Paragraph({
      children: [new TextRun({ text: '6.3.2 RAMPAS', bold: true, size: 20 })],
      spacing: { before: 300, after: 100 }
    })
  ];

  ramps.forEach((ramp: any) => {
    elements.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [headerCell('CARACTERÍSTICAS / DIMENSÕES', { colspan: 2 })] }),
        new TableRow({ children: [cell('TRRF de Parede', { align: AlignmentType.LEFT }), cell(ramp.trrfWall || 'NA')] }),
        new TableRow({ children: [cell('Largura da rampa', { align: AlignmentType.LEFT }), cell(ramp.width ? `${ramp.width.toFixed(2)} m` : 'NA')] }),
        new TableRow({ children: [cell('Material da porta', { align: AlignmentType.LEFT }), cell(ramp.doorMaterial || 'NA')] }),
        new TableRow({ children: [cell('Altura a vencer por lance', { align: AlignmentType.LEFT }), cell(ramp.heightPerRun ? `${ramp.heightPerRun.toFixed(2)} m` : 'NA')] }),
        new TableRow({ children: [cell('Altura do guarda-corpo', { align: AlignmentType.LEFT }), cell(ramp.guardRailHeight ? `${ramp.guardRailHeight.toFixed(2)} m` : 'NA')] }),
        new TableRow({ children: [cell('Declividade', { align: AlignmentType.LEFT }), cell(ramp.slope ? `${ramp.slope}%` : 'NA')] }),
        new TableRow({ children: [cell('Comprimento', { align: AlignmentType.LEFT }), cell(ramp.length ? `${ramp.length.toFixed(2)} m` : 'NA')] }),
        new TableRow({ children: [headerCell('Corrimão', { colspan: 2 })] }),
        new TableRow({ children: [cell('Altura', { align: AlignmentType.LEFT }), cell(ramp.handrailHeight ? `${ramp.handrailHeight.toFixed(2)} m` : 'NA')] }),
        new TableRow({ children: [cell('Diâmetro (circular)', { align: AlignmentType.LEFT }), cell(ramp.handrailDiameter ? `${ramp.handrailDiameter} mm` : 'NA')] }),
        new TableRow({ children: [headerCell('Patamar', { colspan: 2 })] }),
        new TableRow({ children: [cell('Quantidade', { align: AlignmentType.LEFT }), cell(ramp.landingQuantity?.toString() || 'NA')] }),
        new TableRow({ children: [cell('Comprimento', { align: AlignmentType.LEFT }), cell(ramp.landingLength ? `${ramp.landingLength.toFixed(2)} m` : 'NA')] }),
        new TableRow({ children: [cell('Largura', { align: AlignmentType.LEFT }), cell(ramp.landingWidth ? `${ramp.landingWidth.toFixed(2)} m` : 'NA')] }),
        new TableRow({ children: [cell('TRRF da estrutura da rampa', { align: AlignmentType.LEFT }), cell(ramp.trrfStructure ? `${ramp.trrfStructure} min` : 'NA')] }),
      ]
    }));
  });

  return elements;
}

// Section 6.7 - Hydraulic System Table (NTCB 19)
function createHydraulicSystemTable(hydraulicCalc: any): (Paragraph | Table)[] {
  const results = hydraulicCalc?.results || {};
  const config = results?.config || {};
  const pump = results?.pump || {};
  const reserve = results?.reserve || {};
  const hydrants = results?.hydrants || {};

  return [
    new Paragraph({
      children: [new TextRun({ text: '6.7 HIDRANTES E MANGOTINHOS', bold: true, size: 20 })],
      spacing: { before: 300, after: 50 }
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Esta medida de segurança foi dimensionada atendendo à NTCB 19 do Corpo de Bombeiros Militar de Mato Grosso.', size: 18, italics: true })],
      spacing: { after: 100 }
    }),
    new Paragraph({ children: [new TextRun({ text: 'IDENTIFICAÇÃO DO TIPO DE SISTEMA', bold: true, size: 18 })], spacing: { after: 50 } }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [
          headerCell('Tipo'),
          headerCell('Esguicho Ø (mm)'),
          headerCell('Mangueira'),
          headerCell('Metragem (m)'),
          headerCell('Nº Expedições')
        ]}),
        new TableRow({ children: [
          cell(config.ntcbSystemType ? `Tipo ${config.ntcbSystemType}` : '-'),
          cell(config.demandConfig?.hoseDiameter?.toString() || '25'),
          cell(config.demandConfig?.hoseDiameter?.toString() || '25'),
          cell(config.demandConfig?.hoseLength?.toString() || '30'),
          cell('Simples')
        ]})
      ]
    }),
    new Paragraph({ children: [new TextRun({ text: 'BOMBA PARA O SISTEMA', bold: true, size: 18 })], spacing: { before: 200, after: 50 } }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [headerCell('Vazão (L/min)'), headerCell('Pressão (mca)'), headerCell('Potência (CV)')] }),
        new TableRow({ children: [
          cell(pump.totalFlowLmin?.toFixed(0) || config.demandConfig?.totalFlow?.toString() || '-'),
          cell(pump.minPressure?.toFixed(2) || '-'),
          cell(pump.commercialPowerCV?.toString() || '-')
        ]})
      ]
    }),
    new Paragraph({ children: [new TextRun({ text: 'RESERVATÓRIO', bold: true, size: 18 })], spacing: { before: 200, after: 50 } }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [headerCell('Volume (L)'), headerCell('Tempo Reserva (min)')] }),
        new TableRow({ children: [
          cell(reserve.volumeLiters?.toLocaleString() || config.demandConfig?.reserveVolume?.toLocaleString() || '-'),
          cell(reserve.timeMinutes?.toString() || '-')
        ]})
      ]
    })
  ];
}

// Separation Table from saved calculation (NTCB 09/2020)
function createSeparationTableFromCalc(separationCalc: any): (Paragraph | Table)[] {
  const calculations = separationCalc?.calculations || [];
  const buildings = separationCalc?.buildings || [];
  
  if (calculations.length === 0) {
    return [];
  }

  const rows: TableRow[] = [
    new TableRow({
      children: [
        headerCell('Edificação Expositora'),
        headerCell('Edificação Em Exposição'),
        headerCell('Dist. Exigida (m)'),
        headerCell('Dist. Existente (m)'),
        headerCell('Status')
      ]
    })
  ];

  calculations.forEach((calc: any) => {
    const result = calc.result || {};
    rows.push(new TableRow({
      children: [
        cell(result.scenario1?.expositoraName || 'Expositora', { align: AlignmentType.LEFT }),
        cell(result.scenario1?.emExposicaoName || 'Em Exposição', { align: AlignmentType.LEFT }),
        cell(result.minimumDistance?.toFixed(2) || '-'),
        cell(calc.existingDistance?.toFixed(2) || '-'),
        cell(result.isCompliant ? 'ATENDE' : 'NÃO ATENDE')
      ]
    }));
  });

  return [
    new Paragraph({
      children: [new TextRun({ text: '3.1 ISOLAMENTO DE RISCO POR CÁLCULO DE SEPARAÇÃO', bold: true, size: 20 })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 300, after: 100 }
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Esta medida de segurança foi dimensionada atendendo à NTCB 09 do Corpo de Bombeiros Militar de Mato Grosso.', size: 18, italics: true })],
      spacing: { after: 100 }
    }),
    new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows })
  ];
}

// Separation Table (NTCB 09/2020)
function createSeparationTable(formData: ProjectFormData): (Paragraph | Table)[] {
  const buildings = formData.buildings || [];
  
  if (buildings.length < 2) {
    return [];
  }

  const rows: TableRow[] = [
    new TableRow({
      children: [
        headerCell('Edificação A'),
        headerCell('Edificação B'),
        headerCell('Carga Incêndio (MJ/m²)'),
        headerCell('Dist. Atual (m)'),
        headerCell('Observação')
      ]
    })
  ];

  // Generate pairs
  for (let i = 0; i < buildings.length; i++) {
    for (let j = i + 1; j < buildings.length; j++) {
      const buildingA = buildings[i];
      const buildingB = buildings[j];
      
      // Calculate average fire load
      const avgLoadA = calculateAverageFireLoad(buildingA);
      const avgLoadB = calculateAverageFireLoad(buildingB);

      rows.push(new TableRow({
        children: [
          cell(buildingA.name, { align: AlignmentType.LEFT }),
          cell(buildingB.name, { align: AlignmentType.LEFT }),
          cell(`${avgLoadA} / ${avgLoadB}`),
          cell(formData.actualSeparationDistance?.toFixed(2) || '-'),
          cell('Ver memorial de cálculo', { align: AlignmentType.LEFT })
        ]
      }));
    }
  }

  return [
    new Paragraph({
      children: [new TextRun({ text: 'SEPARAÇÃO ENTRE EDIFICAÇÕES (NTCB 09/2020)', bold: true, size: 20 })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 300, after: 100 }
    }),
    new Paragraph({
      children: [new TextRun({ text: 'A separação entre edificações deve atender aos critérios da NTCB 09/2020.', size: 16, italics: true })],
      spacing: { after: 100 }
    }),
    new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows })
  ];
}

// Helper function to calculate average fire load of a building
function calculateAverageFireLoad(building: ProjectBuildingData): number {
  let totalLoad = 0;
  let sectorCount = 0;
  
  (building.floors || []).forEach(floor => {
    (floor.sectors || []).forEach(sector => {
      totalLoad += sector.fireLoad || 300;
      sectorCount++;
    });
  });
  
  return sectorCount > 0 ? Math.round(totalLoad / sectorCount) : 300;
}

export default AnnexGReport;
