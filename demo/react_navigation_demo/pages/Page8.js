import React from 'react';
import { Button, StyleSheet, Text, View, SectionList, RefreshControl, ActivityIndicator, TouchableHighlight } from 'react-native';
const CITY_NAMES = [{ data: ['北京', '上海', '广州', '深圳'], title: '一线' }, { data: ['杭州', '苏州', '南京', '武汉', '成都'], title: '二线' }];
export default class Page8 extends React.Component {
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
            <SectionList
                sections={this.state.dataArray}//数据源
                renderItem={(data) => this._renderItem(data)}//renderItem={section,item,index}数据源回调，section是当前section的数据源，item是当前的item数据源，index是当前的item索引。
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
                ListFooterComponent={() => this.getIndicator()}//上拉加载
                onEndReached={() => this.loadData(false)}
                //分组头部
                renderSectionHeader={
                    (data) => {return this._renderSectionHeader(data)}
                    //this._renderSectionHeader
                }
                keyExtractor={(item, index) => item + index}
                //分割线
                ItemSeparatorComponent={() => {
                    return <View style={styles.separator}></View>
                }}
            ></SectionList>
        </View>
    }

    //相当于const {section} = data.section;
    _renderSectionHeader({ section }) {
        return <Text style={styles.headerTextStyle}>{section.title}</Text>
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
        height: 100,
        justifyContent: 'center',
        flexDirection: 'row',
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
    headerTextStyle: {
        height: 50,
        textAlign: 'center',
        textAlignVertical: 'center',
        backgroundColor: '#00ff00',
        color: 'white',
        fontSize: 30
    },
    separator: {
        height: 1,
        backgroundColor: 'gray',
        flex: 1
    }
});