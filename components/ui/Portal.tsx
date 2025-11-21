import React, { createContext, useContext, useState, ReactNode } from "react";
import { Modal, View, StyleSheet, ViewStyle } from "react-native";

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

  // If no PortalProvider, just render children (fallback)
  if (!context) {
    return <>{children}</>;
  }

  const key = `portal-${Math.random()}`;

  React.useEffect(() => {
    context.mount(key, children);
    return () => context.unmount(key);
  }, [children]);

  return null;
};
