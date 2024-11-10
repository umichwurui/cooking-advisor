import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import userSlice from "./data/userSlice";
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import CameraScreen from './screens/CameraScreen';

const store = configureStore({
  reducer: {userSlice}
});

function App() {
  const Stack = createNativeStackNavigator();



  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName='Login' screenOptions={{ headerShown: false }}>
          <Stack.Screen name='Login' component={LoginScreen}/>
          <Stack.Screen name='Home' component={HomeScreen}/>
          <Stack.Screen name='Camera' component={CameraScreen}/>
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}

export default App;