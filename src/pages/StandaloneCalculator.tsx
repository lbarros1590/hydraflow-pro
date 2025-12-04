/**
 * Standalone Calculator - Calculator without project context
 */
import HydraulicCalculator from '@/components/HydraulicSystem/HydraulicCalculator';

export default function StandaloneCalculator() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Calculadora Hidráulica</h1>
        <p className="text-muted-foreground">
          Dimensione redes de hidrantes e sprinklers sem vincular a um projeto
        </p>
      </div>
      <HydraulicCalculator />
    </div>
  );
}
