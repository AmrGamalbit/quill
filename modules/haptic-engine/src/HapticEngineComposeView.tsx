import { requireNativeView } from 'expo';
import { type PrimitiveBaseProps } from '@expo/ui/jetpack-compose';
import { createViewModifierEventListener } from '@expo/ui/jetpack-compose/modifiers';
import * as React from 'react';

export interface HapticEngineComposeViewProps extends PrimitiveBaseProps {
  title: string;
  children?: React.ReactNode;
}

const NativeHapticEngineComposeView = requireNativeView<HapticEngineComposeViewProps>(
  'HapticEngine',
  'HapticEngineComposeView'
);

export default function HapticEngineComposeView({
  modifiers,
  ...rest
}: HapticEngineComposeViewProps) {
  return (
    <NativeHapticEngineComposeView
      modifiers={modifiers}
      {...(modifiers ? createViewModifierEventListener(modifiers) : undefined)}
      {...rest}
    />
  );
}
