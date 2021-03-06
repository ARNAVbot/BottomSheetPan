import React, {useEffect, useRef, useState} from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import {
    Gesture,
    GestureDetector,
    PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import {LoremIpsum} from "./common";
// import {LoremIpsum} from "./common";
// import { LoremIpsum } from '../../../src/common';

const HEADER_HEIGTH = 50;
const windowHeight = Dimensions.get('window').height;
const SNAP_POINTS_FROM_TOP = [ 100, windowHeight* 0.5];

const FULLY_OPEN_SNAP_POINT = SNAP_POINTS_FROM_TOP[0];
const CLOSED_SNAP_POINT = SNAP_POINTS_FROM_TOP[SNAP_POINTS_FROM_TOP.length - 1];

function Example() {
    const panGestureRef = useRef(Gesture.Pan());
    const blockScrollUntilAtTheTopRef = useRef(Gesture.Tap());
    const [snapPoint, setSnapPoint] = useState(CLOSED_SNAP_POINT);
    const translationY = useSharedValue(0);
    const scrollOffset = useSharedValue(0);
    const bottomSheetTranslateY = useSharedValue(CLOSED_SNAP_POINT);

    const onHandlerEnd = ({ velocityY }: PanGestureHandlerEventPayload) => {
        console.log(`on handler end with velocity = ${velocityY}`)
        const dragToss = 0.05;
        const endOffsetY =
            bottomSheetTranslateY.value + translationY.value + velocityY * dragToss;

        // calculate nearest snap point
        let destSnapPoint = FULLY_OPEN_SNAP_POINT;

        if (
            snapPoint === FULLY_OPEN_SNAP_POINT &&
            endOffsetY < FULLY_OPEN_SNAP_POINT
        ) {
            return;
        }

        for (const snapPoint of SNAP_POINTS_FROM_TOP) {
            const distFromSnap = Math.abs(snapPoint - endOffsetY);
            if (distFromSnap < Math.abs(destSnapPoint - endOffsetY)) {
                destSnapPoint = snapPoint;
            }
        }

        // update current translation to be able to animate withSpring to snapPoint
        bottomSheetTranslateY.value =
            bottomSheetTranslateY.value + translationY.value;
        translationY.value = 0;

        bottomSheetTranslateY.value = withSpring(destSnapPoint, {
            mass: 0.5,
        });

        setSnapPoint(destSnapPoint);
    };

    const panGesture = Gesture.Pan()
        .onTouchesMove((e) => {
            console.log('pan gesture on touches move')
        })
        .onUpdate((e) => {
            // when bottom sheet is not fully opened scroll offset should not influence
            // its position (prevents random snapping when opening bottom sheet when
            // the content is already scrolled)
            console.log('pan gesture')
            if (snapPoint === FULLY_OPEN_SNAP_POINT) {
                translationY.value = e.translationY - scrollOffset.value;
            } else {
                translationY.value = e.translationY;
            }
        })
        .onEnd(onHandlerEnd)
        .withRef(panGestureRef);

    const blockScrollUntilAtTheTop = Gesture.Tap()
        .maxDeltaY(snapPoint - FULLY_OPEN_SNAP_POINT)
        .maxDuration(100000)
        .simultaneousWithExternalGesture(panGesture)
        .withRef(blockScrollUntilAtTheTopRef)
        .onTouchesMove((e) => {
            console.log('on move gesture tap')
        });

    const headerGesture = Gesture.Pan()
        .onUpdate((e) => {
            console.log('in header on update')
            console.log(`transaltion y = ${translationY.value}`);
            console.log(`e.transalation Y  = ${e.translationY}`)
            translationY.value = e.translationY;
        })
        .onEnd(onHandlerEnd);

    const scrollViewGesture = Gesture.Native().requireExternalGestureToFail(
        blockScrollUntilAtTheTop
    )
        .onStart((e) => {
            console.log(`on start of scroll`)
        })
        .onTouchesMove((e) => {
            console.log(`on touch move scroll view`)
        });

    useEffect(() => {
        console.log('re rendered')
    });

    const bottomSheetAnimatedStyle = useAnimatedStyle(() => {
        const translateY = bottomSheetTranslateY.value + translationY.value;

        const minTranslateY = Math.max(FULLY_OPEN_SNAP_POINT, translateY);
        const clampedTranslateY = Math.min(CLOSED_SNAP_POINT, minTranslateY);
        console.log('bs animated')
        return {
            transform: [{ translateY: clampedTranslateY }],
        };
    });

    return (
        <View style={styles.container}>
            <LoremIpsum words={200} />
            <GestureDetector gesture={blockScrollUntilAtTheTop}>
                <Animated.View style={[styles.bottomSheet, bottomSheetAnimatedStyle]}>
                    <GestureDetector gesture={headerGesture}>
                        <View style={styles.header} />
                    </GestureDetector>
                    <GestureDetector
                        gesture={Gesture.Simultaneous(panGesture, scrollViewGesture)}>
                        <Animated.ScrollView
                            bounces={false}
                            scrollEventThrottle={1}
                            scrollEnabled={false}
                            overScrollMode={"never"}
                            onScrollBeginDrag={(e) => {
                                scrollOffset.value = e.nativeEvent.contentOffset.y;
                            }}
                            style={{paddingBottom:100, marginBottom:100}}
                        >
                            <LoremIpsum />
                            <LoremIpsum />
                            <LoremIpsum />
                        </Animated.ScrollView>
                    </GestureDetector>
                </Animated.View>
            </GestureDetector>
            <View
                style={{height:50}}/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#eef',
        paddingBottom: 50,
    },
    header: {
        height: HEADER_HEIGTH,
        backgroundColor: 'coral',
    },
    bottomSheet: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#ff9f7A',
        marginBottom: 150,
    },
});

export default Example;
