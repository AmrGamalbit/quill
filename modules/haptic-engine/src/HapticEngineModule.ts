import { NativeModule, requireNativeModule } from 'expo';

import { HapticEngineModuleEvents } from './HapticEngine.types';
import type { HapticEngineModuleSharedObject } from './HapticEngineModuleSharedObject';

declare class HapticEngineModule extends NativeModule<HapticEngineModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
  HapticEngineModuleSharedObject: typeof HapticEngineModuleSharedObject;
}

export default requireNativeModule<HapticEngineModule>('HapticEngine');
