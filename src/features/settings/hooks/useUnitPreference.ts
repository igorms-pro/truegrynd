'use client';

import { useCallback, useState } from 'react';

import {
  readUnitPreference,
  writeUnitPreference,
  type UnitSystem,
} from '@/features/settings/lib/unitPreference';

function readInitialUnit(): UnitSystem {
  if (typeof window === 'undefined') return 'metric';
  return readUnitPreference();
}

export function useUnitPreference(): {
  unitSystem: UnitSystem;
  setUnitSystem: (value: UnitSystem) => void;
} {
  const [unitSystem, setUnitState] = useState<UnitSystem>(readInitialUnit);

  const setUnitSystem = useCallback((value: UnitSystem) => {
    writeUnitPreference(value);
    setUnitState(value);
  }, []);

  return { unitSystem, setUnitSystem };
}
