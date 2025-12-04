/**
 * Project Input Wizard - Main Component
 * 3-step wizard for PSCIP data entry
 */
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  FileText,
  Building2,
  LayoutGrid,
  ClipboardCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ProjectFormData, projectFormSchema } from './types';
import { GeneralDataStep } from './GeneralDataStep';
import { SectorsStep } from './SectorsStep';
import { ReviewStep } from './ReviewStep';

const STEPS = [
  { id: 'general', label: 'Dados Gerais', icon: Building2 },
  { id: 'sectors', label: 'Setores', icon: LayoutGrid },
  { id: 'review', label: 'Revisão', icon: ClipboardCheck },
] as const;

type StepId = typeof STEPS[number]['id'];

interface ProjectInputWizardProps {
  onComplete?: (data: ProjectFormData) => void;
  initialData?: Partial<ProjectFormData>;
}

export function ProjectInputWizard({ onComplete, initialData }: ProjectInputWizardProps) {
  const [currentStep, setCurrentStep] = useState<StepId>('general');
  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      projectName: initialData?.projectName || '',
      processType: initialData?.processType || 'novo',
      technicalResponsible: initialData?.technicalResponsible || '',
      totalHeight: initialData?.totalHeight || 0,
      totalArea: initialData?.totalArea || 0,
      sectors: initialData?.sectors || [],
    },
    mode: 'onChange',
  });

  const validateCurrentStep = async (): Promise<boolean> => {
    let fieldsToValidate: (keyof ProjectFormData)[] = [];
    
    switch (currentStep) {
      case 'general':
        fieldsToValidate = ['projectName', 'processType', 'technicalResponsible', 'totalHeight', 'totalArea'];
        break;
      case 'sectors':
        fieldsToValidate = ['sectors'];
        break;
      default:
        return true;
    }

    const result = await form.trigger(fieldsToValidate);
    return result;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex].id);
    }
  };

  const handlePrevious = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex].id);
    }
  };

  const handleStepClick = async (stepId: StepId) => {
    const targetIndex = STEPS.findIndex((s) => s.id === stepId);
    
    // Can always go back
    if (targetIndex < currentStepIndex) {
      setCurrentStep(stepId);
      return;
    }

    // Validate all previous steps when going forward
    for (let i = currentStepIndex; i < targetIndex; i++) {
      setCurrentStep(STEPS[i].id);
      const isValid = await validateCurrentStep();
      if (!isValid) {
        toast.error('Complete os passos anteriores primeiro');
        return;
      }
    }
    
    setCurrentStep(stepId);
  };

  const onSubmit = (data: ProjectFormData) => {
    toast.success('Projeto salvo com sucesso!');
    onComplete?.(data);
  };

  const handleGenerateReport = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      toast.error('Verifique os dados do formulário');
      return;
    }

    const data = form.getValues();
    toast.success('Gerando matriz de exigências...');
    onComplete?.(data);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          Cadastro de Edificação
        </h1>
        <p className="text-muted-foreground mt-2">
          Preencha os dados da edificação para gerar o PSCIP conforme NTCB 01/2025
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs value={currentStep} onValueChange={(v) => handleStepClick(v as StepId)}>
            {/* Step Indicator */}
            <TabsList className="grid w-full grid-cols-3 mb-8">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = index < currentStepIndex;
                const isCurrent = step.id === currentStep;
                
                return (
                  <TabsTrigger
                    key={step.id}
                    value={step.id}
                    className={`flex items-center gap-2 ${
                      isCompleted ? 'text-primary' : ''
                    }`}
                  >
                    <span className={`
                      w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                      ${isCompleted ? 'bg-primary text-primary-foreground' : ''}
                      ${isCurrent ? 'bg-primary/20 text-primary' : ''}
                      ${!isCompleted && !isCurrent ? 'bg-muted text-muted-foreground' : ''}
                    `}>
                      {isCompleted ? '✓' : index + 1}
                    </span>
                    <Icon className="h-4 w-4 hidden sm:block" />
                    <span className="hidden sm:inline">{step.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Step Content */}
            <TabsContent value="general" className="mt-0">
              <GeneralDataStep form={form} />
            </TabsContent>

            <TabsContent value="sectors" className="mt-0">
              <SectorsStep form={form} />
            </TabsContent>

            <TabsContent value="review" className="mt-0">
              <ReviewStep form={form} />
            </TabsContent>
          </Tabs>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStepIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              Passo {currentStepIndex + 1} de {STEPS.length}
            </div>

            {currentStepIndex === STEPS.length - 1 ? (
              <Button
                type="button"
                onClick={handleGenerateReport}
                className="bg-primary hover:bg-primary/90"
              >
                <Save className="h-4 w-4 mr-2" />
                Gerar Matriz de Exigências
              </Button>
            ) : (
              <Button type="button" onClick={handleNext}>
                Próximo
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
