// contexts/ProjectContext.js
import { createContext, useState, useContext } from 'react';

const ProjectContext = createContext();

export function ProjectProvider({ children }) {
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <ProjectContext.Provider value={{ selectedProject, setSelectedProject }}>
      {children}
    </ProjectContext.Provider>
  );
}

// Custom hook untuk mudah mengakses project
export function useProject() {
  return useContext(ProjectContext);
}