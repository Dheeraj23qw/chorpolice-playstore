import React, { Dispatch, SetStateAction, useMemo } from "react";
import { View, Text, Modal, FlatList, Pressable} from "react-native"; // Added StatusBar
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { hp, wp, rf } from "@/utils/responsive";

interface GameTableProps {
  isTableOpen: boolean;
  setIsTableOpen: Dispatch<SetStateAction<boolean>>;
  table: (string | number)[][];
}

const GameTable: React.FC<GameTableProps> = ({ isTableOpen, setIsTableOpen, table }) => {
  const insets = useSafeAreaInsets();
  const memoizedTable = useMemo(() => table, [table]);

  const handleClose = () => setIsTableOpen(false);

  const renderHeader = () => (
    <View className="flex-row bg-indigo-600/20 border-y border-white/10 py-4">
      {memoizedTable[0].map((cell, index) => (
        <View key={index} className="flex-1 items-center justify-center px-1">
          <Text 
            style={{ fontSize: rf(1.4) }} 
            className="text-indigo-300 font-black uppercase tracking-widest text-center"
          >
            {cell}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderRow = ({ item, index }: { item: (string | number)[]; index: number }) => (
    <View 
      className={`flex-row border-b border-white/5 py-4 ${index % 2 === 0 ? 'bg-black/[0.02]' : 'bg-transparent'}`}
    >
      {item.map((cell, cellIndex) => (
        <View key={cellIndex} className="flex-1 items-center justify-center px-1">
          <Text style={{ fontSize: rf(1.6) }} className="text-slate-300 font-medium text-center">
            {cell}
          </Text>
        </View>
      ))}
    </View>
  );

  return (
    <Modal visible={isTableOpen} transparent animationType="slide" onRequestClose={handleClose}>
     
      
      <View className="flex-1 bg-[#09090b]">
        
        {/* Aesthetic Background Orbs */}
        <View 
          style={{ width: wp(100), height: wp(100), top: -hp(10), right: -wp(30) }} 
          className="absolute bg-indigo-600/10 rounded-full blur-[100px]" 
        />
        <View 
          style={{ width: wp(80), height: wp(80), bottom: -hp(10), left: -wp(20) }} 
          className="absolute bg-purple-600/10 rounded-full blur-[100px]" 
        />

        {/* Content Wrapper */}
        <View 
          style={{ 
            flex: 1, 
            paddingTop: insets.top || hp(2), // Content starts below notch
            paddingBottom: insets.bottom || hp(2) 
          }}
          className="px-4"
        >
          
          {/* Header Title Area */}
          <View className="flex-row items-center justify-between mb-6 px-2">
            <View>
              <Text 
                style={{ fontSize: rf(1.2) }} 
                className="text-indigo-400 font-bold tracking-[3px] uppercase"
              >
                Data Reference
              </Text>
              <Text 
                style={{ fontSize: rf(3.2) }} 
                className="text-white font-black tracking-tighter"
              >
                Quiz Table
              </Text>
            </View>
            
            <View className="h-10 w-10 rounded-full bg-white/5 border border-white/10 items-center justify-center">
              <View className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            </View>
          </View>

          {/* Glass Table Container */}
          <View className="flex-1 rounded-[32px] bg-white/5 border border-white/10 overflow-hidden mb-6">
            {memoizedTable.length > 0 && renderHeader()}
            
            <FlatList
              data={memoizedTable.slice(1)}
              renderItem={renderRow}
              keyExtractor={(_, index) => index.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          </View>

          {/* Minimalist Action Button */}
          <Pressable
            onPress={handleClose}
            style={{ height: hp(7) }}
            className="w-full bg-indigo-600 rounded-2xl border-b-4 border-indigo-800 items-center justify-center active:border-b-0 active:translate-y-[2px]"
          >
            <Text 
              style={{ fontSize: rf(1.8) }} 
              className="text-white font-black uppercase tracking-widest"
            >
              Back to Quest
            </Text>
          </Pressable>
          
        </View>
      </View>
    </Modal>
  );
};

export default GameTable;