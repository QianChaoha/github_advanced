import React, { Component } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import actions from '../action/index'
import NavigationUtil from '../navigator/NavigationUtil'
import NavigationBar from '../common/NavigationBar';
import LanguageDao, { FLAG_LANGUAGE } from "../expand/dao/LanguageDao";
import BackPressComponent from "../common/BackPressComponent";
import ViewUtil from "../util/ViewUtil";
import CheckBox from 'react-native-check-box'
import Ionicons from 'react-native-vector-icons/Ionicons'
import ArrayUtil from "../util/ArrayUtil";

import SafeAreaViewPlus from "../common/SafeAreaViewPlus";
type Props = {};

class CustomKeyPage extends Component<Props> {
    constructor(props) {
        super(props);
        this.params = this.props.navigation.state.params;
        this.backPress = new BackPressComponent({ backPress: (e) => this.onBackPress(e) });
        //存储此次选中或者取消选中的所有数据的数组。点击莫个checkbox时,changeValues中存在data-->移除。changeValues中不存在data-->添加。更新state
        //点击返回时,changeValues存在数据,提示是否保存,changeValues的length为0，直接返回
        //点击保存时,changeValues的length为0，直接返回。否则，changeValues中数据keys存在-->移除。changeValues中数据keys不存-->添加。更新state
        this.changeValues = [];
        this.isRemoveKey = !!this.params.isRemoveKey;//是否是标签移除
        this.languageDao = new LanguageDao(this.params.flag);
        this.state = {
            keys: []
        }
    }
    //生命周期:constructor --> getDerivedStateFromProps --> render --> componentDidMount
    //app打开后 "最热"模块会发起action,此页面从reducer获取数据,假如网络较慢有可能当前页面已经打开但是reducer还是没有数据。但只要获取到数据,props就会改变
    //getDerivedStateFromProps就会被调用
    static getDerivedStateFromProps(nextProps, prevState) {
        //老数据和新数据不相等时，将新数据更新到keys
        if (prevState.keys !== CustomKeyPage._keys(nextProps, null, prevState)) {
            return {
                keys: CustomKeyPage._keys(nextProps, null, prevState),
            }
        }
        return null;
    }

    componentDidMount() {
        this.backPress.componentDidMount();
        //如果props中标签为空则从本地存储中获取标签
        //第一次调用componentDidMount,props.language[key]已经存在数据,以为在 "最热"和 "趋势"模块已经订阅过action
        if (CustomKeyPage._keys(this.props).length === 0) {
            let { onLoadLanguage } = this.props;
            onLoadLanguage(this.params.flag);
        }
        this.setState({
            keys: CustomKeyPage._keys(this.props),
        })
    }

    componentWillUnmount() {
        this.backPress.componentWillUnmount();
    }

    /**
     * 获取标签
     * @param props
     * @param original 移除标签时使用，是否从props获取原始对的标签
     * @param state 移除标签时使用
     * @returns {*}
     * @private
     */
    static _keys(props, original, state) {
        //flag:标识是最热模块还是趋势模块；isRemoveKey:标识是否是移除标签
        const { flag, isRemoveKey } = props.navigation.state.params;
        let key = flag === FLAG_LANGUAGE.flag_key ? "keys" : "languages";
        if (isRemoveKey && !original) {
            //是移除标签,  如果state中的keys为空则从props中取。优先返回state.keys
            return state && state.keys && state.keys.length !== 0 && state.keys || props.language[key].map(val => {
                return {//注意：不直接修改props，copy一份
                    ...val,
                    checked: false
                };
            });
        } else {
            //不是移除标签
            return props.language[key];
        }
    }

    onBackPress(e) {
        this.onBack();
        return true;
    }

    onSave() {
        if (this.changeValues.length === 0) {
            NavigationUtil.goBack(this.props.navigation);
            return;
        }
        let keys;//保存移除后的结果
        if (this.isRemoveKey) {//移除标签的特殊处理
            for (let i = 0, l = this.changeValues.length; i < l; i++) {
                //将changeValues数据从CustomKeyPage._keys里移除
                ArrayUtil.remove(keys = CustomKeyPage._keys(this.props, true), this.changeValues[i], "name");
            }
        }
        //更新本地数据(keys不为空(是移除标签)，就传keys。为空就传this.state.keys)
        this.languageDao.save(keys || this.state.keys);
        const { onLoadLanguage } = this.props;
        //更新store,因为 "最热"和 "趋势" 模块都需要更新此数据
        onLoadLanguage(this.params.flag);
        NavigationUtil.goBack(this.props.navigation);
    }

    renderView() {
        let dataArray = this.state.keys;
        if (!dataArray || dataArray.length === 0) return;
        let len = dataArray.length;
        let views = [];
        for (let i = 0, l = len; i < l; i += 2) {
            //因为每次循环都会添加2个元素(一行是2个元素),所以 i += 2。添加第二个元素时需要判断数组是否越界
            views.push(
                <View key={i}>
                    <View style={styles.item}>
                        {this.renderCheckBox(dataArray[i], i)}
                        {i + 1 < len && this.renderCheckBox(dataArray[i + 1], i + 1)}
                    </View>
                    <View style={styles.line} />
                </View>
            )
        }
        return views;
    }

    onClick(data, index) {
        data.checked = !data.checked;
        ArrayUtil.updateArray(this.changeValues, data);
        this.state.keys[index] = data;//更新state以便显示选中状态
        this.setState({
            keys: this.state.keys
        })
    }

    onBack() {
        if (this.changeValues.length > 0) {
            Alert.alert('提示', '要保存修改吗？',
                [
                    {
                        text: '否', onPress: () => {
                            NavigationUtil.goBack(this.props.navigation)
                        }
                    }, {
                        text: '是', onPress: () => {
                            this.onSave();
                        }
                    }
                ])
        } else {
            NavigationUtil.goBack(this.props.navigation)
        }
    }

    _checkedImage(checked) {
        const { theme } = this.params;
        return <Ionicons
            name={checked ? 'ios-checkbox' : 'md-square-outline'}
            size={20}
            style={{
                color: theme.themeColor,
            }} />
    }

    renderCheckBox(data, index) {
        return data ? <CheckBox
            style={{ flex: 1, padding: 10 }}
            onClick={() => this.onClick(data, index)}
            isChecked={data.checked}
            leftText={data.name}
            checkedImage={this._checkedImage(true)}//设置选中状态时图标
            unCheckedImage={this._checkedImage(false)}//设置非选中状态时图标
        /> : null;
    }

    render() {
        const { theme } = this.params;
        let title = this.isRemoveKey ? '标签移除' : '自定义标签';
        title = this.params.flag === FLAG_LANGUAGE.flag_language ? '自定义语言' : title;
        let rightButtonTitle = this.isRemoveKey ? '移除' : '保存';
        let navigationBar = <NavigationBar
            title={title}
            leftButton={ViewUtil.getLeftBackButton(() => this.onBack())}
            style={theme.styles.navBar}
            rightButton={ViewUtil.getRightButton(rightButtonTitle, () => this.onSave())}
        />;
        return <SafeAreaViewPlus
            style={styles.container}
            topColor={theme.themeColor}
        >
            {navigationBar}
            <ScrollView>
                {this.renderView()}
            </ScrollView>
        </SafeAreaViewPlus>
    }
}

const mapPopularStateToProps = state => ({
    language: state.language,
});
const mapPopularDispatchToProps = dispatch => ({
    onLoadLanguage: (flag) => dispatch(actions.onLoadLanguage(flag))
});
//注意：connect只是个function，并不应定非要放在export后面
export default connect(mapPopularStateToProps, mapPopularDispatchToProps)(CustomKeyPage);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    item: {
        flexDirection: 'row',
    },
    line: {
        flex: 1,
        height: 0.3,
        backgroundColor: 'darkgray',
    }
});
