import type { StyleProp, ViewStyle } from 'react-native';

export type HapticEngineModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
};

export type ChangeEventPayload = {
  value: string;
};

export type OnTapEventPayload = Record<string, never>;

export type HapticEngineViewProps = {
  onTap: (event: { nativeEvent: OnTapEventPayload }) => void;
  style?: StyleProp<ViewStyle>;
};
