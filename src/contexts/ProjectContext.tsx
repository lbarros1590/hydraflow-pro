/**
 * Project Context - Shared state between Wizard and Hydraulic Calculator
 */
import { createContext, useContext, useState, ReactNode } from 'react';
import type { ProjectFormData } from '@/components/Wizard/types';

interface ProjectContextType {
  projectData: ProjectFormData | null;
  setProjectData: (data: ProjectFormData | null) => void;
  clearProjectData: () => void;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projectData, setProjectData] = useState<ProjectFormData | null>(() => {
    // Try to load from localStorage
    const saved = localStorage.getItem('hydraflow_project');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const handleSetProjectData = (data: ProjectFormData | null) => {
    setProjectData(data);
    if (data) {
      localStorage.setItem('hydraflow_project', JSON.stringify(data));
    } else {
      localStorage.removeItem('hydraflow_project');
    }
  };

  const clearProjectData = () => {
    setProjectData(null);
    localStorage.removeItem('hydraflow_project');
  };

  return (
    <ProjectContext.Provider value={{ 
      projectData, 
      setProjectData: handleSetProjectData, 
      clearProjectData 
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}

// Helper function to extract hydraulic config from project data
export function extractHydraulicConfig(data: ProjectFormData) {
  // Get main occupancy (largest area sector)
  const mainSector = data.sectors.reduce((main, sector) => 
    sector.area > (main?.area || 0) ? sector : main
  , data.sectors[0]);

  // Calculate average fire load weighted by area
  const totalArea = data.sectors.reduce((sum, s) => sum + s.area, 0);
  const avgFireLoad = data.sectors.reduce((sum, s) => 
    sum + (s.fireLoad || 0) * s.area, 0
  ) / (totalArea || 1);

  return {
    occupancyCode: mainSector?.occupancyCode || 'A-2',
    fireLoadMJm2: Math.round(avgFireLoad) || 300,
    totalAreaM2: data.totalArea || totalArea,
    buildingHeight: data.totalHeight || 0,
  };
}
