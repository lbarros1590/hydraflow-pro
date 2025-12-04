/**
 * Lista de Cálculos Hidráulicos Salvos no Projeto
 */
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Calculator,
  MoreVertical,
  Trash2,
  Download,
  Play,
  CheckCircle,
  Clock,
} from 'lucide-react';

interface HydraulicCalculation {
  id: string;
  project_id: string;
  name: string;
  version: number;
  is_active: boolean;
  network_data: any;
  results: any;
  accessories: any;
  connections: any;
  report_data: any;
  created_at: string;
}

interface SavedCalculationsProps {
  projectId: string;
  onLoad: (calculation: HydraulicCalculation) => void;
}

export function SavedCalculations({ projectId, onLoad }: SavedCalculationsProps) {
  const { toast } = useToast();
  const [calculations, setCalculations] = useState<HydraulicCalculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchCalculations();
  }, [projectId]);

  const fetchCalculations = async () => {
    try {
      const { data, error } = await supabase
        .from('hydraulic_calculations')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCalculations((data || []) as HydraulicCalculation[]);
    } catch (error) {
      console.error('Error fetching calculations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from('hydraulic_calculations')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;

      toast({
        title: 'Cálculo excluído',
        description: 'O cálculo foi removido do projeto.',
      });

      fetchCalculations();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o cálculo.',
        variant: 'destructive',
      });
    } finally {
      setDeleteId(null);
    }
  };

  const handleSetActive = async (calcId: string) => {
    try {
      // Desativar todos
      await supabase
        .from('hydraulic_calculations')
        .update({ is_active: false })
        .eq('project_id', projectId);

      // Ativar o selecionado
      const { error } = await supabase
        .from('hydraulic_calculations')
        .update({ is_active: true })
        .eq('id', calcId);

      if (error) throw error;

      toast({
        title: 'Cálculo ativado',
        description: 'Este é agora o cálculo principal do projeto.',
      });

      fetchCalculations();
    } catch (error) {
      console.error('Set active error:', error);
    }
  };

  const handleExport = (calc: HydraulicCalculation) => {
    const exportData = {
      version: '1.0',
      projectName: calc.name,
      createdAt: calc.created_at,
      ...calc.network_data,
      results: calc.results,
      accessories: calc.accessories,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${calc.name.replace(/\s+/g, '_')}_v${calc.version}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Exportado',
      description: 'O cálculo foi exportado em JSON.',
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map(i => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (calculations.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">Nenhum cálculo salvo</p>
            <p className="text-sm mt-1">
              Use o botão "Salvar no Projeto" na calculadora para guardar seus cálculos.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calculator className="h-5 w-5" />
            Cálculos Salvos
          </CardTitle>
          <CardDescription>
            {calculations.length} cálculo(s) armazenado(s) neste projeto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {calculations.map((calc) => (
              <div
                key={calc.id}
                className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                  calc.is_active ? 'border-primary/50 bg-primary/5' : 'bg-muted/30'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${calc.is_active ? 'bg-primary/10' : 'bg-muted'}`}>
                    <Calculator className={`h-5 w-5 ${calc.is_active ? 'text-primary' : ''}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{calc.name}</p>
                      <Badge variant="outline" className="text-xs">
                        v{calc.version}
                      </Badge>
                      {calc.is_active && (
                        <Badge className="text-xs bg-primary">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Ativo
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(calc.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {calc.results && (
                        <>
                          <span>•</span>
                          <span>
                            {calc.results.pump?.flowLps?.toFixed(1)} L/s @ 
                            {calc.results.pump?.headMca?.toFixed(1)} mca
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onLoad(calc)}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Carregar
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {!calc.is_active && (
                        <DropdownMenuItem onClick={() => handleSetActive(calc.id)}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Definir como ativo
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleExport(calc)}>
                        <Download className="h-4 w-4 mr-2" />
                        Exportar JSON
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setDeleteId(calc.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cálculo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O cálculo será permanentemente removido do projeto.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
