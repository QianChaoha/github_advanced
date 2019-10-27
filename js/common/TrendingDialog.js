import React, { Component } from 'react'
import { Modal, Text, TouchableOpacity, StyleSheet, View, Platform, DeviceInfo } from 'react-native'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import TimeSpan from '../model/TimeSpan'

export const TimeSpans = [new TimeSpan('今 天', 'since=daily'),
new TimeSpan('本 周', 'since=weekly'), new TimeSpan('本 月', 'since=monthly')]
export default class TrendingDialog extends Component {
    //初始化state,还可以在构造方法中初始化
    state = {
        visible: false,
    };
    /**
     * 显示dialog
     */
    show() {
        this.setState({
            visible: true,
        })
    }
    /**
     * 隐藏dialog
     */
    dismiss() {
        this.setState({
            visible: false,
        })
    }

    render() {
        const { onClose, onSelect } = this.props;
        //Modal 图层组件 https://reactnative.cn/docs/modal.html#docsNav
        //visible:控制显示和隐藏  onRequestClose:图层关闭时回调
        return (<Modal
            transparent={true}
            visible={this.state.visible}
            onRequestClose={() => onClose}
        >
            <TouchableOpacity
                style={styles.container}
                //点击空白区域(内容区域之外)时隐藏dialog
                onPress={() => this.dismiss()}
            >
                {/* 三角符号 */}
                <MaterialIcons
                    name={'arrow-drop-up'}
                    size={36}
                    style={styles.arrow}
                />
                {/* 内容 */}
                <View style={styles.content}>
                    {TimeSpans.map((result, i, arr) => {
                        return <TouchableOpacity
                            key={i}
                            onPress={() => onSelect(arr[i])}
                            underlayColor='transparent'>
                            <View style={styles.text_container}>
                                <Text
                                    style={styles.text}
                                >{arr[i].showText}</Text>
                            </View>
                            {
                                i !== TimeSpans.length - 1 ? <View
                                    style={styles.line}
                                /> : null
                            }
                        </TouchableOpacity>
                    })}
                </View>
            </TouchableOpacity>
        </Modal>

        )
    }
}
const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        flex: 1,
        alignItems: 'center',
        paddingTop: DeviceInfo.isIPhoneX_deprecated ? 30 : 0
    },
    arrow: {
        marginTop: 40,
        color: 'white',
        padding: 0,//将MaterialIcons缝隙去掉
        margin: -15
    },
    content: {
        backgroundColor: 'white',
        borderRadius: 3,
        paddingTop: 3,
        paddingBottom: 3,
        marginRight: 3,
    },
    text_container: {
        alignItems: 'center',
        flexDirection: 'row'
    },
    text: {
        fontSize: 16,
        color: 'black',
        fontWeight: '400',
        padding: 8,
        paddingLeft: 26,
        paddingRight: 26
    },
    line: {
        height: 0.3,
        backgroundColor: 'darkgray',
    },
});
