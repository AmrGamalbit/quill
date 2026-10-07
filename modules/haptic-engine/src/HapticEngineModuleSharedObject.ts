import { SharedObject, useReleasingSharedObject } from 'expo-modules-core';

import HapticEngineModule from './HapticEngineModule';

export declare class HapticEngineModuleSharedObject extends SharedObject {
  count: number;
}

/**
 * Creates a new HapticEngineModuleSharedObject instance.
 * You are responsible for releasing it from memory by calling `release()` when done.
 */
export function createHapticEngineModuleSharedObject(): HapticEngineModuleSharedObject {
  return new HapticEngineModule.HapticEngineModuleSharedObject();
}

/**
 * A hook that creates a HapticEngineModuleSharedObject instance and automatically
 * releases it when the component unmounts.
 */
export function useHapticEngineModuleSharedObject(): HapticEngineModuleSharedObject {
  return useReleasingSharedObject(() => new HapticEngineModule.HapticEngineModuleSharedObject(), []);
}
