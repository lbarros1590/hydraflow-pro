/**
 * Step 3: Review and Classification
 */
import { useMemo } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Building2, 
  Users, 
  Flame,
  Shield,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProjectFormData } from './types';
import { determineRequirements } from '@/engine/requirements';
import { OCCUPANCY_DIVISIONS } from '@/core/ntcbClassification';
import type { ProjectConfig, RiskClass } from '@/models/project';

interface ReviewStepProps {
  form: UseFormReturn<ProjectFormData>;
}

export function ReviewStep({ form }: ReviewStepProps) {
  const formData = useWatch({ control: form.control });

  const analysis = useMemo(() => {
    if (!formData.sectors || formData.sectors.length === 0) {
      return null;
    }

    // Calculate totals
    const totalArea = formData.sectors.reduce((sum, s) => sum + (s.area || 0), 0);
    const totalPopulation = formData.sectors.reduce((sum, s) => sum + (s.population || 0), 0);
    const maxFireLoad = Math.max(...formData.sectors.map((s) => s.fireLoad || 0));
    const avgFireLoad = formData.sectors.reduce((sum, s) => sum + (s.fireLoad || 0) * (s.area || 0), 0) / (totalArea || 1);

    // Determine risk class
    const riskClass: RiskClass = maxFireLoad > 1200 ? 'alto' : maxFireLoad > 300 ? 'medio' : 'baixo';

    // Build project config for requirements
    const projectConfig: ProjectConfig = {
      projectName: formData.projectName || '',
      totalArea: formData.totalArea || totalArea,
      totalHeight: formData.totalHeight || 0,
      numberOfFloors: 1,
      sectors: formData.sectors.map((s) => ({
        id: s.id,
        name: s.name,
        occupancyCode: s.occupancyCode,
        occupancyName: s.occupancyName,
        cnaeCode: s.cnaeCode,
        area: s.area,
        floorHeight: s.floorHeight || 3,
        numberOfFloors: s.numberOfFloors || 1,
        fireLoad: s.fireLoad,
        population: s.population,
      })),
      riskClass,
      hasBasement: false,
      hasRooftop: false,
      hasAtrium: false,
      hasMezzanine: false,
      hasExternalArea: false,
    };

    const requirements = determineRequirements(projectConfig);
    
    // Create list with labels
    const mandatoryList = [
      { key: 'accessRoutes', label: 'Acesso de viaturas', required: requirements.accessRoutes },
      { key: 'compartmentalization', label: 'Compartimentação', required: requirements.compartmentalization },
      { key: 'emergencyExits', label: 'Saídas de emergência', required: requirements.emergencyExits },
      { key: 'controlConstructionMaterials', label: 'Controle de materiais', required: requirements.controlConstructionMaterials },
      { key: 'controlFinishingMaterials', label: 'Controle de acabamento', required: requirements.controlFinishingMaterials },
      { key: 'fireExtinguishers', label: 'Extintores', required: requirements.fireExtinguishers },
      { key: 'hydrants', label: 'Hidrantes/Mangotinhos', required: requirements.hydrants },
      { key: 'automaticSprinklers', label: 'Sprinklers automáticos', required: requirements.automaticSprinklers },
      { key: 'fireAlarm', label: 'Alarme de incêndio', required: requirements.fireAlarm },
      { key: 'smokeDetection', label: 'Detecção de fumaça', required: requirements.smokeDetection },
      { key: 'emergencyLighting', label: 'Iluminação de emergência', required: requirements.emergencyLighting },
      { key: 'safetySignage', label: 'Sinalização de emergência', required: requirements.safetySignage },
      { key: 'smokeControl', label: 'Controle de fumaça', required: requirements.smokeControl },
      { key: 'gasDetection', label: 'Detecção de gases', required: requirements.gasDetection },
      { key: 'specialExtinguishing', label: 'Sistemas especiais', required: requirements.specialExtinguishing },
      { key: 'brigadeTraining', label: 'Brigada de incêndio', required: requirements.brigadeTraining },
      { key: 'emergencyPlan', label: 'Plano de emergência', required: requirements.emergencyPlan },
      { key: 'lightningProtection', label: 'SPDA (para-raios)', required: requirements.lightningProtection },
    ];

    return {
      totalArea,
      totalPopulation,
      maxFireLoad,
      avgFireLoad,
      riskClass,
      requirements,
      mandatoryList,
    };
  }, [formData]);

  if (!analysis) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500" />
          <h3 className="mt-4 text-lg font-semibold">Dados Incompletos</h3>
          <p className="mt-2 text-muted-foreground">
            Preencha os dados gerais e adicione pelo menos um setor para ver a análise.
          </p>
        </CardContent>
      </Card>
    );
  }

  const riskColors: Record<RiskClass, string> = {
    baixo: 'bg-green-500',
    medio: 'bg-yellow-500',
    alto: 'bg-red-500',
  };

  const riskLabels: Record<RiskClass, string> = {
    baixo: 'Risco Baixo',
    medio: 'Risco Médio',
    alto: 'Risco Alto',
  };

  return (
    <div className="space-y-6">
      {/* Risk Classification */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Classificação Final
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className={`w-4 h-4 rounded-full ${riskColors[analysis.riskClass]}`} />
            <span className="text-2xl font-bold">{riskLabels[analysis.riskClass]}</span>
            <Badge variant="outline" className="ml-auto">
              Carga máx: {analysis.maxFireLoad.toFixed(0)} MJ/m²
            </Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Classificação baseada na maior carga de incêndio específica entre os setores.
          </p>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Área Total</p>
                <p className="text-2xl font-bold">{analysis.totalArea.toLocaleString('pt-BR')} m²</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">População Total</p>
                <p className="text-2xl font-bold">{analysis.totalPopulation.toLocaleString('pt-BR')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Flame className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Carga Média</p>
                <p className="text-2xl font-bold">{analysis.avgFireLoad.toFixed(0)} MJ/m²</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sectors Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Resumo dos Setores
          </CardTitle>
          <CardDescription>
            {formData.sectors?.length || 0} setor(es) cadastrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {formData.sectors?.map((sector, index) => {
              const occupancy = OCCUPANCY_DIVISIONS.find((d) => d.code === sector.occupancyCode);
              return (
                <div
                  key={sector.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium">{sector.name || `Setor ${index + 1}`}</p>
                      <p className="text-sm text-muted-foreground">
                        {sector.occupancyCode} - {occupancy?.name || 'Não definido'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{sector.area?.toLocaleString('pt-BR')} m²</p>
                    <p className="text-sm text-muted-foreground">
                      {sector.population} pessoas | {sector.fireLoad} MJ/m²
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Requirements Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Matriz de Exigências (NTCB 01/2025)
          </CardTitle>
          <CardDescription>
            Sistemas de proteção contra incêndio obrigatórios para esta edificação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {analysis.mandatoryList.map(({ key, label, required }) => (
              <div
                key={key}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  required ? 'bg-green-500/10' : 'bg-muted/30'
                }`}
              >
                {required ? (
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                )}
                <span className={required ? 'font-medium' : 'text-muted-foreground'}>
                  {label}
                </span>
                {required && (
                  <Badge variant="secondary" className="ml-auto">
                    Obrigatório
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
