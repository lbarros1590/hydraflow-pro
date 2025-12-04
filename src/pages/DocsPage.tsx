/**
 * DocsPage - NTCB Documentation with State Filter
 */
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BookOpen, FileText, Calculator, Droplets, Building2, ExternalLink, Globe, Info, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AvailableState {
  code: string;
  name: string;
  is_active: boolean;
  regulations_version: string | null;
}

interface Regulation {
  id: string;
  state_code: string;
  code: string;
  title: string;
  description: string | null;
  category: string | null;
  file_url: string | null;
  version: string | null;
}

const ocupacoes = [
  { divisao: 'A-1', descricao: 'Residencial unifamiliar', carga: 300, risco: 'Baixo' },
  { divisao: 'A-2', descricao: 'Residencial multifamiliar', carga: 300, risco: 'Baixo' },
  { divisao: 'B-1', descricao: 'Hotel', carga: 500, risco: 'Médio' },
  { divisao: 'C-1', descricao: 'Comércio pequeno porte', carga: 700, risco: 'Médio' },
  { divisao: 'C-2', descricao: 'Comércio médio/grande porte', carga: 800, risco: 'Médio' },
  { divisao: 'D-1', descricao: 'Escritório', carga: 700, risco: 'Médio' },
  { divisao: 'E-1', descricao: 'Escola em geral', carga: 300, risco: 'Baixo' },
  { divisao: 'F-1', descricao: 'Local de reunião de público', carga: 500, risco: 'Médio' },
  { divisao: 'G-1', descricao: 'Garagem', carga: 300, risco: 'Baixo' },
  { divisao: 'H-1', descricao: 'Hospital', carga: 300, risco: 'Baixo' },
  { divisao: 'I-1', descricao: 'Indústria baixo risco', carga: 500, risco: 'Médio' },
  { divisao: 'I-2', descricao: 'Indústria médio risco', carga: 1000, risco: 'Médio' },
  { divisao: 'I-3', descricao: 'Indústria alto risco', carga: 2000, risco: 'Alto' },
];

const tiposHidrante = [
  { tipo: '1', vazao: 80, pressao: 10, mangueira: '25mm', rti: '≤ 300 MJ/m²', aplicacao: 'Risco Baixo' },
  { tipo: '2', vazao: 300, pressao: 25, mangueira: '40mm', rti: '300-1200 MJ/m²', aplicacao: 'Risco Médio' },
  { tipo: '3', vazao: 600, pressao: 40, mangueira: '65mm', rti: '> 1200 MJ/m²', aplicacao: 'Risco Alto' },
];

const reservatorios = [
  { tipo: '1', volume: 5000, tempo: 30, hidrantes: 1 },
  { tipo: '2', volume: 12000, tempo: 30, hidrantes: 2 },
  { tipo: '3', volume: 25000, tempo: 30, hidrantes: 4 },
];

export default function DocsPage() {
  const [states, setStates] = useState<AvailableState[]>([]);
  const [selectedState, setSelectedState] = useState<string>('MT');
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStates() {
      const { data, error } = await supabase
        .from('available_states')
        .select('*')
        .order('name');
      
      if (!error && data) {
        setStates(data);
      }
    }
    fetchStates();
  }, []);

  useEffect(() => {
    async function fetchRegulations() {
      setLoading(true);
      const { data, error } = await supabase
        .from('state_regulations')
        .select('*')
        .eq('state_code', selectedState)
        .order('code');
      
      if (!error && data) {
        setRegulations(data);
      }
      setLoading(false);
    }
    fetchRegulations();
  }, [selectedState]);

  const currentState = states.find(s => s.code === selectedState);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary/10">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Documentação Técnica</h1>
            <p className="text-muted-foreground">
              Normas Técnicas do Corpo de Bombeiros
            </p>
          </div>
        </div>

        {/* State Selector */}
        <div className="flex items-center gap-3">
          <Globe className="h-5 w-5 text-muted-foreground" />
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Selecione o estado" />
            </SelectTrigger>
            <SelectContent>
              {states.map((state) => (
                <SelectItem key={state.code} value={state.code}>
                  <div className="flex items-center gap-2">
                    <span>{state.name}</span>
                    {state.is_active ? (
                      <Badge variant="default" className="text-xs">Ativo</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Em breve</Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* State Status Alert */}
      {currentState && !currentState.is_active && (
        <Alert className="border-amber-500/50 bg-amber-500/5">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-700">
            As normas de <strong>{currentState.name}</strong> ainda não estão totalmente cadastradas. 
            Algumas informações podem estar baseadas nas normas de Mato Grosso (NTCB).
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="normas" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="normas" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Normas
          </TabsTrigger>
          <TabsTrigger value="ocupacoes" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Ocupações
          </TabsTrigger>
          <TabsTrigger value="hidrantes" className="flex items-center gap-2">
            <Droplets className="w-4 h-4" />
            Hidrantes
          </TabsTrigger>
          <TabsTrigger value="formulas" className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Fórmulas
          </TabsTrigger>
        </TabsList>

        {/* Normas Tab - Dynamic from Database */}
        <TabsContent value="normas">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-3">
                    <div className="h-4 bg-muted rounded w-1/4 mb-2" />
                    <div className="h-6 bg-muted rounded w-3/4" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : regulations.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {regulations.map((norma) => (
                <Card key={norma.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{norma.code}</Badge>
                      {norma.category && (
                        <Badge variant="secondary">{norma.category}</Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{norma.title}</CardTitle>
                    <CardDescription>{norma.description}</CardDescription>
                  </CardHeader>
                  {norma.file_url && (
                    <CardContent className="pt-0">
                      <a 
                        href={norma.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <Download className="h-4 w-4" />
                        Baixar PDF
                      </a>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhuma norma cadastrada</h3>
                <p className="text-muted-foreground">
                  As normas de {currentState?.name || selectedState} ainda não foram adicionadas ao sistema.
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="w-5 h-5" />
                Links Úteis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>
                  <a 
                    href="https://www.bombeiros.mt.gov.br/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    Portal do Corpo de Bombeiros MT
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a 
                    href="https://www.abnt.org.br/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    ABNT - Associação Brasileira de Normas Técnicas
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ocupações Tab */}
        <TabsContent value="ocupacoes">
          <Card>
            <CardHeader>
              <CardTitle>Classificação de Ocupações (NTCB 01 - Anexo A)</CardTitle>
              <CardDescription>
                Tabela de ocupações com carga de incêndio específica e classificação de risco
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Divisão</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Carga (MJ/m²)</TableHead>
                    <TableHead className="text-center">Risco</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ocupacoes.map((oc) => (
                    <TableRow key={oc.divisao}>
                      <TableCell className="font-medium">{oc.divisao}</TableCell>
                      <TableCell>{oc.descricao}</TableCell>
                      <TableCell className="text-right">{oc.carga}</TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant={oc.risco === 'Baixo' ? 'secondary' : oc.risco === 'Médio' ? 'default' : 'destructive'}
                        >
                          {oc.risco}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hidrantes Tab */}
        <TabsContent value="hidrantes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tipos de Sistema de Hidrantes (NTCB 19)</CardTitle>
              <CardDescription>
                Classificação dos sistemas conforme risco e RTI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Tipo</TableHead>
                    <TableHead>Vazão (L/min)</TableHead>
                    <TableHead>Pressão (mca)</TableHead>
                    <TableHead>Mangueira</TableHead>
                    <TableHead>RTI</TableHead>
                    <TableHead>Aplicação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tiposHidrante.map((tipo) => (
                    <TableRow key={tipo.tipo}>
                      <TableCell className="font-bold">{tipo.tipo}</TableCell>
                      <TableCell>{tipo.vazao}</TableCell>
                      <TableCell>{tipo.pressao}</TableCell>
                      <TableCell>{tipo.mangueira}</TableCell>
                      <TableCell>{tipo.rti}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{tipo.aplicacao}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reserva Técnica de Incêndio</CardTitle>
              <CardDescription>
                Volume mínimo do reservatório por tipo de sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Tipo</TableHead>
                    <TableHead>Volume Mínimo (L)</TableHead>
                    <TableHead>Tempo (min)</TableHead>
                    <TableHead>Hidrantes Simultâneos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservatorios.map((res) => (
                    <TableRow key={res.tipo}>
                      <TableCell className="font-bold">{res.tipo}</TableCell>
                      <TableCell>{res.volume.toLocaleString()}</TableCell>
                      <TableCell>{res.tempo}</TableCell>
                      <TableCell>{res.hidrantes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fórmulas Tab */}
        <TabsContent value="formulas">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Fórmula de Hazen-Williams</CardTitle>
                <CardDescription>Cálculo de perda de carga em tubulações</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg font-mono text-center text-lg">
                  J = 10,643 × Q<sup>1,85</sup> / (C<sup>1,85</sup> × D<sup>4,87</sup>)
                </div>
                <div className="text-sm space-y-1">
                  <p><strong>J</strong> = Perda de carga unitária (m/m)</p>
                  <p><strong>Q</strong> = Vazão (m³/s)</p>
                  <p><strong>C</strong> = Coeficiente de rugosidade</p>
                  <p><strong>D</strong> = Diâmetro interno (m)</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p><strong>Valores de C:</strong></p>
                  <ul className="list-disc list-inside">
                    <li>Aço galvanizado novo: C = 120</li>
                    <li>Cobre: C = 140</li>
                    <li>CPVC: C = 150</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vazão no Esguicho</CardTitle>
                <CardDescription>Cálculo de vazão através de bocais</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg font-mono text-center text-lg">
                  Q = 0,653 × k × √P
                </div>
                <div className="text-sm space-y-1">
                  <p><strong>Q</strong> = Vazão (L/min)</p>
                  <p><strong>k</strong> = Fator do esguicho</p>
                  <p><strong>P</strong> = Pressão (kPa)</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Comprimento Equivalente</CardTitle>
                <CardDescription>Perdas localizadas em acessórios</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg font-mono text-center text-lg">
                  L<sub>eq</sub> = L + Σ L<sub>e</sub>
                </div>
                <div className="text-sm space-y-1">
                  <p><strong>L<sub>eq</sub></strong> = Comprimento equivalente total</p>
                  <p><strong>L</strong> = Comprimento real da tubulação</p>
                  <p><strong>Σ L<sub>e</sub></strong> = Soma dos comprimentos equivalentes</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Altura Manométrica Total</CardTitle>
                <CardDescription>Cálculo para seleção de bomba</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg font-mono text-center text-lg">
                  H<sub>man</sub> = H<sub>g</sub> + ΔP + P<sub>req</sub>
                </div>
                <div className="text-sm space-y-1">
                  <p><strong>H<sub>man</sub></strong> = Altura manométrica (mca)</p>
                  <p><strong>H<sub>g</sub></strong> = Altura geométrica (m)</p>
                  <p><strong>ΔP</strong> = Perda de carga total (mca)</p>
                  <p><strong>P<sub>req</sub></strong> = Pressão requerida (mca)</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
