import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Preload from '../app/Preload';
import SignIn from '../app/SignIn';
import SignUp from '../app/SingUp';
import MainTab from '../stacks/MainTab';
import ListaDeClient from '../app/ListaDeClient';

const Stack = createNativeStackNavigator();

export default function MainStack() {
  return (
    <Stack.Navigator
      initialRouteName="Preload"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Preload" component={Preload} />
      <Stack.Screen name="SignIn" component={SignIn} />
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="MainTab" component={MainTab} />
      <Stack.Screen name="ListaDeClient" component={ListaDeClient} />
    </Stack.Navigator>
  );
}
