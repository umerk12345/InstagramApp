

import {Navigation} from 'react-native-navigation';
import {Provider} from 'react-redux';

import AuthScreen from './src/screens/Auth/Auth';
import SharePlaceScreen from './src/screens/SharePlace/SharePlace';
import FindPlaceScreen from './src/screens/FindPlace/FindPlace';
import PlaceDetailScreen from './src/screens/PlaceDetail/PlaceDetail';
import SideDrawer from './src/screens/SideDrawer/SideDrawer';

import configureStore from './src/store/configureStore';


const store = configureStore();

//Register Screens

Navigation.registerComponent("instagramapp.AuthScreen", () => AuthScreen, store, Provider);
Navigation.registerComponent("instagramapp.SharePlaceScreen", () => SharePlaceScreen, store, Provider);
Navigation.registerComponent("instagramapp.FindPlaceScreen", () => FindPlaceScreen, store, Provider);
Navigation.registerComponent("instagramapp.PlaceDetailScreen", () => PlaceDetailScreen, store, Provider);
Navigation.registerComponent("instagramapp.SideDrawer", () => SideDrawer, store, Provider);

//Start App
Navigation.startSingleScreenApp({
  screen: {
    screen: "instagramapp.AuthScreen",
    title: "Login"
  }

});
