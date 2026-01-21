// components/AppText.tsx
import { Text } from 'react-native';

export function AppText({ children, className, ...props }) {
  return (
    <Text 
      // 1. We hardcode the default font here
      className={`font-[outfit] ${className}`} 
      {...props}
    >
      {children} {/* 2. This is the actual text content */}
    </Text>
  );
}