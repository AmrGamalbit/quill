import { requireNativeView } from 'expo';
import { type CommonViewModifierProps } from '@expo/ui/swift-ui';
import { createViewModifierEventListener } from '@expo/ui/swift-ui/modifiers';
import * as React from 'react';

export interface HapticEngineSwiftUIViewProps extends CommonViewModifierProps {
  title: string;
  children?: React.ReactNode;
}

const NativeHapticEngineSwiftUIView = requireNativeView<HapticEngineSwiftUIViewProps>(
  'HapticEngine',
  'HapticEngineSwiftUIView'
);

export default function HapticEngineSwiftUIView({
  modifiers,
  ...rest
}: HapticEngineSwiftUIViewProps) {
  return (
    <NativeHapticEngineSwiftUIView
      modifiers={modifiers}
      {...(modifiers ? createViewModifierEventListener(modifiers) : undefined)}
      {...rest}
    />
  );
}
