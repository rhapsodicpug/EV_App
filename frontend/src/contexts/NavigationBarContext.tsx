import React, { createContext, useContext, useState } from 'react';

interface NavigationBarContextType {
  hideNavBar: boolean;
  setHideNavBar: (hide: boolean) => void;
}

const NavigationBarContext = createContext<NavigationBarContextType | undefined>(undefined);

export const NavigationBarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hideNavBar, setHideNavBar] = useState(false);

  return (
    <NavigationBarContext.Provider value={{ hideNavBar, setHideNavBar }}>
      {children}
    </NavigationBarContext.Provider>
  );
};

export const useNavigationBar = () => {
  const context = useContext(NavigationBarContext);
  if (!context) {
    throw new Error('useNavigationBar must be used within NavigationBarProvider');
  }
  return context;
};

