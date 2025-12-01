import React, { createContext, useContext, useState, ReactNode, useRef } from "react";

interface PortalContextValue {
  mount: (key: string, children: ReactNode) => void;
  unmount: (key: string) => void;
}

const PortalContext = createContext<PortalContextValue | undefined>(undefined);

export const PortalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [portals, setPortals] = useState<Map<string, ReactNode>>(new Map());

  const mount = (key: string, children: ReactNode) => {
    setPortals((prev) => new Map(prev).set(key, children));
  };

  const unmount = (key: string) => {
    setPortals((prev) => {
      const next = new Map(prev);
      next.delete(key);
      return next;
    });
  };

  return (
    <PortalContext.Provider value={{ mount, unmount }}>
      {children}
      {Array.from(portals.entries()).map(([key, children]) => (
        <React.Fragment key={key}>{children}</React.Fragment>
      ))}
    </PortalContext.Provider>
  );
};

export interface PortalProps {
  children: ReactNode;
}

export const Portal: React.FC<PortalProps> = ({ children }) => {
  const context = useContext(PortalContext);
  const keyRef = useRef<string | null>(null);
  
  if (!keyRef.current) {
    keyRef.current = `portal-${Math.random()}`;
  }
  const key = keyRef.current;

  React.useEffect(() => {
    if (context) {
      context.mount(key, children);
      return () => context.unmount(key);
    }
  }, [children, context, key]);

  // If no PortalProvider, just render children (fallback)
  if (!context) {
    return <>{children}</>;
  }

  return null;
};
