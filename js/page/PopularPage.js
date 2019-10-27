import React, { Component } from 'react';
import { StyleSheet, ActivityIndicator, Text, View, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import actions from '../action/index'
import { createMaterialTopTabNavigator, createAppContainer } from "react-navigation";
import NavigationUtil from '../navigator/NavigationUtil'
import PopularItem from '../common/PopularItem'
import Toast from 'react-native-easy-toast'
import NavigationBar from '../common/NavigationBar';
import FavoriteDao from "../expand/dao/FavoriteDao";
import { FLAG_STORAGE } from "../expand/dao/DataStore";
import FavoriteUtil from "../util/FavoriteUtil";
import EventBus from "react-native-event-bus";
import EventTypes from "../util/EventTypes";
import { FLAG_LANGUAGE } from "../expand/dao/LanguageDao";
import Ionicons from 'react-native-vector-icons/Ionicons'
import AnalyticsUtil from "../util/AnalyticsUtil";
const URL = 'https://api.github.com/search/repositories?q=';
const QUERY_STR = '&sort=stars';
const favoriteDao = new FavoriteDao(FLAG_STORAGE.flag_popular);
type Props = {};
/**
1.配置
const mapStateToProps = state => ({
    popular: state.popular
});
const mapDispatchToProps = dispatch => ({
    //将 dispatch(onRefreshPopular(storeName, url))绑定到props
    onRefreshPopular: (storeName, url, pageSize, favoriteDao) => dispatch(actions.onRefreshPopular(storeName, url, pageSize, favoriteDao)),
});
const PopularTabPage = connect(mapStateToProps, mapDispatchToProps)(PopularTab)

2.发起订阅
const { onRefreshPopular } = this.props;
onRefreshPopular(this.storeName, url, pageSize, favoriteDao)

3.发起网络请求获取数据
actions.onRefreshPopular --->  获取数据成功后dispatch到redux ---> redux包装成新的state

4.mapStateToProps方法拿到返回的数据
绑定数据源this.props.popular的FlatList刷新UI
*/
class PopularPage extends Component<Props> {
    constructor(props) {
        super(props);
        const { onLoadLanguage } = this.props;
        onLoadLanguage(FLAG_LANGUAGE.flag_key);
    }

    _genTabs() {
        const tabs = {};
        const { keys, theme } = this.props;
        keys.forEach((item, index) => {
            if (item.checked) {
                tabs[`tab${index}`] = {
                    //一般写法
                    //screen: PopularTabPage,
                    //下tab下页面传递参数写法。tabLabel:下面页面获取到tab的name  theme:获取主题
                    screen: props => <PopularTabPage {...props} tabLabel={item.name} theme={theme} />,
                    navigationOptions: {
                        title: item.name
                    }
                }
            }
        });
        return tabs;
    }
    renderRightButton() {
        const { theme } = this.props;
        return <TouchableOpacity
            onPress={() => {
                AnalyticsUtil.track("SearchButtonClick");
                NavigationUtil.goPage({ theme }, 'SearchPage')
            }}
        >
            <View style={{ padding: 5, marginRight: 8 }}>
                <Ionicons
                    name={'ios-search'}
                    size={24}
                    style={{
                        marginRight: 8,
                        alignSelf: 'center',
                        color: 'white',
                    }} />
            </View>
        </TouchableOpacity>
    }
    render() {
        const { keys, theme } = this.props;
        let statusBar = {
            backgroundColor: theme.themeColor,
            barStyle: 'light-content',
        };
        let navigationBar = <NavigationBar
            title={'最热'}
            statusBar={statusBar}
            style={theme.styles.navBar}
            rightButton={this.renderRightButton()}
        />;
        const TabNavigator = keys.length ? createAppContainer(createMaterialTopTabNavigator(
            this._genTabs(), {
            //设置顶部tab的样式
            tabBarOptions: {
                tabStyle: styles.tabStyle,
                upperCaseLabel: false,//是否使标签大写，默认为true
                scrollEnabled: true,//是否支持 选项卡滚动，默认false
                style: {
                    backgroundColor: theme.themeColor,//TabBar 的背景颜色
                    height: 30//fix 开启scrollEnabled后再Android上初次加载时闪烁问题
                },
                indicatorStyle: styles.indicatorStyle,//标签指示器的样式
                labelStyle: styles.labelStyle,//文字的样式
            },
            lazy: true
        }
        )) : null;
        return <View style={styles.container}>
            {navigationBar}
            {TabNavigator && <TabNavigator />}
        </View>
    }
}

const mapPopularStateToProps = state => ({
    keys: state.language.keys,
    theme: state.theme.theme,
});
const mapPopularDispatchToProps = dispatch => ({
    onLoadLanguage: (flag) => dispatch(actions.onLoadLanguage(flag))
});
//注意：connect只是个function，并不应定非要放在export后面
export default connect(mapPopularStateToProps, mapPopularDispatchToProps)(PopularPage);


const pageSize = 10;//设为常量，防止修改
class PopularTab extends Component<Props> {
    constructor(props) {
        super(props);
        const { tabLabel } = this.props;
        this.storeName = tabLabel;
        this.isFavoriteChanged = false;
    }

    componentDidMount() {
        this.loadData();
        EventBus.getInstance().addListener(EventTypes.favorite_changed_popular, this.favoriteChangeListener = () => {
            this.isFavoriteChanged = true;
        });
        EventBus.getInstance().addListener(EventTypes.bottom_tab_select, this.bottomTabSelectListener = (data) => {
            if (data.to === 0 && this.isFavoriteChanged) {
                this.loadData(null, true);
            }
        })
    }

    componentWillUnmount() {
        EventBus.getInstance().removeListener(this.favoriteChangeListener);
        EventBus.getInstance().removeListener(this.bottomTabSelectListener);
    }

    loadData(loadMore, refreshFavorite) {
        const { onRefreshPopular, onLoadMorePopular, onFlushPopularFavorite } = this.props;
        const store = this._store();
        const url = this.genFetchUrl(this.storeName);
        if (loadMore) {
            //下拉刷新成功后,在ActionUtils中的handleData方法里dispatch的对象中设置pageIndex为1
            onLoadMorePopular(this.storeName, ++store.pageIndex, pageSize, store.items, favoriteDao, callback => {
                this.refs.toast.show('没有更多了');
            })
        } else if (refreshFavorite) {
            onFlushPopularFavorite(this.storeName, store.pageIndex, pageSize, store.items, favoriteDao);
        } else {
            onRefreshPopular(this.storeName, url, pageSize, favoriteDao)
        }
    }

    /**
     * 获取与当前页面有关的数据
     * @returns {*}
     * @private
     */
    _store() {
        const { popular } = this.props;//拿到最热模块的所有数据
        let store = popular[this.storeName];//从所有数据里拿到Java  Android数据给当前tab
        if (!store) {
            store = {
                items: [],//服务器一次性全部返回的数据
                isLoading: false,
                projectModels: [],//要显示的数据
                hideLoadingMore: true,//默认隐藏加载更多
            }
        }
        return store;
    }

    genFetchUrl(key) {
        return URL + key + QUERY_STR;
    }

    renderItem(data) {
        const item = data.item;
        const { theme } = this.props;
        return <PopularItem
            projectModel={item}
            theme={theme}
            onSelect={(callback) => {
                NavigationUtil.goPage({
                    theme,
                    projectModel: item,
                    flag: FLAG_STORAGE.flag_popular,
                    callback,
                }, 'DetailPage')
            }}
            onFavorite={(item, isFavorite) => FavoriteUtil.onFavorite(favoriteDao, item, isFavorite, FLAG_STORAGE.flag_popular)}
        />
    }

    genIndicator() {
        return this._store().hideLoadingMore ? null :
            <View style={styles.indicatorContainer}>
                {/* ActivityIndicator相当于ProgressBar */}
                <ActivityIndicator
                    style={styles.indicator}
                />
                <Text>正在加载更多</Text>
            </View>
    }

    render() {
        let store = this._store();
        const { theme } = this.props;
        return (
            <View style={styles.container}>
                <FlatList
                    data={store.projectModels}
                    renderItem={data => this.renderItem(data)}
                    keyExtractor={item => "" + item.item.id}
                    refreshControl={
                        <RefreshControl
                            title={'Loading'}
                            titleColor={theme.themeColor}
                            colors={[theme.themeColor]}
                            refreshing={store.isLoading}
                            onRefresh={() => this.loadData()}//下拉刷新时触发
                            tintColor={theme.themeColor}
                        />
                    }
                    ListFooterComponent={() => this.genIndicator()}
                    onEndReached={() => {//列表滚动到底部时回调
                        console.log('---onEndReached----');
                        //fix 滚动时两次调用onEndReached https://github.com/facebook/react-native/issues/14015
                        setTimeout(() => {//setTimeout防止极端情况onMomentumScrollBegin先调用
                            if (this.canLoadMore) {
                                this.loadData(true);
                                this.canLoadMore = false;
                            }
                        }, 100);
                    }}
                    //fix 初始化时页调用onEndReached的问题
                    onMomentumScrollBegin={() => {//触动列表刚开始滚动时候调用
                        this.canLoadMore = true; 
                        console.log('---onMomentumScrollBegin-----')
                    }}
                    onEndReachedThreshold={0.5}
                />
                <Toast ref={'toast'}
                    position={'center'}
                />
            </View>
        );
    }
}

const mapStateToProps = state => ({
    popular: state.popular
});
const mapDispatchToProps = dispatch => ({
    //将 dispatch(onRefreshPopular(storeName, url))绑定到props
    onRefreshPopular: (storeName, url, pageSize, favoriteDao) => dispatch(actions.onRefreshPopular(storeName, url, pageSize, favoriteDao)),
    onLoadMorePopular: (storeName, pageIndex, pageSize, items, favoriteDao, callBack) => dispatch(actions.onLoadMorePopular(storeName, pageIndex, pageSize, items, favoriteDao, callBack)),
    onFlushPopularFavorite: (storeName, pageIndex, pageSize, items, favoriteDao) => dispatch(actions.onFlushPopularFavorite(storeName, pageIndex, pageSize, items, favoriteDao)),
});
//注意：connect只是个function，并不应定非要放在export后面
const PopularTabPage = connect(mapStateToProps, mapDispatchToProps)(PopularTab)


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tabStyle: {
        // minWidth: 50 //fix minWidth会导致tabStyle初次加载时闪烁
        padding: 0
    },
    indicatorStyle: {
        height: 2,
        backgroundColor: 'white'
    },
    labelStyle: {
        fontSize: 13,
        margin: 0,
    },
    indicatorContainer: {
        alignItems: "center"
    },
    indicator: {
        color: 'red',
        margin: 10
    }
});
