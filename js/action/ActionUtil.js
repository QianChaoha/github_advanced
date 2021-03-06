/**
 * 处理下拉刷新的数据
 * @param actionType
 * @param dispatch
 * @param storeName
 * @param data
 * @param pageSize
 * @param favoriteDao
 */
import ProjectModel from "../model/ProjectModel";
import Utils from "../util/Utils";
/**
 * 处理数据(目前只在下拉刷新时调用此方法,因为后台没有做分页,fixItems拿到的是全部数据,这里也只是模拟下拉刷新,加载pageSize条数据)
 * @param actionType
 * @param dispatch
 * @param storeName
 * @param data
 * @param pageSize
 * @param favoriteDao
 * @param params 其他参数
 */
export function handleData(actionType, dispatch, storeName, data, pageSize, favoriteDao,params) {
    let fixItems = [];
    if (data && data.data) {
        //最热和趋势模块数据结构不一样,最热模块数据没有items
        if (Array.isArray(data.data)) {
            fixItems = data.data;
        } else if (Array.isArray(data.data.items)) {
            fixItems = data.data.items;
        }
    }
    //第一次要加载的数据
    let showItems = pageSize > fixItems.length ? fixItems : fixItems.slice(0, pageSize);
    _projectModels(showItems,favoriteDao,projectModels=>{
        dispatch({
            type: actionType,
            items: fixItems,
            projectModels:projectModels,
            storeName,//es6写法,相当于storeName:storeName
            pageIndex: 1,
            ...params
        })
    });
}

/**
 * 通过本地的收藏状态包装Item,将showItems里数据加上一个 "收藏状态"字段(检测showItems每条数据的id或者fullName是否在keys里面,"趋势"模块用fullName,"最热"模块用id)
 * @param showItems
 * @param favoriteDao
 * @param callback
 * @returns {Promise<void>}
 * @private
 */
export async function _projectModels(showItems, favoriteDao, callback) {
    let keys = [];
    try {
        异步转同步
        //获取收藏的key
        keys = await favoriteDao.getFavoriteKeys();
    } catch (e) {
        console.log(e);
    }
    let projectModels = [];
    for (let i = 0, len = showItems.length; i < len; i++) {
        projectModels.push(new ProjectModel(showItems[i], Utils.checkFavorite(showItems[i], keys)));
    }
    doCallBack(callback,projectModels);

    // favoriteDao.getFavoriteKeys().then((keys)=>{
    //     let projectModels = [];
    //     for (let i = 0, len = showItems.length; i < len; i++) {
    //         projectModels.push(new ProjectModel(showItems[i], Utils.checkFavorite(showItems[i], keys)));
    //     }
    //     doCallBack(callback, projectModels);
    // });
}
export const doCallBack = (callBack, object) => {
    if (typeof callBack === 'function') {
        callBack(object);
    }
};
