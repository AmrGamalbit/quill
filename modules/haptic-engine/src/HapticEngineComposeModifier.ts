import { createModifier, type ModifierConfig } from '@expo/ui/jetpack-compose/modifiers';

export const hapticEngineComposeModifier = (params: {
  color?: number;
  width?: number;
  cornerRadius?: number;
}): ModifierConfig => createModifier('hapticEngineComposeModifier', params);
