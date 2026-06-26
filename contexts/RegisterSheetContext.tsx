import * as React from 'react';

interface RegisterSheetContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const RegisterSheetContext = React.createContext<RegisterSheetContextValue | null>(null);

export function RegisterSheetProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);

  const value = React.useMemo(
    () => ({
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    }),
    [isOpen],
  );

  return (
    <RegisterSheetContext.Provider value={value}>{children}</RegisterSheetContext.Provider>
  );
}

export function useRegisterSheet() {
  const ctx = React.useContext(RegisterSheetContext);
  if (!ctx) {
    throw new Error('useRegisterSheet must be used within RegisterSheetProvider');
  }
  return ctx;
}
