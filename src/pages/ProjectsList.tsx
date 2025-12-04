/**
 * Projects List - All user projects with filters
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
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
} from '@/components/ui/alert-dialog';
import {
  Plus,
  Search,
  Building2,
  Pencil,
  Trash2,
  Calculator,
  MoreVertical,
  FolderOpen,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
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

export default function ProjectsList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setProjects((data || []) as Project[]);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os projetos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      
      setProjects(prev => prev.filter(p => p.id !== id));
      toast({
        title: 'Projeto excluído',
        description: 'O projeto foi removido com sucesso.',
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o projeto.',
        variant: 'destructive',
      });
    }
  };

  const filteredProjects = projects.filter(p =>
    p.data.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.data.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Meus Projetos</h1>
          <p className="text-muted-foreground">
            {projects.length} projeto{projects.length !== 1 ? 's' : ''} cadastrado{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => navigate('/app/projects/new')} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Projeto
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar projetos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="bg-card border-border">
              <CardContent className="pt-6 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">
              {searchTerm ? 'Nenhum projeto encontrado' : 'Nenhum projeto ainda'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchTerm 
                ? 'Tente buscar com outros termos' 
                : 'Crie seu primeiro projeto para começar'}
            </p>
            {!searchTerm && (
              <Button onClick={() => navigate('/app/projects/new')} className="gap-2">
                <Plus className="w-4 h-4" />
                Criar Projeto
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <Card 
              key={project.id} 
              className="bg-card border-border hover:border-primary/50 transition-colors group"
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/app/projects/${project.id}/edit`)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/app/projects/${project.id}/hydraulic`)}>
                        <Calculator className="w-4 h-4 mr-2" />
                        Calculadora
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem 
                            onSelect={(e) => e.preventDefault()}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir projeto?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. O projeto "{project.data.projectName}" 
                              será permanentemente excluído.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(project.id)}>
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div 
                  className="cursor-pointer"
                  onClick={() => navigate(`/app/projects/${project.id}`)}
                >
                  <h3 className="font-semibold mb-1 truncate">{project.data.projectName}</h3>
                  <p className="text-sm text-muted-foreground mb-4 truncate">
                    {project.data.city}, {project.data.state}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline" className={riskColors[project.risk_class as keyof typeof riskColors]}>
                      Risco {project.risk_class}
                    </Badge>
                    <Badge variant="secondary" className={statusConfig[project.status]?.color}>
                      {statusConfig[project.status]?.label}
                    </Badge>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Atualizado em {formatDate(project.updated_at)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
