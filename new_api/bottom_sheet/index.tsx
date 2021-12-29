import React, {useEffect, useRef, useState} from 'react';
import {Dimensions, StyleSheet, useWindowDimensions, View} from 'react-native';
import {
    Gesture,
    GestureDetector, NativeViewGestureHandler, PanGestureHandler,
    PanGestureHandlerEventPayload, PanGestureHandlerStateChangeEvent,
} from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedGestureHandler,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import {LoremIpsum} from "../../common";

const HEADER_HEIGTH = 50;
const windowHeight = Dimensions.get('window').height;
const SNAP_POINTS_FROM_TOP = [ 100, windowHeight* 0.5];

const FULLY_OPEN_SNAP_POINT = SNAP_POINTS_FROM_TOP[0];
const CLOSED_SNAP_POINT = SNAP_POINTS_FROM_TOP[SNAP_POINTS_FROM_TOP.length - 1];

function Example() {
    const panGestureRef = useRef(Gesture.Pan());
    const headerGesture2 = useRef(Gesture.Pan());
    const scrollViewGestureRef = useRef(Gesture.Native());
    const blockScrollUntilAtTheTopRef = useRef(Gesture.Tap());
    const [snapPoint, setSnapPoint] = useState(CLOSED_SNAP_POINT);
    const [enabled, setEnabled] = useState(true);
    const [valM, setValM] = useState(1)
    const translationY = useSharedValue(0);
    const scrollOffset = useSharedValue(0);
    const bottomSheetTranslateY = useSharedValue(CLOSED_SNAP_POINT);

    const onHandlerEnd = ({ velocityY }: PanGestureHandlerEventPayload) => {
        console.log(`on handler end with velocity = ${velocityY}`)
        // const dragToss = 0.05;
        // const endOffsetY =
        //     bottomSheetTranslateY.value + translationY.value + velocityY * dragToss;
        //
        // // calculate nearest snap point
        // let destSnapPoint = FULLY_OPEN_SNAP_POINT;
        //
        // if (
        //     snapPoint === FULLY_OPEN_SNAP_POINT &&
        //     endOffsetY < FULLY_OPEN_SNAP_POINT
        // ) {
        //     return;
        // }
        //
        // for (const snapPoint of SNAP_POINTS_FROM_TOP) {
        //     const distFromSnap = Math.abs(snapPoint - endOffsetY);
        //     if (distFromSnap < Math.abs(destSnapPoint - endOffsetY)) {
        //         destSnapPoint = snapPoint;
        //     }
        // }
        //
        // // update current translation to be able to animate withSpring to snapPoint
        // bottomSheetTranslateY.value =
        //     bottomSheetTranslateY.value + translationY.value;
        // translationY.value = 0;
        //
        // bottomSheetTranslateY.value = withSpring(destSnapPoint, {
        //     mass: 0.5,
        // });
        //
        // setSnapPoint(destSnapPoint);
    };

    const panGesture = Gesture.Pan()
        .onTouchesMove((e) => {
        })
        .onUpdate((e) => {
            // when bottom sheet is not fully opened scroll offset should not influence
            // its position (prevents random snapping when opening bottom sheet when
            // the content is already scrolled)
            if (snapPoint === FULLY_OPEN_SNAP_POINT) {
                translationY.value = e.translationY - scrollOffset.value;
            } else {
                translationY.value = e.translationY;
            }
        })
        .onEnd(onHandlerEnd)
        .withRef(panGestureRef);

    const dimensions = useWindowDimensions();
    const top = useSharedValue(
        dimensions.height
    );

    const initialHeight = useSharedValue(
        dimensions.height/2
    );

    const scrollViewGesture = Gesture.Native()
        .requireExternalGestureToFail(headerGesture2)
        .onStart((e) => {
        })
        .onTouchesMove((e) => {
        }).onTouchesDown((e, stateManager) => {
            stateManager.fail
        })
        .onTouchesUp((e) => {
            console.log('scroll view touch up')
        })
        .withRef(scrollViewGestureRef)
        // .simultaneousWithExternalGesture(headerGesture2)
    ;

    useEffect(() => {
        top.value = initialHeight.value
    }, []);

    useEffect(() => {
        console.log(`re rendering ----------------`)
    })

    const headerGesture = Gesture.Pan()
        .onStart((e) => {
            // tempTop = top.value
        })
        .onUpdate((e) => {
            // translationY.value = e.translationY;

            if(e.translationY < 0) {
                console.log('moving up')
                // updateFlag()
                // 'worklet';
                // runOnJS(() => {
                //     setEnabled(true)
                // })
            } else {
                console.log('moving down hg')
            }
            top.value = initialHeight.value + e.translationY
        })
        .onTouchesDown((e, stateManager) => {
            // stateManager.fail()
            // stateManager.activate
        })
        .onTouchesUp((e) => {
        })
        .onEnd((e) => {
            initialHeight.value = top.value
        })
        .simultaneousWithExternalGesture(scrollViewGestureRef)
        // .requireExternalGestureToFail(scrollViewGesture)
        .manualActivation(true)
        .withRef(headerGesture2)
    ;

    const blockScrollUntilAtTheTop = Gesture.Tap()
        .maxDeltaY(dimensions.height/2)
        .maxDuration(100000)
        .simultaneousWithExternalGesture(headerGesture)
        .withRef(blockScrollUntilAtTheTopRef)
        .onTouchesMove((e) => {
            console.log('on move gesture tap')
        });



    const bottomSheetAnimatedStyle = useAnimatedStyle(() => {
        // const translateY = bottomSheetTranslateY.value + translationY.value;
        //
        // const minTranslateY = Math.max(FULLY_OPEN_SNAP_POINT, translateY);
        // const clampedTranslateY = Math.min(CLOSED_SNAP_POINT, minTranslateY);
        return {
            top: top.value
        }
        // return {
        //     transform: [{ translateY: translationY.value }],
        // };
    });

    const _onScroll = ({nativeEvent}) => {
        if (nativeEvent.contentOffset.y <= 0 && enabled) {
            console.log('disable scroll')
            setEnabled(false)
        }
        if (nativeEvent.contentOffset.y > 0 && !enabled) {
            console.log('enable scroll')
            setEnabled(true)
        }
    };

    const SPRING_CONFIG = {
        damping: 80,
        overshootClamping: true,
        restDisplacementThreshold: 0.1,
        restSpeedThreshold: 0.1,
        // stiffness: 0,
    };


    const GestureManual = Gesture.Manual()
        .onTouchesDown((e, stateManager) => {
            if (e.numberOfTouches >= 2) {
                // console.log('activating');
                stateManager.activate();
            }
            // stateManager.activate();
        })
        .onTouchesMove((e) => {
        })
        .onUpdate((e)=> {
        });

    const runWithSlide = (position: number) => {
        'worklet';

        // top.value = withSpring(position, SPRING_CONFIG);
        top.value = position
        initialHeight.value = top.value
    }

    const onHandlerStateChange = ({
                                    nativeEvent,
                                }: PanGestureHandlerStateChangeEvent) => {
        if(enabled) {
            return;
        }
        if(nativeEvent.translationY < 0) {
            setEnabled(true)
            // updateFlag()
            // 'worklet';
            // runOnJS(() => {
            //     setEnabled(true)
            // })
        } else {
            if(nativeEvent.translationY > 80) {
                console.log('moving down')
                top.value = withSpring(
                    dimensions.height,
                    SPRING_CONFIG,
                );
            }
            // top.value = dimensions.height

        }

    };

    const dismisEnalbleFlag = (value) => {

        setEnabled(value)
        setValM(2)
    }

    const gestureHandler = useAnimatedGestureHandler({
        onStart(event, context: any) {
            // context.startTop = top.value;
        },
        onActive(event, context: any) {
            console.log(`here in new and enabled = ${enabled} and val = ${valM}`)
            if(enabled) {
                return;
            }
            if(event.translationY < 0) {
               runOnJS(dismisEnalbleFlag)(true)
            } else {
                top.value = initialHeight.value + event.translationY
                // context.startTop = top.value
            }
            // top.value = withSpring(
            //     context.startTop + event.translationY,
            //     SPRING_CONFIG,
            // );
        },
        onEnd(event) {
            initialHeight.value = top.value
            // if (height.value != null) {
            //     // TODO: Wrong value of height is coming here
            //     if (
            //         config.isHideable &&
            //         (event.velocityY > 1000 || top.value > height.value / 2)
            //     ) {
            //         dismissWithSlideAnimation(DismissTriggerType.MODAL_DRAG, null);
            //     } else {
            //         runSpringAnimation(0);
            //     }
            // }
        },
    });

    return (
        <View style={styles.container}>
            <LoremIpsum words={200} />
            <GestureDetector gesture={headerGesture}>
                <Animated.View style={[styles.bottomSheet, bottomSheetAnimatedStyle]}>
                    {/*<GestureDetector gesture={headerGesture}>*/}
                        <View style={styles.header} />
                    {/*</GestureDetector>*/}
                    {/*<GestureDetector*/}
                    {/*    gesture={Gesture.Simultaneous(headerGesture, scrollViewGesture)}>*/}
                    {/*<GestureDetector gesture={GestureManual}>*/}
                    <PanGestureHandler
                        ref={headerGesture2}
                        simultaneousHandlers={[scrollViewGestureRef]}
                        onHandlerStateChange={gestureHandler}>
                        <Animated.View >
                            <NativeViewGestureHandler
                                ref={scrollViewGestureRef}
                                simultaneousHandlers={headerGesture2}>
                        <Animated.ScrollView
                            bounces={false}
                            scrollEventThrottle={1}
                            scrollEnabled={enabled}
                            overScrollMode={"never"}
                            onScroll={_onScroll}
                        >
                            <LoremIpsum />
                            <LoremIpsum />
                            <LoremIpsum />
                        </Animated.ScrollView>
                            </NativeViewGestureHandler>
                        </Animated.View>
                    </PanGestureHandler>
                    {/*</GestureDetector>*/}
                    {/*</GestureDetector>*/}
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
        // paddingBottom: 50,
    },
    header: {
        height: HEADER_HEIGTH,
        backgroundColor: 'coral',
    },
    bottomSheet: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#ff9f7A',
        // marginBottom: 150,
    },
});

export default Example;
