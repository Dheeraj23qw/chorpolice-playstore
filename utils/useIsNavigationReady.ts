import { useState, useEffect } from 'react';
import { useRootNavigationState } from 'expo-router';

export const useIsRouterReady = () => {
  const rootNavigationState = useRootNavigationState();
  // If rootNavigationState is undefined, the router isn't mounted yet
  return rootNavigationState?.key != null;
};