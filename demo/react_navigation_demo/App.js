import {AppStackNavigator,MaterialTopTabNavigator,BottomTabNavigator} from './navigators/AppNavigators'
import SwitchNavigator from './navigators/SwitchNavigator'
import {createAppContainer} from 'react-navigation'
export default createAppContainer(AppStackNavigator);