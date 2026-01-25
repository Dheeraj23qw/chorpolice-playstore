import React, { useMemo, memo } from "react";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { rf } from "@/utils/responsive";

interface SelectedImageGridProps {
  selectedImages: number[];
  imageNames: Record<number, string>;
  handleNameChange: (imageId: number, name: string) => void;
  handleSelectedImageClick: (imageId: number) => void;
}

const getImageSource = (imageData: { type: string; src: any }) => {
  return imageData.type === "local" ? imageData.src : { uri: imageData.src };
};

const SelectedImageGridComponent: React.FC<SelectedImageGridProps> = ({
  selectedImages,
  imageNames,
  handleNameChange,
  handleSelectedImageClick,
}) => {
  const playerImages = useSelector((state: RootState) => state.playerImages.images);

  // Transform redux data into local array once per data change
  const imagesArray = useMemo(() => {
    return Object.entries(playerImages).map(([key, image]) => ({
      id: Number(key),
      image: getImageSource(image as any),
    }));
  }, [playerImages]);

  return (
    <View className="w-full py-6">
      {/* --- Stylish Header --- */}
      {selectedImages.length > 0 && (
        <View className="flex-row items-end mb-6 px-4">
          <View className="h-6 w-1.5 bg-indigo-500 rounded-full mr-3 shadow-lg shadow-indigo-500" />
          <View>
            <Text className="text-indigo-400 text-[10px] font-black uppercase tracking-[3px]">Squad Manifest</Text>
            <Text 
              style={{ fontSize: rf(1.6) }} 
              className="text-white font-black uppercase italic tracking-tighter"
            >
              Elite Strike Team
            </Text>
          </View>
        </View>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} overScrollMode="never">
        <View className="flex-row px-4">
          {selectedImages.map((imgId) => {
            const imgData = imagesArray.find((img) => img.id === imgId);
            if (!imgData) return null;

            const hasName = !!imageNames[imgData.id];

            return (
              <View 
                key={`selected-${imgId}`} 
                className="mr-6 items-center"
                style={{ width: rf(14) }}
              >
                {/* --- The Glass Avatar Frame --- */}
                <View className="relative">
                  {/* Subtle outer glow if name is entered */}
                  {hasName && (
                    <View className="absolute -inset-1 bg-indigo-500/30 rounded-[30px] blur-md" />
                  )}
                  
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => handleSelectedImageClick(imgData.id)}
                    className="bg-white/10 rounded-[28px] border-t-2 border-l-2 border-white/40 overflow-hidden"
                    style={{ 
                      width: rf(11), 
                      height: rf(11),
                      borderRightWidth: 1,
                      borderBottomWidth: 1,
                      borderRightColor: 'rgba(255,255,255,0.05)',
                      borderBottomColor: 'rgba(255,255,255,0.05)',
                    }}
                  >
                    <Image
                      source={imgData.image}
                      className={`w-full h-full ${hasName ? 'opacity-100' : 'opacity-60'}`}
                      resizeMode="cover"
                    />
                    
                    {/* Scanner Glass Effect */}
                    <View className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
                  </TouchableOpacity>

                  {/* Status Badge */}
                  <View className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full items-center justify-center border-2 border-[#020205] ${hasName ? 'bg-indigo-500' : 'bg-white/20'}`}>
                    <View className={`w-1.5 h-1.5 rounded-full ${hasName ? 'bg-white' : 'bg-white/40'}`} />
                  </View>
                </View>

                {/* --- Stylish Metamorphic Input --- */}
                <View className="mt-5 w-full bg-white/[0.03] border-b border-white/10 rounded-t-lg px-2">
                  <TextInput
                    className="text-white font-black text-center py-2"
                    style={{ fontSize: rf(1.1) }}
                    placeholder="ASSIGN NAME"
                    placeholderTextColor="rgba(255,255,255,0.15)"
                    value={imageNames[imgData.id] || ""}
                    onChangeText={(text) => handleNameChange(imgData.id, text)}
                    maxLength={10}
                    selectionColor="#818cf8"
                    autoCorrect={false}
                  />
                </View>
                
                {/* Visual "Processing" Indicators */}
                <View className="mt-2 flex-row space-x-1">
                  {[1, 2, 3].map((i) => (
                    <View 
                      key={i} 
                      className={`h-1 w-3 rounded-full ${hasName ? 'bg-indigo-500' : 'bg-white/5'}`} 
                    />
                  ))}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export const SelectedImageGrid = memo(SelectedImageGridComponent);