import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type Ctx = {
  notificationsTick: number;
  refreshNotifications: () => void;
};

const DashboardNotificationsContext = createContext<Ctx>({
  notificationsTick: 0,
  refreshNotifications: () => {},
});

export function DashboardNotificationsProvider({ children }: { children: ReactNode }) {
  const [notificationsTick, setTick] = useState(0);
  const refreshNotifications = useCallback(() => setTick((x) => x + 1), []);
  const value = useMemo(
    () => ({ notificationsTick, refreshNotifications }),
    [notificationsTick, refreshNotifications]
  );
  return <DashboardNotificationsContext.Provider value={value}>{children}</DashboardNotificationsContext.Provider>;
}

export function useDashboardNotificationsRefresh() {
  return useContext(DashboardNotificationsContext);
}
