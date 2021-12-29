// import {Animated} from "react-native";
// import {useAnimatedStyle, useSharedValue, withTiming} from "react-native-reanimated";
// import {Gesture, GestureDetector} from "react-native-gesture-handler";
//
//
// interface Pointer {
//     visible: boolean;
//     x: number;
//     y: number;
// }
//
// export default function Example() {
//     const offset = useSharedValue({ x: 0, y: 0 });
//     const start = useSharedValue({ x: 0, y: 0 });
//     const popupPosition = useSharedValue({ x: 0, y: 0 });
//     const popupAlpha = useSharedValue(0);
//
//     const animatedStyles = useAnimatedStyle(() => {
//         return {
//             transform: [{ translateX: offset.value.x }, { translateY: offset.value.y }],
//         };
//     });
//
//     const animatedPopupStyles = useAnimatedStyle(() => {
//         return {
//             transform: [
//                 { translateX: popupPosition.value.x },
//                 { translateY: popupPosition.value.y },
//             ],
//             opacity: popupAlpha.value,
//         };
//     });
//
//     const dragGesture = Gesture.Pan()
//         .onStart((_e) => {
//             popupAlpha.value = withTiming(0);
//         })
//         .onUpdate((e) => {
//             offset.value = {
//                 x: e.translationX + start.value.x,
//                 y: e.translationY + start.value.y,
//             };
//         })
//         .onEnd(() => {
//             start.value = {
//                 x: offset.value.x,
//                 y: offset.value.y,
//             };
//         });
//
//     const longPressGesture = Gesture.LongPress().onStart((_event) => {
//         popupPosition.value = { x: offset.value.x, y: offset.value.y };
//         popupAlpha.value = withTiming(1);
//     });
//
//     const composed = Gesture.Race(dragGesture, longPressGesture);
//
//     return (
//         <Animated.View>
//             <Popup style={animatedPopupStyles} />
//             <GestureDetector gesture={composed}>
//                 <Component style={animatedStyles} />
//             </GestureDetector>
//         </Animated.View>
//     );
// }