import React, { useState, useRef, useEffect } from "react";
import { StatusBar, StyleSheet, View, TouchableOpacity, Platform, Text, Dimensions, Animated, Easing, ActivityIndicator } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

import { NavigationContainer, useFocusEffect, useLinkTo, useNavigation, useRoute } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

import SignUpScreen from "./screens/auth/signup";
import AuthScreen from "./screens/auth/login"; 
import PermissionSlipsScreen from "./screens/home";
import FamilyScreen from "./screens/family";
import EditProfile from "./screens/editprofile";

const firebaseConfig = {
  apiKey: "AIzaSyB6XFbwflmcP_t0mAfwPfvptKrUZtk_PoY",
  authDomain: "edusign-d5abd.firebaseapp.com",
  projectId: "edusign-d5abd",
  storageBucket: "edusign-d5abd.firebasestorage.app",
  messagingSenderId: "354531395624",
  appId: "1:354531395624:web:658902ee97c604c3778d1d",
  measurementId: "G-41ZMRMX7EB"
};

if (getApps().length) {
    getApp();
} else {
    const app = initializeApp(firebaseConfig)
    const auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
}


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();


const Tabs = ({ route }) => {
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: { backgroundColor: 'rgb(22, 23, 24)' },
          headerShown: false,
          tabBarShowLabel: false,
          headerStyle: { backgroundColor: 'rgb(22, 23, 24)' },
          headerTitleStyle: { color: 'white' },
          headerTitleAlign: "center"
        }}
      >
          <Tab.Screen name="Screen1" component={PermissionSlipsScreen} options={{
            tabBarIcon: ({ focused, size }) => (
              <Ionicons name={focused ? 'home' : 'home-outline'} color={'white'} size={size} />
            )
          }} />

          <Tab.Screen name="Family" component={FamilyScreen} options={{
            tabBarIcon: ({ focused, size }) => (
              <MaterialCommunityIcons name={focused ? 'account-group' : 'account-group-outline'} color={'white'} size={size + 2} />
            )
          }} />
      </Tab.Navigator>
    </View>
  );
};




function App() {
    const [loggedIn, setLoggedIn] = useState(false)


    useEffect(() => {
      const auth = getAuth()

      const unsubscribe = onAuthStateChanged(auth, user => {
          console.log("User State Changed. UID:", user?.uid)
  
          if (user) {
            setLoggedIn(true)
          } else {
            setLoggedIn(false)
          }

      })

      return () => unsubscribe()

    }, []);


    return (
      <GestureHandlerRootView style={{backgroundColor: "rgb(22, 23, 24)", flex: 1}}>
      <ActionSheetProvider>
      <SafeAreaProvider>
      <NavigationContainer>
          <StatusBar barStyle="light-content" backgroundColor="rgb(22, 23, 24)" />

          <Stack.Navigator screenOptions={({ navigation }) => ({   
                headerLeft: () => (
                  <TouchableOpacity onPress={() => {
                    if (navigation.canGoBack()) {
                      navigation.goBack()
                    } else {
                      navigation.navigate("Home")
                    }
                  }}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                  </TouchableOpacity>
                ),  
                gestureEnabled: true, headerShown: false, headerBackTitleVisible: false, headerTitleStyle: {color: "white"}, 
                headerTintColor: 'white', headerStyle: {backgroundColor: "rgb(22, 23, 24)"}, headerTitleAlign: "center"
              })}>


              {loggedIn ? (
                <>
                  <Stack.Screen name="Home" options={{ gestureEnabled: false }} component={Tabs}/>
                  <Stack.Screen name="Edit Profile" options={{ headerShown: true }} component={EditProfile}/>
                </>
              ) : (
                <>
                <Stack.Screen name="Auth" component={AuthScreen} />
                <Stack.Screen name="SignUp" component={SignUpScreen} />
                </>
            )}
            
            
          </Stack.Navigator>
      </NavigationContainer>
      </SafeAreaProvider>
      </ActionSheetProvider>
      </GestureHandlerRootView>
    );
}

export default App;
