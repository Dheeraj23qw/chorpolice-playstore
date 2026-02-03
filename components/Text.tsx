import { Text as RNText, TextProps } from "react-native";

export function Text({ className, style, ...props }: TextProps) {
  // Check if any specific font class is being passed (e.g., font-game, font-main-bold)
  const hasCustomFont = className?.includes("font-");

  return (
    <RNText
      {...props}
      // If NO custom font is passed, we apply 'font-main'. 
      // If a font IS passed, we don't add 'font-main' so they don't fight.
      className={`text-white ${!hasCustomFont ? "font-main" : ""} ${className || ""}`}
      
      // Remove the styles.baseLock entirely. 
      // It was forcing 'outfit' and preventing 'myfont' from appearing.
      style={style} 
      
      allowFontScaling={false}
      maxFontSizeMultiplier={1.1}
    />
  );
}