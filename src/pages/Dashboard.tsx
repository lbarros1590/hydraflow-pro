/**
 * Dashboard - Projects list with empty state
 */
import { Link, useNavigate } from 'react-router-dom';
import { useProject } from '@/contexts/ProjectContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Building2, 
  Flame, 
  Clock, 
  CheckCircle2, 
  FileEdit,
  Trash2,
  Calculator,
  Sparkles
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const riskColors = {
  baixo: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  medio: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  alto: 'bg-red-500/10 text-red-600 border-red-500/20',
};

const statusConfig = {
  rascunho: { label: 'Rascunho', icon: FileEdit, color: 'text-muted-foreground' },
  em_andamento: { label: 'Em Andamento', icon: Clock, color: 'text-amber-500' },
  concluido: { label: 'Concluído', icon: CheckCircle2, color: 'text-emerald-500' },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { projects, deleteProject, setCurrentProject } = useProject();

  const handleOpenProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setCurrentProject(project);
      navigate(`/project/${projectId}/hydraulic`);
    }
  };

  const handleEditProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setCurrentProject(project);
      navigate(`/wizard/${projectId}`);
    }
  };

  if (projects.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
              <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 p-8 rounded-full border border-primary/20">
                <Building2 className="h-16 w-16 text-primary" />
              </div>
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              Bem-vindo ao <span className="text-primary">HydraFlow Pro</span>
            </h1>
            
            <p className="text-muted-foreground text-lg max-w-md mb-8">
              Sistema completo para dimensionamento de sistemas de proteção contra incêndio conforme NTCB/MT.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/wizard/new">
                <Button size="lg" className="gap-2 text-lg px-8">
                  <Plus className="h-5 w-5" />
                  Criar Primeiro Projeto
                </Button>
              </Link>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl">
              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardHeader className="pb-2">
                  <Sparkles className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-base">Classificação Automática</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Busca por CNAE com preenchimento automático da divisão NTCB.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardHeader className="pb-2">
                  <Calculator className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-base">Cálculo Hidráulico</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Dimensionamento completo com Hardy-Cross integrado.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardHeader className="pb-2">
                  <Flame className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-base">Matriz de Exigências</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Geração automática baseada nas normas NTCB 01/2025.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Meus Projetos</h1>
            <p className="text-muted-foreground mt-1">
              {projects.length} projeto{projects.length !== 1 ? 's' : ''} cadastrado{projects.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link to="/wizard/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Projeto
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const StatusIcon = statusConfig[project.status].icon;
            return (
              <Card 
                key={project.id} 
                className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg line-clamp-1">
                          {project.data.projectName}
                        </CardTitle>
                        <CardDescription className="line-clamp-1">
                          {project.data.address}, {project.data.city}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className={riskColors[project.riskClass]}>
                      <Flame className="h-3 w-3 mr-1" />
                      Risco {project.riskClass.charAt(0).toUpperCase() + project.riskClass.slice(1)}
                    </Badge>
                    
                    {project.data.sectors?.[0]?.occupancyCode && (
                      <Badge variant="secondary">
                        {project.data.sectors[0].occupancyCode}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{project.data.totalArea?.toLocaleString()} m²</span>
                    <span>{project.data.totalHeight} m</span>
                    <span>{project.data.numberOfFloors} pav.</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <div className={`flex items-center gap-1.5 text-sm ${statusConfig[project.status].color}`}>
                      <StatusIcon className="h-4 w-4" />
                      {statusConfig[project.status].label}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditProject(project.id)}
                      >
                        <FileEdit className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleOpenProject(project.id)}
                      >
                        <Calculator className="h-4 w-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir projeto?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. O projeto "{project.data.projectName}" será permanentemente excluído.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => deleteProject(project.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
