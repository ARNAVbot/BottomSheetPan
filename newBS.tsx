import Animated, {
    runOnJS,
    useAnimatedGestureHandler,
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from "react-native-reanimated";
import {Button, StyleSheet, Text, useWindowDimensions, View} from "react-native";
import {NativeViewGestureHandler, PanGestureHandler} from "react-native-gesture-handler";
import {LoremIpsum} from "./common";
import React, {useEffect, useRef, useState} from "react";


const SPRING_CONFIG = {
    damping: 80,
    overshootClamping: true,
    restDisplacementThreshold: 0.1,
    restSpeedThreshold: 0.1,
    stiffness: 500
};

export default () => {

    const [enabled, setEnabled] = useState(true);
    const isEnabled = useSharedValue(true)

    const headerGesture2 = useRef();
    const scrollViewGestureRef = useRef();

    const dimesnions = useWindowDimensions();
    const top = useSharedValue(
        dimesnions.height
    );

    useEffect(() => {
        console.log(`---------------------re-rendered---------------`)
    })

    const style = useAnimatedStyle(() => {
        return {
            top: withSpring(top.value, SPRING_CONFIG)
        };
    });

    const gestureHandler = useAnimatedGestureHandler({
        onStart(_, context) {
            if (isEnabled.value == true) {
                console.log('yayyyy')
                return
            }
            console.log(`yolo1`)
            context.startTop = top.value
        },
        onActive(event, context) {
            if (isEnabled.value == true) {
                return
            }
            console.log(`yolo2`)
            if (event.translationY < 0) {
                isEnabled.value = true
                runOnJS(setEnabled)(true)
            } else {
                top.value = context.startTop + event.translationY
            }
        },
        onEnd() {
            if (isEnabled.value == true) {
                return
            }
            console.log(`yolo3`)
            if (top.value > dimesnions.height / 2 - 200) {
                top.value = dimesnions.height;
            } else {
                top.value = 50;
            }
        }
    }, [enabled, isEnabled]);

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

    return (
        <>
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>

                <Button title={"open sheet"} onPress={() => {
                    top.value = withSpring(
                        50,
                        SPRING_CONFIG
                    )
                }}/>

            </View>
            <PanGestureHandler>
                <Animated.View
                    style={[
                        {
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'white',
                            borderTopLeftRadius: 20,
                            borderTopRightRadius: 20,
                            shadowColor: '#000',
                            shadowOffset: {
                                width: 0,
                                height: 2,
                            },
                            shadowOpacity: 0.25,
                            shadowRadius: 3.84,
                            elevation: 5,
                            padding: 20,
                            justifyContent: 'center',
                            alignItems: 'center'
                        },
                        style
                    ]}>
                    <PanGestureHandler
                        ref={headerGesture2}
                        simultaneousHandlers={scrollViewGestureRef}
                        onGestureEvent={gestureHandler}>
                        <Animated.View
                        >
                            <NativeViewGestureHandler
                                ref={scrollViewGestureRef}
                                simultaneousHandlers={headerGesture2}
                            >
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

        </>
    )
}