import { registerWebModule, NativeModule } from 'expo';

import { HapticEngineModuleEvents } from './HapticEngine.types';

// HapticEngineModule is not available on the web platform.
class HapticEngineModule extends NativeModule<HapticEngineModuleEvents> {}

export default registerWebModule(HapticEngineModule, 'HapticEngineModule');
