import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type ParseData = typeof import('../data/parser').parseData;
export type AppData = Awaited<ReturnType<ParseData>>;

interface DataContextType {
  appData: AppData | null;
  isLoading: boolean;
}

const DataContext = createContext<DataContextType>({ appData: null, isLoading: true });

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [dataState, setDataState] = useState<DataContextType>({ appData: null, isLoading: true });

  useEffect(() => {
    let isMounted = true;

    // We defer the execution using setTimeout so that initial paint is not blocked.
    const timer = setTimeout(async () => {
      const { parseData } = await import('../data/parser');
      const data = await parseData();

      if (isMounted) {
        setDataState({ appData: data, isLoading: false });
      }
    }, 10);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  if (dataState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-[#003865] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium">Carregando dados globais...</p>
        </div>
      </div>
    );
  }

  return (
    <DataContext.Provider value={dataState}>
      {children}
    </DataContext.Provider>
  );
};

// Hook with non-null assertion since we only render children when loaded
export const useData = () => {
  const context = useContext(DataContext);
  return { appData: context.appData! };
};
