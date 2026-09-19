import * as Haptics from 'expo-haptics';
import { Pressable, PressableProps } from 'react-native';

type HapticTabProps = PressableProps;

export function HapticTab(props: HapticTabProps) {
  return (
    <Pressable
      {...props}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          // Add soft haptic feedback when pressing down on the tab.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        props.onPressIn?.(ev);
      }}
    />
  );
}