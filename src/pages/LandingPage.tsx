/**
 * Landing Page - Public entry point
 */
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Calculator, 
  FileText, 
  Droplets, 
  ChevronRight,
  CheckCircle,
  Building2,
  Flame,
  Users,
  MapPin
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate('/app');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary">Carregando...</div>
      </div>
    );
  }

  const features = [
    {
      icon: Building2,
      title: 'Classificação Inteligente',
      description: 'Busca automática por CNAE e classificação NTCB com cálculo de carga de incêndio.'
    },
    {
      icon: Calculator,
      title: 'Cálculo Hidráulico',
      description: 'Dimensionamento completo de redes de hidrantes com Hardy-Cross e Hazen-Williams.'
    },
    {
      icon: FileText,
      title: 'Anexo G Automático',
      description: 'Geração automática do memorial descritivo no padrão do Corpo de Bombeiros.'
    },
    {
      icon: Droplets,
      title: 'Visualização da Rede',
      description: 'Interface gráfica para desenho e análise da rede hidráulica.'
    }
  ];

  const benefits = [
    'Redução de 80% no tempo de projeto',
    'Conformidade garantida com NTCB-MT',
    'Cálculos validados automaticamente',
    'Suporte técnico especializado'
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Flame className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-foreground">HydraFlow</h1>
              <p className="text-xs text-muted-foreground">PSCIP Engineering</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/auth')}>
              Entrar
            </Button>
            <Button onClick={() => navigate('/auth?mode=signup')}>
              Criar Conta
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-6 px-4 py-2">
            <MapPin className="w-3 h-3 mr-2" />
            Disponível para Mato Grosso
          </Badge>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Projete sistemas de
            <span className="text-primary"> proteção contra incêndio</span>
            <br />com precisão e velocidade
          </h2>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Plataforma completa para engenheiros e projetistas. 
            Da classificação da edificação ao memorial descritivo, 
            tudo em conformidade com as normas NTCB.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/auth?mode=signup')} className="gap-2">
              Começar Gratuitamente
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/auth')}>
              Já tenho conta
            </Button>
          </div>

          {/* Trust badges */}
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-success" />
              <span>Dados seguros</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span>+100 engenheiros</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              <span>Normas atualizadas</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-4">
            Tudo que você precisa em um só lugar
          </h3>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Ferramentas profissionais desenvolvidas por engenheiros, para engenheiros.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="bg-card border-border hover:border-primary/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-2">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-6">
                Acelere seus projetos de PSCIP
              </h3>
              <p className="text-muted-foreground mb-8">
                Nossa plataforma automatiza os cálculos mais complexos e garante 
                conformidade com as normas técnicas do Corpo de Bombeiros de Mato Grosso.
              </p>
              
              <ul className="space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="aspect-video rounded-lg bg-muted/50 flex items-center justify-center border border-border">
                  <div className="text-center">
                    <Calculator className="w-16 h-16 text-primary/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">Preview do sistema</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary/5 border-t border-border">
        <div className="container mx-auto text-center max-w-2xl">
          <h3 className="text-3xl font-bold mb-4">
            Pronto para começar?
          </h3>
          <p className="text-muted-foreground mb-8">
            Crie sua conta gratuitamente e comece a projetar sistemas de 
            proteção contra incêndio com a eficiência que você merece.
          </p>
          <Button size="lg" onClick={() => navigate('/auth?mode=signup')} className="gap-2">
            Criar Conta Grátis
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© 2024 HydraFlow PSCIP. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacidade</a>
            <a href="#" className="hover:text-foreground transition-colors">Suporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
