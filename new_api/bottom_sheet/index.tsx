import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, useWindowDimensions, View} from 'react-native';
import {
    NativeViewGestureHandler, PanGestureHandler,
} from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedGestureHandler,
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated';
import {LoremIpsum} from "../../common";

const HEADER_HEIGTH = 50;

function Example() {
    const headerGesture2 = useRef();
    const scrollViewGestureRef = useRef();
    const [enabled, setEnabled] = useState(true);

    const dimensions = useWindowDimensions();
    const top = useSharedValue(
        dimensions.height
    );
    const isEnabled = useSharedValue(true);

    const initialHeight = useSharedValue(
        dimensions.height / 2
    );

    useEffect(() => {
        top.value = initialHeight.value
    }, []);

    useEffect(() => {
        console.log('re-rendered')
    })


    const headerGestureAnimated = useAnimatedGestureHandler({
        onStart(event, context: any) {
            context.startingWithDown = true
        },
        onActive(event, context: any) {
            console.log('header')
            if (event.translationY < 0) {
                console.log('moving up')
            } else {
                console.log('moving down hg')
            }
            top.value = initialHeight.value + event.translationY
        },
        onEnd(event, context) {
            context.startingWithDown = false
            initialHeight.value = top.value
        },
    });


    const bottomSheetAnimatedStyle = useAnimatedStyle(() => {
        return {
            top: top.value
        }
    });

    const _onScroll = ({nativeEvent}) => {
        if (nativeEvent.contentOffset.y <= 0 && enabled) {
            console.log('disable scroll')
            isEnabled.value = false
            setEnabled(false)
        }
        if (nativeEvent.contentOffset.y > 0 && !enabled) {
            console.log('enable scroll')
            isEnabled.value = true
            setEnabled(true)
        }
    };

    const gestureHandler = useAnimatedGestureHandler({
        onStart(event, context: any) {
            console.log(`on starting with enabled = ${enabled}`)
            context.startingWithDown = true
            console.log(`startwith down in onStart = ${context.startingWithDown}`)
        },
        onActive(event, context: any) {
            console.log(`startwith down in onActive = ${context.startingWithDown}`)
            // console.log(`gh ${enabled} and isEnabled = ${isEnabled.value}`)
            if (isEnabled.value) {
                return;
            }
            if (event.translationY < 0) {
                console.log(`less than 0 and context = ${context.startingWithDown}`)
                isEnabled.value = true
                runOnJS(setEnabled)(true)
                // if (!context.startingWithDown) {
                //     top.value = initialHeight.value + event.translationY
                // } else {
                //     isEnabled.value = true
                //     runOnJS(setEnabled)(true)
                // }
            } else {
                top.value = initialHeight.value + event.translationY
                context.startingWithDown = false
            }
        },
        onEnd(event, context) {
            console.log(`came her`)
            context.startingWithDown = false
            initialHeight.value = top.value
        },
    },[enabled, isEnabled]);

    return (
        <View style={styles.container}>
            <LoremIpsum words={200}/>
            <PanGestureHandler
                onGestureEvent={headerGestureAnimated}
            >
                <Animated.View style={[styles.bottomSheet, bottomSheetAnimatedStyle]}>
                    <View style={styles.header}/>
                    <PanGestureHandler
                        ref={headerGesture2}
                        simultaneousHandlers={[scrollViewGestureRef]}
                        onGestureEvent={gestureHandler}>
                        <Animated.View>
                            <NativeViewGestureHandler
                                ref={scrollViewGestureRef}
                                simultaneousHandlers={[headerGesture2]}>
                                <Animated.ScrollView
                                    bounces={false}
                                    scrollEventThrottle={1}
                                    scrollEnabled={enabled}
                                    overScrollMode={"never"}
                                    onScroll={_onScroll}
                                >
                                    <LoremIpsum/>
                                    <LoremIpsum/>
                                    <LoremIpsum/>
                                </Animated.ScrollView>
                            </NativeViewGestureHandler>
                        </Animated.View>
                    </PanGestureHandler>
                </Animated.View>
            </PanGestureHandler>
            <View
                style={{height: 50}}/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#eef',
    },
    header: {
        height: HEADER_HEIGTH,
        backgroundColor: 'coral',
    },
    bottomSheet: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#ff9f7A',
    },
});

export default Example;
