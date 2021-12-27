import React, {useEffect, useRef, useState} from 'react';
import {Dimensions, StyleSheet, useWindowDimensions, View} from 'react-native';
import {
    Gesture,
    GestureDetector,
    PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    runOnUI,
    useAnimatedGestureHandler,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import {LoremIpsum} from "../../common";
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
    const [enabled, setEnabled] = useState(true);
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

    const dimensions = useWindowDimensions();
    const top = useSharedValue(
        dimensions.height
    );

    const initialHeight = useSharedValue(
        dimensions.height/2
    );
    // let initialHeight = dimensions.height/2;

    let tempTop = 0;

    // const animatedGesture = useAnimatedGestureHandler({});

    const updateFlag = () => {
        setEnabled(true)
    }

    const headerGesture = Gesture.Pan()
        .onStart((e) => {
            // console.log(`in on start tep.value = ${top.value}`)
            // tempTop = top.value
            // console.log(`final temp value new = ${tempTop}`)
        })
        .onUpdate((e) => {
            console.log('in header on update')
            // console.log(`transaltion y = ${translationY.value}`);
            // console.log(`e.transalation Y  = ${e.translationY}`)
            // translationY.value = e.translationY;

            // console.log(`old top value = ${top.value}`)
            // console.log(`temp value new = ${tempTop}`)
            // console.log(`e.y = ${e.y}`);
            console.log(`e.transaltey = ${e.translationY}`);
            if(e.translationY < 0) {
                updateFlag()
                // 'worklet';
                // runOnJS(() => {
                //     setEnabled(true)
                // })
            } else {
                // console.log(`inital height = ${initialHeight.value}`)
                top.value = initialHeight.value + e.translationY
            }
            // console.log(`new top value = ${top.value}`)
        })
        .onTouchesDown((e) => {
            console.log('touching down')
        })
        .onTouchesUp((e) => {
            console.log('touching up')
        })
        .onEnd((e) => {
            console.log('ended');
            initialHeight.value = top.value
            // console.log(`inital height after endng = ${initialHeight}`)
        });

    const blockScrollUntilAtTheTop = Gesture.Tap()
        // .maxDeltaY(dimensions.height/2)
        // .maxDuration(100000)
        .simultaneousWithExternalGesture(headerGesture)
        .withRef(blockScrollUntilAtTheTopRef)
        .onTouchesMove((e) => {
            console.log('on move gesture tap')
        });


    const scrollViewGesture = Gesture.Native().requireExternalGestureToFail(
        headerGesture
    )
        .onStart((e) => {
            console.log(`on start of scroll`)
        })
        .onTouchesMove((e) => {
        console.log(`on touch move scroll view`)
            // console.log(`${e.changedTouches}`)
    }).onTouchesDown((e) => {
        console.log('scroll view touch down')
        })
        .onTouchesUp((e) => {
            console.log('scroll view touch up')
        });

    useEffect(() => {
       console.log('re rendered')
        top.value = initialHeight.value
    }, []);

    const bottomSheetAnimatedStyle = useAnimatedStyle(() => {
        // const translateY = bottomSheetTranslateY.value + translationY.value;
        //
        // const minTranslateY = Math.max(FULLY_OPEN_SNAP_POINT, translateY);
        // const clampedTranslateY = Math.min(CLOSED_SNAP_POINT, minTranslateY);
        console.log('bs animated')
        return {
            top: top.value
        }
        // return {
        //     transform: [{ translateY: translationY.value }],
        // };
    });

    const _onScroll = ({nativeEvent}) => {
        if (nativeEvent.contentOffset.y <= 0 && enabled) {
            setEnabled(false)
            // this.setState({enable: true });
        }
        if (nativeEvent.contentOffset.y > 0 && !enabled) {
            setEnabled(true)
            // this.setState({enable: false});
        }
    };

    return (
        <View style={styles.container}>
            <LoremIpsum words={200} />
            <GestureDetector gesture={headerGesture}>
                <Animated.View style={[styles.bottomSheet, bottomSheetAnimatedStyle]}>
                    {/*<GestureDetector gesture={headerGesture}>*/}
                        <View style={styles.header} />
                    {/*</GestureDetector>*/}
                    <GestureDetector
                        gesture={Gesture.Simultaneous(headerGesture, scrollViewGesture)}>
                        <Animated.ScrollView
                            bounces={false}
                            scrollEventThrottle={1}
                            scrollEnabled={enabled}
                            overScrollMode={"never"}
                            onScroll={_onScroll}
                            onScrollBeginDrag={(e) => {
                                scrollOffset.value = e.nativeEvent.contentOffset.y;
                            }}
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
