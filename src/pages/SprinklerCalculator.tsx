/**
 * SprinklerCalculator - Placeholder for future sprinkler system calculations
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CloudRain, Construction, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function SprinklerCalculator() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-primary/10">
          <CloudRain className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Calculadora de Sprinklers</h1>
          <p className="text-muted-foreground">
            Dimensionamento de sistemas de chuveiros automáticos
          </p>
        </div>
      </div>

      <Alert className="border-amber-500/50 bg-amber-500/5">
        <Construction className="h-5 w-5 text-amber-600" />
        <AlertDescription className="text-amber-700">
          <strong>Em Desenvolvimento</strong>
          <br />
          Esta ferramenta está sendo desenvolvida e estará disponível em breve.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            Funcionalidades Planejadas
          </CardTitle>
          <CardDescription>
            O que você poderá fazer com a calculadora de sprinklers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <Badge variant="secondary" className="mb-2">Classificação</Badge>
              <h3 className="font-medium mb-1">Classificação de Risco</h3>
              <p className="text-sm text-muted-foreground">
                Risco Leve, Ordinário (Grupos 1, 2 e 3) e Extra (Grupos 1 e 2)
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <Badge variant="secondary" className="mb-2">Densidade</Badge>
              <h3 className="font-medium mb-1">Cálculo de Densidade</h3>
              <p className="text-sm text-muted-foreground">
                Densidade de aplicação (mm/min) conforme área de operação
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <Badge variant="secondary" className="mb-2">K-Factor</Badge>
              <h3 className="font-medium mb-1">Seleção de Sprinkler</h3>
              <p className="text-sm text-muted-foreground">
                K-factor, temperatura de acionamento e tipo de resposta
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <Badge variant="secondary" className="mb-2">Hidráulica</Badge>
              <h3 className="font-medium mb-1">Dimensionamento da Rede</h3>
              <p className="text-sm text-muted-foreground">
                Cálculo de vazão, pressão e dimensionamento de tubulações
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Referências Normativas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>NTCB 20</strong> - Sistema de Chuveiros Automáticos (MT)</p>
          <p><strong>NBR 10897</strong> - Sistemas de proteção contra incêndio por chuveiros automáticos</p>
          <p><strong>NFPA 13</strong> - Standard for the Installation of Sprinkler Systems</p>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button asChild variant="outline">
          <Link to="/app/calculator">
            Usar Calculadora de Hidrantes
          </Link>
        </Button>
      </div>
    </div>
  );
}
