import React, { Component } from 'react';
import { Alert, TouchableHighlight, StyleSheet, View, Text } from 'react-native';
import { connect } from 'react-redux';
import actions from '../action/index'
import NavigationUtil from '../navigator/NavigationUtil'
import NavigationBar from '../common/NavigationBar';
import LanguageDao, { FLAG_LANGUAGE } from "../expand/dao/LanguageDao";
import BackPressComponent from "../common/BackPressComponent";
import ViewUtil from "../util/ViewUtil";
import CheckBox from 'react-native-check-box'
import Ionicons from 'react-native-vector-icons/Ionicons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import ArrayUtil from "../util/ArrayUtil";
import SortableListView from 'react-native-sortable-listview'
import SafeAreaViewPlus from "../common/SafeAreaViewPlus";
import GlobalStyles from "../res/styles/GlobalStyles";

const THEME_COLOR = '#678';
type Props = {};

class SortKeyPage extends Component<Props> {
    constructor(props) {
        super(props);
        this.params = this.props.navigation.state.params;
        this.backPress = new BackPressComponent({ backPress: (e) => this.onBackPress(e) });
        this.languageDao = new LanguageDao(this.params.flag);
        this.state = {
            checkedArray: SortKeyPage._keys(this.props),//缺省为原始数据
        }
    }
    //生命周期:constructor --> getDerivedStateFromProps --> render --> componentDidMount
    //app打开 "趋势"模块后会发起action,此页面从reducer获取数据,假如没有打开过"趋势模块"，当前页面就会自己发起action
    //获取到数据后props就会改变，getDerivedStateFromProps就会被调用,重新将state返回，重新渲染
    static getDerivedStateFromProps(nextProps, prevState) {
        const checkedArray = SortKeyPage._keys(nextProps, null, prevState);
        //checkedArray没有数据时才重新赋值
        if (prevState.checkedArray.length === 0 && prevState.checkedArray !== checkedArray) {
            return {
                checkedArray: checkedArray,
            }
        }
        return null;
    }

    componentDidMount() {
        this.backPress.componentDidMount();
        //如果props中标签为空则从本地存储中获取标签
        if (SortKeyPage._keys(this.props).length === 0) {
            let { onLoadLanguage } = this.props;
            onLoadLanguage(this.params.flag);
        }
    }

    componentWillUnmount() {
        this.backPress.componentWillUnmount();
    }

    /**
     * 获取标签。只要state为false,返回的都是redux中的props.language[flag] || [];即原始数据
     * @param props
     * @param state
     * @returns {*}
     * @private
     */
    static _keys(props, state) {
        //如果state中有checkedArray则使用state中的checkedArray
        if (state && state.checkedArray && state.checkedArray.length) {
            return state.checkedArray;
        }
        //否则从原始数据中获取checkedArray

        //先获取flag
        const flag = SortKeyPage._flag(props);
        //再从redux中获取language
        let dataArray = props.language[flag] || [];
        //最后将dataArray中checked为true的数据加到keys返回
        let keys = [];
        for (let i = 0, j = dataArray.length; i < j; i++) {
            let data = dataArray[i];
            if (data.checked) keys.push(data);
        }
        return keys;
    }

    static _flag(props) {
        const { flag } = props.navigation.state.params;
        return flag === FLAG_LANGUAGE.flag_key ? "keys" : "languages";
    }

    onBackPress(e) {
        this.onBack();
        return true;
    }

    onSave(hasChecked) {
        if (!hasChecked) {
            //如果没有排序(原始数据和checkedArray相等)则直接返回
            if (ArrayUtil.isEqual(SortKeyPage._keys(this.props), this.state.checkedArray)) {
                NavigationUtil.goBack(this.props.navigation);
                return;
            }
        }
        //保存排序后的数据
        //获取排序后的数据
        //更新本地数据
        this.languageDao.save(this.getSortResult());

        //重新加载排序后的标签，以便其他页面能够及时更新
        const { onLoadLanguage } = this.props;
        //更新store
        onLoadLanguage(this.params.flag);
        NavigationUtil.goBack(this.props.navigation);
    }

    /**
     * 获取排序后的标签结果
     * @returns {Array}
     */
    getSortResult() {
        const flag = SortKeyPage._flag(this.props);
        //从原始数据中复制一份数据出来，以便对这份数据进行进行排序
        let sortResultArray = ArrayUtil.clone(this.props.language[flag]);
        //获取排序之前的排列顺序    originalCheckedArray相当于是sortResultArray中所有checked为true的数据
        const originalCheckedArray = SortKeyPage._keys(this.props);
        //遍历排序之前的数据，用排序后的数据checkedArray进行替换
        for (let i = 0, j = originalCheckedArray.length; i < j; i++) {
            let item = originalCheckedArray[i];
            //找到要替换的元素所在位置
            let index = this.props.language[flag].indexOf(item);
            //进行替换
            //index:数组开始下标
            //len: 替换/删除的长度
            //item:替换的值，删除操作的话 item为空
            sortResultArray.splice(index, 1, this.state.checkedArray[i]);
        }
        return sortResultArray;
    }


    onBack() {
        //原始数据和当前checkedArray不一致时说明位置有变动
        if (!ArrayUtil.isEqual(SortKeyPage._keys(this.props), this.state.checkedArray)) {
            Alert.alert('提示', '要保存修改吗？',
                [
                    {
                        text: '否', onPress: () => {
                            NavigationUtil.goBack(this.props.navigation)
                        }
                    }, {
                        text: '是', onPress: () => {
                            this.onSave(true);
                        }
                    }
                ])
        } else {
            NavigationUtil.goBack(this.props.navigation)
        }
    }

    render() {
        const { theme } = this.params;
        let title = this.params.flag === FLAG_LANGUAGE.flag_language ? '语言排序' : '标签排序';
        let navigationBar = <NavigationBar
            title={title}
            leftButton={ViewUtil.getLeftBackButton(() => this.onBack())}
            style={theme.styles.navBar}
            rightButton={ViewUtil.getRightButton('保存', () => this.onSave())}
        />;
        return <SafeAreaViewPlus
            style={GlobalStyles.root_container}
            topColor={theme.themeColor}
        >
            {navigationBar}
            {/* SortableListView可实现拖拽排序的效果,属性作用:https://www.helplib.com/GitHub/article_135279 */}
            <SortableListView
                data={this.state.checkedArray}
                order={Object.keys(this.state.checkedArray)}//按照什么来排序,Object.keys返回一个数组的所有key。返回结果按照升序排序
                onRowMoved={e => {
                    //item被移动的时候调用
                    this.state.checkedArray.splice(e.to, 0, this.state.checkedArray.splice(e.from, 1)[0])
                    this.forceUpdate()
                }}
                //渲染每行的item
                renderRow={row => <SortCell data={row} {...this.params} />}
            />
        </SafeAreaViewPlus>
    }
}

class SortCell extends Component {
    render() {
        const { theme } = this.props;
        return <TouchableHighlight
            underlayColor={'#eee'}//按下的颜色
            style={this.props.data.checked ? styles.item : styles.hidden}
            {...this.props.sortHandlers}>
            <View style={{ marginLeft: 10, flexDirection: 'row' }}>
                <MaterialCommunityIcons
                    name={'sort'}
                    size={16}
                    style={{ marginRight: 10, color: theme.themeColor }} />
                <Text>{this.props.data.name}</Text>
            </View>
        </TouchableHighlight>
    }
}

const mapPopularStateToProps = state => ({
    language: state.language,
});
const mapPopularDispatchToProps = dispatch => ({
    onLoadLanguage: (flag) => dispatch(actions.onLoadLanguage(flag))
});
//注意：connect只是个function，并不应定非要放在export后面
export default connect(mapPopularStateToProps, mapPopularDispatchToProps)(SortKeyPage);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    line: {
        flex: 1,
        height: 0.3,
        backgroundColor: 'darkgray',
    },
    hidden: {
        height: 0
    },
    item: {
        backgroundColor: "#F8F8F8",
        borderBottomWidth: 1,
        borderColor: '#eee',
        height: 50,
        justifyContent: 'center'
    },
});
