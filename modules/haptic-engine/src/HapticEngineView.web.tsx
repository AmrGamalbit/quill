import { HapticEngineViewProps } from './HapticEngine.types';

// HapticEngineView is not available on the web platform.
export default function HapticEngineView(_props: HapticEngineViewProps) {
  throw new Error('HapticEngineView is not available on the web platform.');
}
