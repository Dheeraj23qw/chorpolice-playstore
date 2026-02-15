// import React, { useEffect } from 'react';
// import { View, Text, Pressable, Dimensions } from 'react-native';
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withTiming,
//   withSpring,
//   runOnJS,
// } from 'react-native-reanimated';
// import { useDispatch, useSelector } from 'react-redux';
// import { RootState } from '@/redux/store';
// import { dismissAlert, Alert as AlertType } from '@/features/alerts/alertSlice';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { Trophy, X } from 'lucide-react-native';

// const { width } = Dimensions.get('window');

// export const AlertContainer = () => {
//   const alerts = useSelector((state: RootState) => state.alerts.alerts);
//   const insets = useSafeAreaInsets();

//   return (
//     <View
//       style={{
//         position: 'absolute',
//         top: insets.top + 10,
//         left: 0,
//         right: 0,
//         alignItems: 'center',
//         zIndex: 9999,
//       }}
//       pointerEvents="box-none"
//     >
//       {alerts.map((alert, index) => (
//         <AlertItem key={alert.id} alert={alert} index={index} />
//       ))}
//     </View>
//   );
// };

// const AlertItem = ({ alert, index }: { alert: AlertType; index: number }) => {
//   const dispatch = useDispatch();

//   const translateY = useSharedValue(-100);
//   const opacity = useSharedValue(0);

//   // Animate in
//   useEffect(() => {
//     translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
//     opacity.value = withTiming(1, { duration: 300 });

//     const timer = setTimeout(() => {
//       // Animate out
//       translateY.value = withTiming(-100, { duration: 300 });
//       opacity.value = withTiming(0, { duration: 300 }, () => {
//         runOnJS(dispatch)(dismissAlert(alert.id));
//       });
//     }, alert.duration || 3000);

//     return () => clearTimeout(timer);
//   }, []);

//   const animatedStyle = useAnimatedStyle(() => ({
//     transform: [{ translateY: translateY.value }],
//     opacity: opacity.value,
//   }));

//   const bgColor =
//     alert.type === 'success' ? 'bg-emerald-500' : 'bg-amber-500';

//   return (
//     <Animated.View
//       style={[
//         animatedStyle,
//         {
//           width: width * 0.9,
//           borderRadius: 12,
//           padding: 16,
//           marginBottom: 10,
//           flexDirection: 'row',
//           alignItems: 'center',
//           shadowColor: '#000',
//           shadowOffset: { width: 0, height: 2 },
//           shadowOpacity: 0.25,
//           shadowRadius: 3.84,
//           elevation: 5,
//           backgroundColor: alert.type === 'success' ? '#10b981' : '#f59e0b',
//         },
//       ]}
//     >
//       <Pressable
//         onPress={() => {
//           // Animate out manually on press
//           translateY.value = withTiming(-100, { duration: 300 });
//           opacity.value = withTiming(0, { duration: 300 }, () => {
//             runOnJS(dispatch)(dismissAlert(alert.id));
//           });
//         }}
//         style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
//       >
//         <Trophy color="white" size={24} style={{ marginRight: 12 }} />
//         <View style={{ flex: 1 }}>
//           <Text className="text-white font-bold text-base">
//             {alert.title || 'Notification'}
//           </Text>
//           <Text className="text-white text-sm mt-1">{alert.message}</Text>
//         </View>
//         <Pressable
//           onPress={() => {
//             translateY.value = withTiming(-100, { duration: 300 });
//             opacity.value = withTiming(0, { duration: 300 }, () => {
//               runOnJS(dispatch)(dismissAlert(alert.id));
//             });
//           }}
//         >
//           <X color="white" size={20} />
//         </Pressable>
//       </Pressable>
//     </Animated.View>
//   );
// };
