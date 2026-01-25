import React, { memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { rf } from "@/utils/responsive";

interface ActionButtonsProps {
  handleStartAdventure?: () => void;
  disabled?: boolean;
}

const PlayernameActionButtonsComponent: React.FC<ActionButtonsProps> = ({ 
  handleStartAdventure, 
  disabled 
}) => {
  return (
    <View className="w-full items-center justify-center py-6">
      {handleStartAdventure && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleStartAdventure}
          disabled={disabled}
          // Obsidian glass base with Indigo metamorphic borders
          className={`w-full py-5 rounded-2xl items-center justify-center border-t-[1.5px] border-l-[1px] ${
            disabled 
              ? "bg-white/[0.02] border-white/5 opacity-30" 
              : "bg-[#08080a] border-indigo-500/60 shadow-2xl shadow-indigo-500/40"
          }`}
          style={{
            borderRightWidth: 1,
            borderBottomWidth: 4, // Deep slab effect for physical depth
            borderRightColor: disabled ? 'transparent' : 'rgba(99, 102, 241, 0.2)',
            borderBottomColor: disabled ? 'transparent' : 'rgba(99, 102, 241, 0.5)',
          }}
        >
          {/* Indigo High-Light Bar (Top edge shine) */}
          {!disabled && (
            <View className="absolute top-0 left-8 right-8 h-[2px] bg-indigo-400 blur-[0.5px]" />
          )}

          <View className="flex-row items-center justify-center">
            <Text 
              style={{ fontSize: rf(1.8) }} 
              className={`font-black uppercase tracking-[8px]  ${
                disabled ? "text-white/10" : "text-white"
              }`}
            >
              Launch
            </Text>
            
            {!disabled && (
               <Text style={{ fontSize: rf(1.6) }} className="ml-2">
                 ⚡
               </Text>
            )}
          </View>

          {/* Minimalist Tech Decor Detail */}
          {!disabled && (
            <View className="absolute left-6 flex-row space-x-1">
               <View className="h-1 w-3 rounded-full bg-indigo-500" />
               <View className="h-1 w-1 rounded-full bg-indigo-400/40" />
            </View>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

export const PlayernameActionButtons = memo(PlayernameActionButtonsComponent);