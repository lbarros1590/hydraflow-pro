/**
 * Checklist de Tabelas Obrigatórias do Anexo G
 */
import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ClipboardCheck, FileText, Info, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TableRequirement {
  table: string;
  sheet: string;
  description: string;
  ntcb?: string;
}

// Mapeamento de medidas para tabelas obrigatórias
const REQUIRED_TABLES_MAP: Record<string, TableRequirement[]> = {
  // Identificação e classificação
  identificacao: [
    { table: 'Tabela 1.1', sheet: 'Folha 1-A', description: 'Identificação do projeto', ntcb: 'NTCB 01' },
    { table: 'Tabela 2.1', sheet: 'Folha 1-A', description: 'Dados da edificação', ntcb: 'NTCB 01' },
  ],
  classificacao: [
    { table: 'Tabela 2.2', sheet: 'Folha 1-A', description: 'Classificação da ocupação', ntcb: 'NTCB 01' },
    { table: 'Tabela 2.3', sheet: 'Folha 1-A', description: 'Dados dos setores', ntcb: 'NTCB 01' },
  ],
  carga_incendio: [
    { table: 'Tabela 5.1.2', sheet: 'Folha 1-B', description: 'Cálculo de carga de incêndio', ntcb: 'NTCB 07' },
  ],
  separacao: [
    { table: 'Tabela 3.1', sheet: 'Folha 1-B', description: 'Separação entre edificações', ntcb: 'NTCB 09' },
  ],
  // Medidas de proteção
  extintores: [
    { table: 'Tabela 6.4', sheet: 'Folha 2-A', description: 'Distribuição de extintores', ntcb: 'NTCB 18' },
    { table: 'Tabela 6.4.1', sheet: 'Folha 2-A', description: 'Especificação dos extintores', ntcb: 'NTCB 18' },
  ],
  sinalizacao: [
    { table: 'Tabela 6.5', sheet: 'Folha 2-A', description: 'Sinalização de emergência', ntcb: 'NTCB 23' },
  ],
  iluminacao: [
    { table: 'Tabela 6.6', sheet: 'Folha 2-A', description: 'Iluminação de emergência', ntcb: 'NTCB 25' },
  ],
  saidas: [
    { table: 'Tabela 6.3', sheet: 'Folha 2-A', description: 'Dimensionamento de saídas', ntcb: 'NTCB 13' },
    { table: 'Tabela 6.3.1', sheet: 'Folha 2-A', description: 'Cálculo de população', ntcb: 'NTCB 13' },
  ],
  alarme: [
    { table: 'Tabela 6.8', sheet: 'Folha 2-B', description: 'Sistema de alarme', ntcb: 'NTCB 17' },
  ],
  deteccao: [
    { table: 'Tabela 6.9', sheet: 'Folha 2-B', description: 'Sistema de detecção', ntcb: 'NTCB 17' },
  ],
  hidrantes: [
    { table: 'Tabela 6.2', sheet: 'Folha 3-A', description: 'Características do sistema', ntcb: 'NTCB 19' },
    { table: 'Tabela 6.7', sheet: 'Folha 3-B', description: 'Memorial de cálculo hidráulico', ntcb: 'NTCB 19' },
    { table: 'Tabela 6.7.1', sheet: 'Folha 3-B', description: 'Dados da bomba', ntcb: 'NTCB 19' },
  ],
  spk: [
    { table: 'Tabela 6.10', sheet: 'Folha 4-A', description: 'Sistema de chuveiros automáticos', ntcb: 'NTCB 20' },
    { table: 'Tabela 6.10.1', sheet: 'Folha 4-A', description: 'Memorial SPK', ntcb: 'NTCB 20' },
  ],
  brigada: [
    { table: 'Tabela 6.11', sheet: 'Folha 5-A', description: 'Dimensionamento da brigada', ntcb: 'NTCB 27' },
  ],
  ppcip: [
    { table: 'Tabela 6.12', sheet: 'Folha 5-A', description: 'Plano de emergência', ntcb: 'NTCB 01' },
  ],
};

interface RequiredTablesProps {
  mandatoryMeasures: string[];
  exemptMeasures: string[];
  voluntaryMeasures: string[];
  checkedTables: string[];
  onTableCheck: (tableId: string, checked: boolean) => void;
}

export function RequiredTables({
  mandatoryMeasures,
  exemptMeasures,
  voluntaryMeasures,
  checkedTables,
  onTableCheck,
}: RequiredTablesProps) {
  // Calcular todas as tabelas necessárias
  const requiredTables = useMemo(() => {
    const allMeasures = [
      'identificacao',
      'classificacao',
      ...mandatoryMeasures.filter(m => !exemptMeasures.includes(m)),
      ...voluntaryMeasures,
    ];

    const tables: (TableRequirement & { measureId: string })[] = [];

    allMeasures.forEach(measureId => {
      const measureTables = REQUIRED_TABLES_MAP[measureId];
      if (measureTables) {
        measureTables.forEach(t => {
          if (!tables.some(existing => existing.table === t.table)) {
            tables.push({ ...t, measureId });
          }
        });
      }
    });

    // Ordenar por folha
    return tables.sort((a, b) => a.sheet.localeCompare(b.sheet));
  }, [mandatoryMeasures, exemptMeasures, voluntaryMeasures]);

  // Agrupar por folha
  const tablesBySheet = useMemo(() => {
    const grouped: Record<string, typeof requiredTables> = {};
    requiredTables.forEach(t => {
      if (!grouped[t.sheet]) grouped[t.sheet] = [];
      grouped[t.sheet].push(t);
    });
    return grouped;
  }, [requiredTables]);

  const completedCount = requiredTables.filter(t => 
    checkedTables.includes(t.table)
  ).length;

  const progress = requiredTables.length > 0 
    ? Math.round((completedCount / requiredTables.length) * 100)
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              Checklist de Tabelas - Anexo G
            </CardTitle>
            <CardDescription>
              Verifique se todas as tabelas obrigatórias foram incluídas no projeto
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{progress}%</p>
            <p className="text-sm text-muted-foreground">
              {completedCount}/{requiredTables.length} tabelas
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress bar */}
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Tables by sheet */}
        {Object.entries(tablesBySheet).map(([sheet, tables]) => (
          <div key={sheet} className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm">{sheet}</h3>
              <Badge variant="outline" className="text-xs">
                {tables.filter(t => checkedTables.includes(t.table)).length}/{tables.length}
              </Badge>
            </div>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead className="w-32">Tabela</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="w-24">NTCB</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tables.map((table) => {
                    const isChecked = checkedTables.includes(table.table);
                    return (
                      <TableRow 
                        key={table.table}
                        className={cn(
                          "cursor-pointer transition-colors",
                          isChecked && "bg-primary/5"
                        )}
                        onClick={() => onTableCheck(table.table, !isChecked)}
                      >
                        <TableCell>
                          <Checkbox 
                            checked={isChecked}
                            onCheckedChange={(checked) => onTableCheck(table.table, !!checked)}
                          />
                        </TableCell>
                        <TableCell className="font-mono font-medium">
                          {table.table}
                        </TableCell>
                        <TableCell>
                          <span className={cn(isChecked && "line-through text-muted-foreground")}>
                            {table.description}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {table.ntcb}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        ))}

        {/* Completion message */}
        {progress === 100 && (
          <Alert className="border-primary/50 bg-primary/5">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <AlertDescription className="ml-2">
              <strong>Todas as tabelas foram verificadas!</strong>
              <br />
              <span className="text-sm text-muted-foreground">
                O projeto está pronto para revisão final.
              </span>
            </AlertDescription>
          </Alert>
        )}

        {/* Info */}
        <Alert className="border-dashed">
          <Info className="h-4 w-4" />
          <AlertDescription className="ml-2 text-sm">
            As tabelas listadas são baseadas nas medidas de proteção obrigatórias e voluntárias 
            selecionadas para este projeto, conforme NTCB 01/2025 - Anexo G.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
