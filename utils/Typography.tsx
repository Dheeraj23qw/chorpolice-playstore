import { Text as RNText, TextProps } from 'react-native';

export const Text = ({ style, ...props }: TextProps) => {
  return (
    <RNText
      {...props}
      style={[
        { fontFamily: 'outfit', color: '#FFFFFF' }, // Your "Locked" defaults
        style,
      ]}
    />
  );
};