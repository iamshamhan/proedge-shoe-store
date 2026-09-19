'use client';

import React, { createContext, useContext, useEffect, useCallback, useSyncExternalStore } from 'react';
import type { StoreSettings } from '@/lib/settings';
import { DEFAULT_STORE_SETTINGS } from '@/lib/settings';

export interface StoreSettingsContextType extends StoreSettings {
  refreshSettings: () => Promise<void>;
  isLoading: boolean;
}

const SettingsContext = createContext<StoreSettingsContextType>({
  ...DEFAULT_STORE_SETTINGS,
  refreshSettings: async () => {},
  isLoading: false,
});

let globalSettings: StoreSettings = DEFAULT_STORE_SETTINGS;
const settingsListeners = new Set<() => void>();
let currentFetchPromise: Promise<void> | null = null;
let currentAbortController: AbortController | null = null;

function emitSettingsChange() {
  settingsListeners.forEach((listener) => listener());
}

async function fetchLatestSettings() {
  if (typeof window === 'undefined') return;

  if (currentFetchPromise) {
    return currentFetchPromise;
  }

  currentAbortController = new AbortController();

  currentFetchPromise = (async () => {
    try {
      const res = await fetch('/api/settings', {
        cache: 'no-store',
        signal: currentAbortController?.signal,
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });
      if (res.ok) {
        const data = (await res.json()) as StoreSettings;
        if (data && typeof data.defaultDeliveryFee === 'number') {
          const changed =
            data.freeDeliveryEnabled !== globalSettings.freeDeliveryEnabled ||
            data.freeDeliveryThreshold !== globalSettings.freeDeliveryThreshold ||
            data.defaultDeliveryFee !== globalSettings.defaultDeliveryFee ||
            data.bannerTagline !== globalSettings.bannerTagline ||
            data.heroProductSlug !== globalSettings.heroProductSlug ||
            data.saleEnabled !== globalSettings.saleEnabled ||
            data.saleDiscountPercent !== globalSettings.saleDiscountPercent ||
            data.brandName !== globalSettings.brandName ||
            data.contactAddress !== globalSettings.contactAddress ||
            data.contactPhone !== globalSettings.contactPhone ||
            data.contactEmail !== globalSettings.contactEmail;

          if (changed) {
            globalSettings = data;
            emitSettingsChange();
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        // safely ignore aborts
        return;
      }
      console.error('Failed to fetch store settings:', err);
    } finally {
      currentFetchPromise = null;
      currentAbortController = null;
    }
  })();

  return currentFetchPromise;
}

function subscribeToSettings(callback: () => void) {
  settingsListeners.add(callback);
  fetchLatestSettings();

  const handleCustomUpdate = () => {
    fetchLatestSettings();
  };

  const handleStorage = (e: StorageEvent) => {
    if (e.key === 'proedge_settings_sync') {
      fetchLatestSettings();
    }
  };

  const handleFocus = () => {
    fetchLatestSettings();
  };

  window.addEventListener('proedge_settings_updated', handleCustomUpdate);
  window.addEventListener('storage', handleStorage);
  window.addEventListener('focus', handleFocus);

  return () => {
    settingsListeners.delete(callback);
    window.removeEventListener('proedge_settings_updated', handleCustomUpdate);
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener('focus', handleFocus);
    
    if (settingsListeners.size === 0 && currentAbortController) {
      currentAbortController.abort();
    }
  };
}

function getSettingsSnapshot(): StoreSettings {
  return globalSettings;
}

export function SettingsProvider({
  children,
  settings: initialSettings,
}: {
  children: React.ReactNode;
  settings: StoreSettings;
}) {
  useEffect(() => {
    if (initialSettings) {
      globalSettings = initialSettings;
      emitSettingsChange();
    }
  }, [initialSettings]);

  const getServerSnapshot = useCallback(() => initialSettings, [initialSettings]);

  const syncedSettings = useSyncExternalStore(
    subscribeToSettings,
    getSettingsSnapshot,
    getServerSnapshot,
  );

  const refresh = useCallback(async () => {
    await fetchLatestSettings();
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        ...syncedSettings,
        refreshSettings: refresh,
        isLoading: false,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useStoreSettings(): StoreSettingsContextType {
  const context = useContext(SettingsContext);
  return (
    context || {
      ...DEFAULT_STORE_SETTINGS,
      refreshSettings: async () => {},
      isLoading: false,
    }
  );
}
