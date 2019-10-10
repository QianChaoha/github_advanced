import React from 'react';
import { Button, StyleSheet, Text, View, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
const CITY_NAMES = ['北京', '上海', '广州', '深圳', '苏州', '杭州'];
export default class Page6 extends React.Component {
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
            <FlatList
                data={this.state.dataArray}
                renderItem={(data) => this._renderItem(data)}renderItem={section,item,index}//数据源回调，section是当前section的数据源，item是当前的item数据源，index是当前的item索引。
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
                        onRefresh={() => {
                            this.loadData(true);
                        }}

                    />
                }
                ListFooterComponent={() => this.getIndicator()}
                onEndReached={() => this.loadData(false)}
            ></FlatList>
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
    //这里data.item就是数组里的值,还有index属性
    _renderItem(data) {
                console.warn('--- '+JSON.stringify(data))

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
        backgroundColor: 'blue',
        marginTop: 20,
        paddingTop: 60,
        paddingBottom: 60,
        justifyContent: 'center',
        flexDirection: 'row'
    },
    text: {
        fontSize: 20,
    },
    indictorContainer: {
        marginTop: 10,
        alignItems: 'center'
    },
    indictor: {
        marginTop: 10,
        textAlign: 'center'
    }
});