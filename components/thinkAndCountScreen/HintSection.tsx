

import React, { memo } from "react";
import { View, Text, ScrollView } from "react-native";

interface HintSectionProps {
  hint?: string;
}

const HintSection: React.FC<HintSectionProps> = ({ hint }) => {
  return (
    <View className="mx-4 mt-4 rounded-2xl bg-indigo-500/15 border border-white/10 backdrop-blur-xl shadow-lg">
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="max-h-40 px-4 py-3"
      >
        <Text className="text-white text-[15px] leading-6 font-semibold tracking-wide">
          {hint || "No hint available."}
        </Text>
      </ScrollView>
    </View>
  );
};

export default memo(HintSection);




// import React, { memo } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   Modal,
//   TouchableOpacity,
//   Pressable,
//   Dimensions,
// } from "react-native";
// import { hp } from "@/utils/responsive";
// import { Lightbulb, X } from "lucide-react-native";

// interface HintSectionProps {
//   hint?: string;
//   isVisible: boolean;
//   onClose: () => void;
// }

// const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// const HintSection: React.FC<HintSectionProps> = ({
//   hint,
//   isVisible,
//   onClose,
// }) => {
//   return (
//     <Modal
//       animationType="slide"
//       transparent={true}
//       visible={isVisible}
//       statusBarTranslucent
//       onRequestClose={onClose}
//     >
//       <Pressable 
//         className="flex-1 bg-black/40 justify-center items-center px-6" 
//         onPress={onClose}
//       >
//         {/* Main Card */}
//         <Pressable
//           onPress={(e) => e.stopPropagation()}
//           className="w-full bg-[#161b22] rounded-[40px] border border-white/10 shadow-2xl"
//           style={{
//             maxHeight: SCREEN_HEIGHT * 0.7,
//             elevation: 20,
//           }}
//         >
//           {/* Header & Icon */}
//           <View className="items-center -mt-10">
//             <View className="bg-[#1d242e] p-5 rounded-full border-[4px] border-[#0d1117] shadow-xl">
//               <Lightbulb size={36} color="#fbbf24" fill="#fbbf24" opacity={0.9} />
//             </View>
//           </View>

//           <View className="px-6 pt-4 pb-8">
//             <View className="items-center mb-6">
//               <Text className="text-white text-2xl font-black tracking-widest uppercase">
//                 Hint
//               </Text>
//               <View className="h-1 w-8 bg-amber-400 rounded-full mt-1" />
//             </View>

//             {/* Scrollable Content Area */}
//             <View className="bg-white/5 rounded-3xl border border-white/5 overflow-hidden">
//               <ScrollView
//                 showsVerticalScrollIndicator={true}
//                 indicatorStyle="white"
//                 style={{ maxHeight: hp(25) }}
//                 contentContainerStyle={{ padding: 20 }}
//               >
//                 <Text className="text-slate-200 text-lg leading-7 text-center font-medium">
//                   {hint || "The secret lies in the sequence. Try focusing on the relationship between the first and last elements of the set."}
//                 </Text>
//               </ScrollView>
//             </View>

//             {/* Action Button */}
//             <TouchableOpacity
//               onPress={onClose}
//               activeOpacity={0.8}
//               className="mt-8 bg-indigo-600 h-16 rounded-2xl flex-row items-center justify-center shadow-lg"
//             >
//               <Text className="text-white font-bold text-lg uppercase tracking-widest">
//                 Got it
//               </Text>
//             </TouchableOpacity>

//             {/* Close Text */}
//             <TouchableOpacity 
//               onPress={onClose}
//               className="mt-4 self-center"
//             >
//               <Text className="text-slate-500 font-semibold uppercase text-xs tracking-tighter">
//                 Dismiss
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </Pressable>
//       </Pressable>
//     </Modal>
//   );
// };

// export default memo(HintSection);



    //  { showHint && (
    //           <TouchableOpacity
    //             onPress={() => setIsHintOpen(true)}
    //             activeOpacity={0.8}
    //             className="mt-8 flex-row items-center justify-center bg-indigo-500/10 border border-indigo-500/30 py-4 rounded-2xl"
    //           >
    //             <Lightbulb size={20} color="#818cf8" strokeWidth={2} />
    //             <Text className="ml-3 text-indigo-400 font-bold uppercase tracking-[2px] text-[12px]">
    //               View Solution Hint
    //             </Text>
    //           </TouchableOpacity>
    //         )}