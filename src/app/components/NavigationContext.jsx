"use client";

import { createContext, useContext } from "react";

const NavigationContext = createContext(false);

export function NavigationProvider({ value, children }) {
  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function usePersistentNavigation() {
  return useContext(NavigationContext);
}
