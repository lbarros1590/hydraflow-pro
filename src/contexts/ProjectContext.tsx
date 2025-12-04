/**
 * Project Context - Manages projects list and current project
 */
import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { ProjectFormData, SavedProject, ProjectStatus } from '@/components/Wizard/types';

interface ProjectContextType {
  projects: SavedProject[];
  currentProject: SavedProject | null;
  setCurrentProject: (project: SavedProject | null) => void;
  saveProject: (data: ProjectFormData, status?: ProjectStatus) => SavedProject;
  updateProject: (id: string, data: Partial<ProjectFormData>, status?: ProjectStatus) => void;
  deleteProject: (id: string) => void;
  getProjectById: (id: string) => SavedProject | undefined;
  clearAll: () => void;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

const STORAGE_KEY = 'hydraflow_projects';

function generateId(): string {
  return `proj_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function calculateRiskClass(data: ProjectFormData): 'baixo' | 'medio' | 'alto' {
  if (!data.sectors || data.sectors.length === 0) return 'medio';
  
  const maxFireLoad = Math.max(...data.sectors.map(s => s.fireLoad || 300));
  const hasSpecialRisks = data.specialRisks && data.specialRisks.length > 0;
  
  if (maxFireLoad > 1200 || hasSpecialRisks) return 'alto';
  if (maxFireLoad > 300) return 'medio';
  return 'baixo';
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<SavedProject[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [currentProject, setCurrentProject] = useState<SavedProject | null>(null);

  const persistProjects = useCallback((newProjects: SavedProject[]) => {
    setProjects(newProjects);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProjects));
  }, []);

  const saveProject = useCallback((data: ProjectFormData, status: ProjectStatus = 'rascunho'): SavedProject => {
    const now = new Date().toISOString();
    const newProject: SavedProject = {
      id: generateId(),
      data,
      status,
      riskClass: calculateRiskClass(data),
      createdAt: now,
      updatedAt: now,
    };
    
    const updated = [...projects, newProject];
    persistProjects(updated);
    setCurrentProject(newProject);
    return newProject;
  }, [projects, persistProjects]);

  const updateProject = useCallback((id: string, data: Partial<ProjectFormData>, status?: ProjectStatus) => {
    const updated = projects.map(p => {
      if (p.id === id) {
        const newData = { ...p.data, ...data };
        const updatedProject: SavedProject = {
          ...p,
          data: newData,
          status: status || p.status,
          riskClass: calculateRiskClass(newData),
          updatedAt: new Date().toISOString(),
        };
        if (currentProject?.id === id) {
          setCurrentProject(updatedProject);
        }
        return updatedProject;
      }
      return p;
    });
    persistProjects(updated);
  }, [projects, currentProject, persistProjects]);

  const deleteProject = useCallback((id: string) => {
    const updated = projects.filter(p => p.id !== id);
    persistProjects(updated);
    if (currentProject?.id === id) {
      setCurrentProject(null);
    }
  }, [projects, currentProject, persistProjects]);

  const getProjectById = useCallback((id: string) => {
    return projects.find(p => p.id === id);
  }, [projects]);

  const clearAll = useCallback(() => {
    setProjects([]);
    setCurrentProject(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <ProjectContext.Provider value={{ 
      projects,
      currentProject,
      setCurrentProject,
      saveProject,
      updateProject,
      deleteProject,
      getProjectById,
      clearAll,
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

// Helper to extract hydraulic config from project
export function extractHydraulicConfig(project: SavedProject) {
  const data = project.data;
  const mainSector = data.sectors.reduce((main, sector) => 
    sector.area > (main?.area || 0) ? sector : main
  , data.sectors[0]);

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
