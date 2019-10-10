import React from 'react';
import { Button, StyleSheet, Text, View, SwipeableFlatList, RefreshControl, ActivityIndicator, TouchableHighlight } from 'react-native';
const CITY_NAMES = ['北京', '上海', '广州', '深圳', '苏州', '杭州'];
export default class Page7 extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            dataArray: CITY_NAMES
        }
    }
    render() {
        const { navigation } = this.props;
        return <View style={{ flex: 1 }}>
            <SwipeableFlatList
                data={this.state.dataArray}
                renderItem={(data) => this._renderItem(data)}
                // refreshing={this.state.isLoading}
                // onRefresh={() => {
                //     this.loadData();
                // }}
                //通过refreshControl定制下拉加载样式
                refreshControl={
                    <RefreshControl
                        title={'loading'}
                        colors={['red', 'blue']}
                        refreshing={this.state.isLoading}
                        onRefresh={() => this.loadData(true)}
                    />
                }
                ListFooterComponent={() => this.getIndicator()}//上拉加载
                onEndReached={() => this.loadData(false)}
                renderQuickActions={() => this.genQuickActions()} //侧滑菜单
                maxSwipeDistance={100}//可展开（滑动）的距离
                bounceFirstRowOnMount={false}//进去的时候不展示侧滑效果
            ></SwipeableFlatList>
        </View>
    }
    genQuickActions() {
        return <View style={styles.quickAContent}>
            <TouchableHighlight
                onPress={() => alert("确认删除？")}
            >
                <View style={styles.quick}>
                    <Text style={styles.delete}>删除</Text>
                </View>
            </TouchableHighlight>
        </View>
    }
    getIndicator() {
        return <View>
            <ActivityIndicator
                style={styles.indictorContainer}
                size={'large'}
                animating={true}
                color={'red'}
            />
            <Text style={styles.indictor}>正在加载更多</Text>
        </View>
    }
    _renderItem(data) {
        return <View style={styles.item} >
            <Text style={styles.text}>{data.item}</Text>
        </View>
    }
    loadData(isRefresh) {
        if (isRefresh) {
            this.setState({
                isLoading: true
            }, () => {
                this.state.dataArray = [];
                this.refreshData();
            });
        } else {
            this.refreshData();
        }

    }
    refreshData() {
        setTimeout(() => {
            let dataArray = this.state.dataArray.concat(CITY_NAMES);
            this.setState({
                isLoading: false,
                dataArray: dataArray
            });
        }, 2000);
    }
}
const styles = StyleSheet.create({
    item: {
        backgroundColor: '#aeffb1',
        marginRight: 15,
        marginLeft: 15,
        marginBottom: 10,
        height: 100,
        justifyContent: 'center',
        flexDirection: 'row',
        elevation: 5,
    },
    text: {
        fontSize: 20,
        textAlignVertical: 'center'
    },
    indictorContainer: {
        marginTop: 10,
        alignItems: 'center'
    },
    indictor: {
        marginTop: 10,
        textAlign: 'center'
    },
    //侧滑菜单的样式
    quickAContent: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginRight: 15,
        marginBottom: 10,
    },
    quick: {
        backgroundColor: "#ff1d49",
        flex: 1,
        alignItems: 'flex-end',//水平靠右
        justifyContent: 'center',//上下居中
        width: 100,
        elevation: 5,//漂浮的效果

    },
    delete: {
        color: "#d8fffa",
        marginRight: 30
    }
});