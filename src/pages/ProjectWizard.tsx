/**
 * Project Wizard - 4-step creation flow with Supabase
 */
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { projectFormSchema, type ProjectFormData, type ProjectStatus } from '@/components/Wizard/types';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  Save,
  Building2,
  Ruler,
  Tag,
  ClipboardCheck,
  Check,
  Home,
  Loader2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Step Components
import { IdentificationStep } from '@/components/Wizard/Steps/IdentificationStep';
import { GeometryStep } from '@/components/Wizard/Steps/GeometryStep';
import { ClassificationStep } from '@/components/Wizard/Steps/ClassificationStep';
import { MeasuresStep } from '@/components/Wizard/Steps/MeasuresStep';

const STEPS = [
  { id: 'identification', title: 'Identificação', icon: Building2, description: 'Dados do projeto' },
  { id: 'geometry', title: 'Geometria', icon: Ruler, description: 'Área e altura' },
  { id: 'classification', title: 'Classificação', icon: Tag, description: 'Ocupação NTCB' },
  { id: 'measures', title: 'Medidas', icon: ClipboardCheck, description: 'Exigências' },
] as const;

type StepId = typeof STEPS[number]['id'];

const defaultValues: ProjectFormData = {
  projectName: '',
  owner: '',
  technicalResponsible: '',
  address: '',
  city: '',
  state: 'MT',
  processType: 'pscip',
  totalHeight: 0,
  totalArea: 0,
  numberOfFloors: 1,
  specialRisks: [],
  sectors: [],
  mandatoryMeasures: [],
  exemptMeasures: [],
};

function calculateRiskClass(data: ProjectFormData): 'baixo' | 'medio' | 'alto' {
  if (!data.sectors || data.sectors.length === 0) return 'medio';
  const maxFireLoad = Math.max(...data.sectors.map(s => s.fireLoad || 300));
  const hasSpecialRisks = data.specialRisks && data.specialRisks.length > 0;
  if (maxFireLoad > 1200 || hasSpecialRisks) return 'alto';
  if (maxFireLoad > 300) return 'medio';
  return 'baixo';
}

export default function ProjectWizard() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = id && id !== 'new';
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState<StepId>('identification');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!isEditing);

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  // Load existing project if editing
  useEffect(() => {
    if (isEditing && id) {
      loadProject(id);
    }
  }, [id, isEditing]);

  const loadProject = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) throw error;
      if (data) {
        form.reset(data.data as ProjectFormData);
      }
    } catch (error) {
      console.error('Error loading project:', error);
      toast({ title: 'Erro', description: 'Projeto não encontrado.', variant: 'destructive' });
      navigate('/app/projects');
    } finally {
      setInitialLoading(false);
    }
  };

  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);

  const validateCurrentStep = async (): Promise<boolean> => {
    const fieldsToValidate: Record<StepId, (keyof ProjectFormData)[]> = {
      identification: ['projectName', 'owner', 'technicalResponsible', 'address', 'city', 'processType'],
      geometry: ['totalHeight', 'totalArea', 'numberOfFloors'],
      classification: ['sectors'],
      measures: [],
    };

    const fields = fieldsToValidate[currentStep];
    if (fields.length === 0) return true;
    return await form.trigger(fields);
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos antes de continuar.',
        variant: 'destructive',
      });
      return;
    }

    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentStepIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(STEPS[currentStepIndex - 1].id);
    }
  };

  const handleSave = async (status: ProjectStatus = 'em_andamento') => {
    if (!user) return;
    
    setLoading(true);
    const data = form.getValues();
    const riskClass = calculateRiskClass(data);
    
    try {
      if (isEditing && id) {
        const { error } = await supabase
          .from('projects')
          .update({
            data: JSON.parse(JSON.stringify(data)),
            status,
            risk_class: riskClass,
          })
          .eq('id', id);

        if (error) throw error;
        toast({ title: 'Projeto atualizado', description: 'As alterações foram salvas com sucesso.' });
        
        if (status === 'em_andamento') {
          navigate(`/app/projects/${id}/hydraulic`);
        }
      } else {
        const { data: newProject, error } = await supabase
          .from('projects')
          .insert([{
            user_id: user.id,
            state_code: data.state || 'MT',
            data: JSON.parse(JSON.stringify(data)),
            status,
            risk_class: riskClass,
          }])
          .select()
          .single();

        if (error) throw error;
        toast({ title: 'Projeto criado', description: 'O projeto foi salvo com sucesso.' });
        
        if (newProject && status === 'em_andamento') {
          navigate(`/app/projects/${newProject.id}/hydraulic`);
        }
      }
    } catch (error) {
      console.error('Error saving project:', error);
      toast({ title: 'Erro', description: 'Não foi possível salvar o projeto.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      const errors = form.formState.errors;
      console.log('Form validation errors:', errors);
      
      // Find which fields are failing
      const errorFields = Object.keys(errors);
      let errorMessage = 'Preencha todos os campos obrigatórios.';
      
      if (errorFields.length > 0) {
        const fieldLabels: Record<string, string> = {
          projectName: 'Nome do projeto',
          owner: 'Proprietário',
          technicalResponsible: 'Responsável técnico',
          address: 'Endereço',
          city: 'Cidade',
          totalArea: 'Área total',
          totalHeight: 'Altura',
          numberOfFloors: 'Pavimentos',
          sectors: 'Setores',
        };
        const failedFields = errorFields.map(f => fieldLabels[f] || f).join(', ');
        errorMessage = `Campos com erro: ${failedFields}`;
      }
      
      toast({
        title: 'Formulário incompleto',
        description: errorMessage,
        variant: 'destructive',
      });
      return;
    }
    await handleSave('em_andamento');
  };

  if (initialLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/app/projects">
                <Button variant="ghost" size="icon">
                  <Home className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold">
                  {isEditing ? 'Editar Projeto' : 'Novo Projeto'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Assistente de criação PSCIP - Mato Grosso
                </p>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => handleSave('rascunho')}
              disabled={loading}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Salvar Rascunho
            </Button>
          </div>
        </div>
      </header>

      {/* Stepper */}
      <div className="border-b border-border/50 bg-card/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = index < currentStepIndex;
              
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <button
                    onClick={() => index <= currentStepIndex && setCurrentStep(step.id)}
                    disabled={index > currentStepIndex}
                    className={`flex flex-col items-center gap-2 transition-all ${
                      index <= currentStepIndex ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                    }`}
                  >
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center transition-all
                      ${isActive 
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
                        : isCompleted 
                          ? 'bg-primary/20 text-primary' 
                          : 'bg-muted text-muted-foreground'
                      }
                    `}>
                      {isCompleted ? <Check className="h-5 w-5" /> : <StepIcon className="h-5 w-5" />}
                    </div>
                    <div className="text-center">
                      <p className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-muted-foreground hidden sm:block">
                        {step.description}
                      </p>
                    </div>
                  </button>
                  
                  {index < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      index < currentStepIndex ? 'bg-primary' : 'bg-border'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 pb-24">
        <Form {...form}>
          <form className="max-w-4xl mx-auto">
            {currentStep === 'identification' && <IdentificationStep form={form} />}
            {currentStep === 'geometry' && <GeometryStep form={form} />}
            {currentStep === 'classification' && <ClassificationStep form={form} />}
            {currentStep === 'measures' && <MeasuresStep form={form} />}
          </form>
        </Form>
      </div>

      {/* Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border/50 bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStepIndex === 0}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>

            <span className="text-sm text-muted-foreground">
              Etapa {currentStepIndex + 1} de {STEPS.length}
            </span>

            {currentStepIndex === STEPS.length - 1 ? (
              <Button onClick={handleFinish} disabled={loading} className="gap-2">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    Finalizar e Calcular
                    <Check className="h-4 w-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleNext} className="gap-2">
                Próximo
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}