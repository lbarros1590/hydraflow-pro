/**
 * Project Wizard - 4-step creation flow
 */
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useProject } from '@/contexts/ProjectContext';
import { projectFormSchema, type ProjectFormData } from '@/components/Wizard/types';
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
  Home
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

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

export default function ProjectWizard() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = id && id !== 'new';
  
  const { saveProject, updateProject, getProjectById, setCurrentProject } = useProject();
  const [currentStep, setCurrentStep] = useState<StepId>('identification');

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  // Load existing project if editing
  useEffect(() => {
    if (isEditing) {
      const existingProject = getProjectById(id);
      if (existingProject) {
        form.reset(existingProject.data);
        setCurrentProject(existingProject);
      } else {
        navigate('/');
      }
    }
  }, [id, isEditing, getProjectById, form, navigate, setCurrentProject]);

  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);

  const validateCurrentStep = async (): Promise<boolean> => {
    const fieldsToValidate: Record<StepId, (keyof ProjectFormData)[]> = {
      identification: ['projectName', 'owner', 'technicalResponsible', 'address', 'city', 'processType'],
      geometry: ['totalHeight', 'totalArea', 'numberOfFloors'],
      classification: ['sectors'],
      measures: [],
    };

    const fields = fieldsToValidate[currentStep];
    const result = await form.trigger(fields);
    return result;
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

  const handleSave = async (status: 'rascunho' | 'em_andamento' | 'concluido' = 'em_andamento') => {
    const data = form.getValues();
    
    if (isEditing) {
      updateProject(id, data, status);
      toast({
        title: 'Projeto atualizado',
        description: 'As alterações foram salvas com sucesso.',
      });
    } else {
      const newProject = saveProject(data, status);
      toast({
        title: 'Projeto criado',
        description: 'O projeto foi salvo com sucesso.',
      });
      navigate(`/project/${newProject.id}/hydraulic`);
    }
  };

  const handleFinish = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      toast({
        title: 'Formulário incompleto',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    await handleSave('em_andamento');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <Home className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold">
                  {isEditing ? 'Editar Projeto' : 'Novo Projeto'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Assistente de criação PSCIP
                </p>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => handleSave('rascunho')}
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
      <div className="container mx-auto px-4 py-8">
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
              <Button onClick={handleFinish} className="gap-2">
                Finalizar e Calcular
                <Check className="h-4 w-4" />
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
