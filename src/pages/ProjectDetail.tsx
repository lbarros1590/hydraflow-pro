/**
 * Project Detail - View single project
 */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowLeft,
  Pencil,
  Calculator,
  FileText,
  Building2,
  MapPin,
  User,
  Ruler,
  Flame,
  AlertTriangle,
  CheckCircle,
  Share2,
  FolderOpen,
  Loader2,
} from 'lucide-react';
import type { ProjectFormData, ProjectStatus } from '@/components/Wizard/types';
import { FileManager } from '@/components/ProjectFiles/FileManager';
import { ShareProjectDialog } from '@/components/Sharing/ShareProjectDialog';
import { EmergencyExitResults } from '@/components/Project/EmergencyExitResults';
import { SeparationResults } from '@/components/Project/SeparationResults';
import { AnnexGReport } from '@/components/Project/AnnexGReport';
import { SavedCalculationsPanel } from '@/components/Project/SavedCalculationsPanel';

interface Project {
  id: string;
  data: ProjectFormData;
  status: ProjectStatus;
  risk_class: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

const statusConfig = {
  rascunho: { label: 'Rascunho', color: 'bg-muted text-muted-foreground', icon: AlertTriangle },
  em_andamento: { label: 'Em Andamento', color: 'bg-warning/10 text-warning', icon: Flame },
  concluido: { label: 'Concluído', color: 'bg-success/10 text-success', icon: CheckCircle },
};

const riskColors = {
  baixo: 'bg-success/10 text-success border-success/30',
  medio: 'bg-warning/10 text-warning border-warning/30',
  alto: 'bg-destructive/10 text-destructive border-destructive/30',
};

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (id) fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProject(data as Project);
    } catch (error) {
      console.error('Error fetching project:', error);
      toast({
        title: 'Erro',
        description: 'Projeto não encontrado.',
        variant: 'destructive',
      });
      navigate('/app/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: ProjectStatus) => {
    if (!project) return;
    
    setUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('id', project.id);

      if (error) throw error;
      
      setProject({ ...project, status: newStatus });
      toast({ 
        title: 'Status atualizado', 
        description: `Projeto marcado como "${statusConfig[newStatus].label}"` 
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({ title: 'Erro', description: 'Não foi possível atualizar o status.', variant: 'destructive' });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isOwner = user?.id === project?.user_id;

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!project) return null;

  const data = project.data;
  const StatusIcon = statusConfig[project.status]?.icon || AlertTriangle;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/app/projects')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{data.projectName}</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {data.address}, {data.city} - {data.state}
          </p>
        </div>
        <div className="flex gap-2">
          {isOwner && (
            <ShareProjectDialog 
              projectId={id!} 
              projectName={data.projectName}
              trigger={
                <Button variant="outline" size="icon">
                  <Share2 className="w-4 h-4" />
                </Button>
              }
            />
          )}
          <Button variant="outline" onClick={() => navigate(`/app/projects/${id}/edit`)} className="gap-2">
            <Pencil className="w-4 h-4" />
            Editar
          </Button>
          <Button onClick={() => navigate(`/app/projects/${id}/hydraulic`)} className="gap-2">
            <Calculator className="w-4 h-4" />
            Calculadora
          </Button>
        </div>
      </div>

      {/* Status and Risk */}
      <div className="flex flex-wrap gap-3">
        <Badge variant="secondary" className={`${statusConfig[project.status]?.color} gap-2`}>
          <StatusIcon className="w-3 h-3" />
          {statusConfig[project.status]?.label}
        </Badge>
        <Badge variant="outline" className={riskColors[project.risk_class as keyof typeof riskColors]}>
          Risco {project.risk_class}
        </Badge>
        <Badge variant="outline">
          Processo: {data.processType?.toUpperCase()}
        </Badge>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="info">Informações</TabsTrigger>
          <TabsTrigger value="calculations">Cálculos</TabsTrigger>
          <TabsTrigger value="files" className="gap-2">
            <FolderOpen className="w-4 h-4" />
            Arquivos
          </TabsTrigger>
          <TabsTrigger value="actions">Ações</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Identification Card */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="w-5 h-5 text-primary" />
                  Identificação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Proprietário</p>
                  <p className="font-medium">{data.owner}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Responsável Técnico</p>
                  <p className="font-medium">{data.technicalResponsible}</p>
                </div>
                <Separator />
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Criado em {formatDate(project.created_at)}</p>
                  <p>Atualizado em {formatDate(project.updated_at)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Geometry Card */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Ruler className="w-5 h-5 text-primary" />
                  Geometria
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Área Total</p>
                    <p className="font-medium font-mono">{data.totalArea?.toLocaleString()} m²</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Altura</p>
                    <p className="font-medium font-mono">{data.totalHeight} m</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Nº Pavimentos</p>
                    <p className="font-medium font-mono">{data.numberOfFloors}</p>
                  </div>
                </div>
                {data.specialRisks && data.specialRisks.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Riscos Especiais</p>
                      <div className="flex flex-wrap gap-2">
                        {data.specialRisks.map(risk => (
                          <Badge key={risk} variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
                            {risk}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Sectors Card */}
            <Card className="bg-card border-border md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="w-5 h-5 text-primary" />
                  Setores / Ocupações
                </CardTitle>
                <CardDescription>
                  {data.sectors?.length || 0} setor(es) cadastrado(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data.sectors && data.sectors.length > 0 ? (
                  <div className="space-y-3">
                    {data.sectors.map((sector, index) => (
                      <div 
                        key={sector.id || index}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border"
                      >
                        <div>
                          <p className="font-medium">{sector.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {sector.occupancyCode} - {sector.occupancyName || 'Ocupação não especificada'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-medium">{sector.area?.toLocaleString()} m²</p>
                          <p className="text-sm text-muted-foreground">
                            Carga: {sector.fireLoad || 'N/A'} MJ/m²
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhum setor cadastrado
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Measures Card */}
            {data.mandatoryMeasures && data.mandatoryMeasures.length > 0 && (
              <Card className="bg-card border-border md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Flame className="w-5 h-5 text-primary" />
                    Medidas de Proteção
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {data.mandatoryMeasures.map((measure) => (
                      <Badge 
                        key={measure} 
                        variant={data.exemptMeasures?.includes(measure) ? 'outline' : 'secondary'}
                        className={data.exemptMeasures?.includes(measure) ? 'line-through opacity-50' : ''}
                      >
                        {measure}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="calculations" className="mt-6 space-y-6">
          {/* Cálculos Salvos */}
          <SavedCalculationsPanel projectId={id!} />
          
          {/* Cálculos em tempo real (baseado nos dados do projeto) */}
          <EmergencyExitResults 
            buildings={data.buildings || []} 
            projectName={data.projectName} 
          />
          <SeparationResults 
            buildings={data.buildings || []} 
            projectName={data.projectName}
            actualDistance={data.actualSeparationDistance}
            hasFireDepartment={data.hasFireDepartment}
          />
        </TabsContent>

        <TabsContent value="files" className="mt-6">
          <FileManager projectId={id!} />
        </TabsContent>

        <TabsContent value="actions" className="mt-6 space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Relatórios e Documentos</CardTitle>
              <CardDescription>Gere relatórios formatados para o projeto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <AnnexGReport formData={data} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Calculadoras e Ferramentas</CardTitle>
              <CardDescription>Acesse as ferramentas de cálculo do projeto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button onClick={() => navigate(`/app/projects/${id}/hydraulic`)} className="gap-2">
                  <Calculator className="w-4 h-4" />
                  Calculadora Hidráulica
                </Button>
                <Button variant="outline" onClick={() => navigate(`/app/projects/${id}/separacao`)} className="gap-2">
                  <Ruler className="w-4 h-4" />
                  Cálculo de Separação
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Status do Projeto</CardTitle>
              <CardDescription>Altere o status do projeto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {project.status !== 'rascunho' && (
                  <Button 
                    variant="outline" 
                    onClick={() => handleUpdateStatus('rascunho')}
                    disabled={updatingStatus}
                    className="gap-2"
                  >
                    {updatingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                    Marcar como Rascunho
                  </Button>
                )}
                {project.status !== 'em_andamento' && (
                  <Button 
                    variant="outline" 
                    onClick={() => handleUpdateStatus('em_andamento')}
                    disabled={updatingStatus}
                    className="gap-2"
                  >
                    {updatingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flame className="w-4 h-4" />}
                    Marcar Em Andamento
                  </Button>
                )}
                {project.status !== 'concluido' && (
                  <Button 
                    onClick={() => handleUpdateStatus('concluido')}
                    disabled={updatingStatus}
                    className="gap-2 bg-green-600 hover:bg-green-700"
                  >
                    {updatingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Marcar como Concluído
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}