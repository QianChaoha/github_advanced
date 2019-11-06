import React, {Component} from 'react';
import {DeviceInfo, StyleSheet} from 'react-native';
import {WebView}from 'react-native-webview';
import NavigationBar from '../common/NavigationBar'
import ViewUtil from "../util/ViewUtil";
import NavigationUtil from "../navigator/NavigationUtil";
import BackPressComponent from "../common/BackPressComponent";
import SafeAreaViewPlus from "../common/SafeAreaViewPlus";
import GlobalStyles from "../res/styles/GlobalStyles";
type Props = {};

export default class WebViewPage extends Component<Props> {
    constructor(props) {
        super(props);
        this.params = this.props.navigation.state.params;
        const {title, url} = this.params;
        this.state = {
            title: title,
            url: url,
            canGoBack: false,
        };
        this.backPress = new BackPressComponent({backPress: () => this.onBackPress()});
    }

    componentDidMount() {
        this.backPress.componentDidMount();
    }

    componentWillUnmount() {
        this.backPress.componentWillUnmount();
    }

    onBackPress() {
        this.onBack();
        return true;
    }

    onBack() {
        if (this.state.canGoBack) {
            this.webView.goBack();
        } else {
            NavigationUtil.goBack(this.props.navigation);
        }
    }

    onNavigationStateChange(navState) {
        console.warn('---onNavigationStateChange---');
        this.setState({
            canGoBack: navState.canGoBack,
            url: navState.url,
        })
    }

    render() {
        const {theme} = this.params;
        let navigationBar = <NavigationBar
            title={this.state.title}
            style={theme.styles.navBar}
            leftButton={ViewUtil.getLeftBackButton(() => this.onBackPress())}
        />;

        return (
            <SafeAreaViewPlus
                style={GlobalStyles.root_container}
                topColor={theme.themeColor}
            >
                {navigationBar}
                <WebView
                    ref={webView => this.webView = webView}
                    startInLoadingState={true}//加载时候显示进度条
                    onNavigationStateChange={e => this.onNavigationStateChange(e)}//当导航状态发生变化的时候调用
                    source={{uri: this.state.url}}
                />
            </SafeAreaViewPlus>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: DeviceInfo.isIPhoneX_deprecated ? 30 : 0
    },
});
