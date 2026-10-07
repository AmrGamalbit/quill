import { requireNativeView } from 'expo';
import * as React from 'react';

import { HapticEngineViewProps } from './HapticEngine.types';

const NativeView: React.ComponentType<HapticEngineViewProps> = requireNativeView('HapticEngine');

export default function HapticEngineView(props: HapticEngineViewProps) {
  return <NativeView {...props} />;
}
