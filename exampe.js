import React from "react";
import { PanGestureHandler, State, ScrollView } from 'react-native-gesture-handler';
import {LoremIpsum} from "./common";

class Random extends React.Component {
    ref = React.createRef();
    scrollRef = React.createRef();
    state = {
        enable: true
    };
    _onScrollDown = (event) => {
        if (!this.state.enable) return;
        console.log('here')
        const {translationY} = event.nativeEvent;
        // handle PanGesture event here
    };

    _onScroll = ({nativeEvent}) => {
        if (nativeEvent.contentOffset.y <= 0 && !this.state.enable) {
            this.setState({enable: true });
        }
        if (nativeEvent.contentOffset.y > 0 && this.state.enable) {
            this.setState({enable: false});
        }
    };

    render () {
        const { enable } = this.state;
        return (
            <PanGestureHandler
                enabled={enable}
                ref={this.ref}
                activeOffsetY={5}
                failOffsetY={-5}
                onGestureEvent={this._onScrollDown}
            >
            <ScrollView
                ref={this.scrollRef}
                waitFor={enable ? this.ref : this.scrollRef}
                scrollEventThrottle={40}
                onScroll={this._onScroll}
            >
                    <LoremIpsum />
                    <LoremIpsum />
            </ScrollView>
            </PanGestureHandler>
        );
    }
}

export default Random;