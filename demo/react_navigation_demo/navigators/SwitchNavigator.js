import React from 'react';
import {createStackNavigator, createSwitchNavigator} from 'react-navigation';
import Page1 from '../pages/Page1'
import Login from '../pages/Login'
import HomePage from '../pages/HomePage'

const AppStack = createStackNavigator({
    Home: {
        screen: HomePage
    },
    Page1: {
        screen: Page1
    }
});
const AuthStack = createStackNavigator({
    Login: {
        screen: Login
    },
},{
    navigationOptions: {
        // header: null,// 可以通过将header设为null 来禁用StackNavigator的Navigation Bar
    }
});
//配置了两个路由,默认显示Auth: AuthStack,跳到 App: AppStack后，上一页面就回不去了。可用于登录场景  
export default createSwitchNavigator(
    {
        Auth: AuthStack,
        App: AppStack,
    },
    {
        initialRouteName: 'Auth',
    }
);