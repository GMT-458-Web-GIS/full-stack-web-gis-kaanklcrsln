import { createContext, useContext, useMemo, useState } from 'react';

const MapContext = createContext(undefined);

export function MapProvider({ children }) {
  const [viewState, setViewState] = useState({ lat: 0, lng: 0, zoom: 12 });

  const value = useMemo(() => ({ viewState, setViewState }), [viewState]);

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
}

export function useMapContext() {
  const context = useContext(MapContext);
  if (!context) throw new Error('useMapContext must be used within MapProvider');
  return context;
}
