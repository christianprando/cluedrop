import { createContext, useContext, ReactNode } from 'react';
import { Container, getContainer } from './Container';

/**
 * React Context for dependency injection
 */
const ServiceContext = createContext<Container | null>(null);

interface ServiceProviderProps {
  children: ReactNode;
  container?: Container;
}

/**
 * Provider component that makes services available to all child components
 */
export function ServiceProvider({ children, container }: ServiceProviderProps) {
  const containerInstance = container || getContainer();

  return <ServiceContext.Provider value={containerInstance}>{children}</ServiceContext.Provider>;
}

/**
 * Hook to access the service container
 * @throws Error if used outside of ServiceProvider
 */
export function useServices(): Container {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error('useServices must be used within a ServiceProvider');
  }
  return context;
}
