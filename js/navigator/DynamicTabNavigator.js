import React, { Component } from 'react';
import { createBottomTabNavigator, createAppContainer } from "react-navigation";
import { connect } from 'react-redux';
import PopularPage from '../page/PopularPage';
import TrendingPage from '../page/TrendingPage';
import FavoritePage from '../page/FavoritePage';
import MyPage from '../page/MyPage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import EventTypes from '../util/EventTypes';
import { BottomTabBar } from 'react-navigation-tabs';
import EventBus from 'react-native-event-bus'

type Props = {};

const TABS = {//在这里配置页面的路由
    PopularPage: {
        screen: PopularPage,
        navigationOptions: {
            tabBarLabel: "最热",
            //使用大括号,return也行 ({tintColor, focused}) => {return <MaterialIcons  ...  />}
            //或者不使用小括号,直接<MaterialIcons ... />也行
            tabBarIcon: ({ tintColor, focused }) => (
                <MaterialIcons
                    name={'whatshot'}
                    size={26}
                    style={{ color: tintColor }}
                />
            ),
        }
    },
    TrendingPage: {
        screen: TrendingPage,
        navigationOptions: {
            tabBarLabel: "趋势",
            tabBarIcon: ({ tintColor, focused }) => (
                <Ionicons
                    name={'md-trending-up'}
                    size={26}
                    style={{ color: tintColor }}
                />
            ),
        }
    },
    FavoritePage: {
        screen: FavoritePage,
        navigationOptions: {
            tabBarLabel: "收藏",
            tabBarIcon: ({ tintColor, focused }) => (
                <MaterialIcons
                    name={'favorite'}
                    size={26}
                    style={{ color: tintColor }}
                />
            ),
        }
    }
    ,
    MyPage: {
        screen: MyPage,
        navigationOptions: {
            tabBarLabel: "我的",
            tabBarIcon: ({ tintColor, focused }) => (
                <Entypo
                    name={'user'}
                    size={26}
                    style={{ color: tintColor }}
                />
            ),
        }
    }
};

/**
 * 首页底部的Tab
 */
class DynamicTabNavigator extends Component<Props> {
    constructor(props) {
        super(props);
        console.disableYellowBox = true;
    }

    _tabNavigator() {
        //防止UI更新重新创建Tabs(因为只要一重新创建,因为只要一创建就会默认定位到第一个Tab)
        if (this.Tabs) {
            return this.Tabs;
        }
        const { PopularPage, TrendingPage, FavoritePage, MyPage } = TABS;

        const tabs = { PopularPage, TrendingPage, FavoritePage, MyPage };//根据需要定制显示的tab
        PopularPage.navigationOptions.tabBarLabel = '最热';//动态配置Tab属性

        return this.Tabs = createAppContainer(createBottomTabNavigator(tabs, {
            // tabBarComponent: TabBarComponent,接收props里的theme
            tabBarComponent: props => {
                //自定义底部组件,并且给其props添加了theme属性,通过设置theme来设置activeTintColor(选中时的色值)
                return <TabBarComponent theme={this.props.theme} {...props} />
            }
        }
        ))
    }

    render() {
        const Tab = this._tabNavigator();
        return <Tab
            //底部tab发生切换时回调
            onNavigationStateChange={(prevState, newState, action) => {
                //第一个参数,时间名称，相当于key,第二个参数,携带的数据
                EventBus.getInstance().fireEvent(EventTypes.bottom_tab_select, {//发送底部tab切换的事件
                    from: prevState.index,//切换前tab的Index
                    to: newState.index//切换后tab的Index
                })
            }}
        />
    }
}

class TabBarComponent extends React.Component {
    constructor(props) {
        super(props);

    }

    render() {
        return <BottomTabBar
            {...this.props}
            activeTintColor={this.props.theme.themeColor}
        />
    }
}

//将state里的theme关联到props中theme --> 将theme传递给TabBarComponent
const mapStateToProps = state => ({
    theme: state.theme.theme,
});

export default connect(mapStateToProps)(DynamicTabNavigator);
