/**
 * App Dashboard - Main dashboard for authenticated users
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  FolderOpen,
  Calculator,
  Clock,
  Building2,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import type { ProjectFormData, ProjectStatus } from '@/components/Wizard/types';

interface Project {
  id: string;
  data: ProjectFormData;
  status: ProjectStatus;
  risk_class: string;
  created_at: string;
  updated_at: string;
}

const statusConfig = {
  rascunho: { label: 'Rascunho', color: 'bg-muted text-muted-foreground' },
  em_andamento: { label: 'Em Andamento', color: 'bg-warning/10 text-warning' },
  concluido: { label: 'Concluído', color: 'bg-success/10 text-success' },
};

const riskColors = {
  baixo: 'bg-success/10 text-success border-success/30',
  medio: 'bg-warning/10 text-warning border-warning/30',
  alto: 'bg-destructive/10 text-destructive border-destructive/30',
};

export default function AppDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setProjects((data || []) as Project[]);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const recentProjects = projects.slice(0, 3);
  const totalProjects = projects.length;
  const inProgressProjects = projects.filter(p => p.status === 'em_andamento').length;
  const completedProjects = projects.filter(p => p.status === 'concluido').length;

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário';

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Olá, {userName}!</h1>
          <p className="text-muted-foreground">
            Bem-vindo ao HydraFlow PSCIP. O que vamos projetar hoje?
          </p>
        </div>
        <Button onClick={() => navigate('/app/projects/new')} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Projeto
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalProjects}</p>
                <p className="text-sm text-muted-foreground">Total de Projetos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inProgressProjects}</p>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedProjects}</p>
                <p className="text-sm text-muted-foreground">Concluídos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card 
          className="bg-card border-border cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => navigate('/app/projects/new')}
        >
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Criar Novo Projeto</h3>
              <p className="text-sm text-muted-foreground">
                Inicie um novo projeto PSCIP com o assistente
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card 
          className="bg-card border-border cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => navigate('/app/calculator')}
        >
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
              <Calculator className="w-6 h-6 text-accent" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Calculadora Hidráulica</h3>
              <p className="text-sm text-muted-foreground">
                Dimensione redes de hidrantes e sprinklers
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Projetos Recentes</CardTitle>
            <CardDescription>Seus últimos projetos editados</CardDescription>
          </div>
          {totalProjects > 0 && (
            <Button variant="ghost" onClick={() => navigate('/app/projects')} className="gap-2">
              Ver Todos
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentProjects.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <FolderOpen className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Nenhum projeto ainda</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Crie seu primeiro projeto para começar
              </p>
              <Button onClick={() => navigate('/app/projects/new')} className="gap-2">
                <Plus className="w-4 h-4" />
                Criar Projeto
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/app/projects/${project.id}`)}
                >
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{project.data.projectName}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {project.data.city}, {project.data.state}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={riskColors[project.risk_class as keyof typeof riskColors]}>
                      {project.risk_class}
                    </Badge>
                    <Badge variant="secondary" className={statusConfig[project.status]?.color}>
                      {statusConfig[project.status]?.label}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert for MT only */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-primary mb-1">Sistema disponível para Mato Grosso</h3>
            <p className="text-sm text-muted-foreground">
              Atualmente o HydraFlow PSCIP está configurado com as normas NTCB do estado de Mato Grosso. 
              Em breve, outros estados estarão disponíveis.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
