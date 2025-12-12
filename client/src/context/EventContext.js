import { createContext, useContext, useMemo, useState } from 'react';

const EventContext = createContext(undefined);

export function EventProvider({ children }) {
  const [filters, setFilters] = useState({ radiusKm: 10 });

  const value = useMemo(() => ({ filters, setFilters }), [filters]);

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
}

export function useEventContext() {
  const context = useContext(EventContext);
  if (!context) throw new Error('useEventContext must be used within EventProvider');
  return context;
}
