import { TextInput as RNTextInput, TextInputProps } from "react-native";

export function TextInput({ className, style, ...props }: TextInputProps) {
  return (
    <RNTextInput
      {...props}
      // Force the 'main' font for the text AND the placeholder
      className={`text-white font-main ${className || ""}`}
      style={style}
      // Production Safety: Stops the input from scaling out of the box
      allowFontScaling={false}
      // Ensures the cursor and selection look correct in dark mode
      selectionColor="#FFFFFF"
      placeholderTextColor="#9CA3AF"
    />
  );
}