import { createModifier, type ModifierConfig } from '@expo/ui/swift-ui/modifiers';

export const hapticEngineSwiftUIModifier = (params: {
  color?: string;
  width?: number;
  cornerRadius?: number;
}): ModifierConfig => createModifier('hapticEngineSwiftUIModifier', params);
