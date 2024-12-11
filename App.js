import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import userSlice from "./data/userSlice";
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';

import CreateScreen from './screens/CreateScreen';
import UserScreen from './screens/UserScreen';
import CollectionScreen from './screens/CollectionScreen';
import RecipeScreen from './screens/RecipeScreen';
import { EditScreen } from './screens/EditScreen';
import InputScreen from './screens/InputScreen';
import {subscribeToUserUpdates} from "./data/userSlice";
import ResultScreen from './screens/ResultScreen';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as Font from "expo-font";



const fetchFonts = async () => {
  await Font.loadAsync({
    "Nunito-Regular": require("./assets/fonts/Nunito-Italic-VariableFont_wght.ttf"),
    "Nunito" : require("./assets/fonts/Nunito.ttf"),
    "Nunito-Bold": require("./assets/fonts/Nunito-Italic-VariableFont_wght copy.ttf"),
  });
};
const store = configureStore({
  reducer: {userSlice}
});

  function AppContent() {
    const Stack = createNativeStackNavigator();
    const currentUser = useSelector((state) => state.userSlice.currentUser);
    const dispatch = useDispatch();
  
    useEffect(() => {
      if (currentUser?.key) {
        const unsubscribe = subscribeToUserUpdates(dispatch, currentUser.key);
        return () => {
          if (unsubscribe) {
            unsubscribe();
          }
        };
      }
    }, [currentUser?.key, dispatch]);
  
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false, unmountOnBlur: true }} >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
         
          <Stack.Screen name="Create" component={CreateScreen} />
          <Stack.Screen name="User" component={UserScreen} />
          <Stack.Screen name="Collection" component={CollectionScreen} />
          <Stack.Screen name="Recipe" component={RecipeScreen} />
          <Stack.Screen name="Edit" component={EditScreen} />
          <Stack.Screen name="Input" component={InputScreen} />
          <Stack.Screen name="Result" component={ResultScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
  
  function App() {
    useEffect(()=>{
      const initialize = async () => {
        await fetchFonts(); 
        
       
      };
      initialize();
    })
    return (
      <Provider store={store}>
        <AppContent />
      </Provider>
    );
  }
  
  export default App;
  