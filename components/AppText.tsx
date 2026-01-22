import React from 'react';
import { Text, TextProps } from 'react-native';

interface AppTextProps extends TextProps {
  className?: string;
  children?: React.ReactNode;
}

export function AppText({ children, className = "", ...props }: AppTextProps) {
  return (
    <Text 
      // Ensure 'font-[outfit]' is your default, then append custom classes
      className={`font-[outfit] ${className}`} 
      {...props}
    >
      {children}
    </Text>
  );
}