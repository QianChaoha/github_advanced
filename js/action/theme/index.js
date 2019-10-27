import Types from '../types'
import ThemeDao from "../../expand/dao/ThemeDao";


/**
 * 第一个参数,string类型的type,第二个参数,根据自己需要的数据 
 * 主题变更
 * @param theme
 * @returns {{type: string, theme: *}}
 */
export function onThemeChange(theme) {
    return {type: Types.THEME_CHANGE, theme: theme}
}
/**
 * 初始化主题
 * @returns {Function}
 */
export function onThemeInit() {
    return dispatch => {
        new ThemeDao().getTheme().then((data) => {
            dispatch(onThemeChange(data))
        })
    }
}
/**
 * 显示自定义主题浮层
 * @param show
 * @returns {{type: *, customThemeViewVisible: *}}
 */
export function onShowCustomThemeView(show) {
    return {type: Types.SHOW_THEME_VIEW, customThemeViewVisible: show};
}
