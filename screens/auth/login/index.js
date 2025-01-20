import React, { useState, useRef, useEffect } from "react";
import { View, Image, Text, Animated, Dimensions, TouchableOpacity, TextInput, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAuth, signInWithEmailAndPassword, sendEmailVerification, onAuthStateChanged } from "firebase/auth";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import styles from "../styles";


export default function AuthScreen() {
    const navigation = useNavigation()

    const [email, onChangeEmail] = useState("")
    const [password, onChangePassword] = useState("")
    
    const auth = getAuth();


    async function login() {
        console.log("logging in", auth)
        try {
            const user = await signInWithEmailAndPassword(auth, email, password)
            console.log("Logged in with UID", user.user.uid)
            //navigating to home page is managed by React Native Navigation Auth Flow
        } catch(error) {
            alert(error.message)
        } 
    }

    return (
        <SafeAreaView style={styles.container}>
        <KeyboardAwareScrollView contentContainerStyle={Platform.OS == "ios" ? (styles.container) : {flexGrow: 1}}>
                <View style={{flex: 1, justifyContent: "center"}}>
                    <View style={{flex: 1, alignItems: "center", justifyContent: "center"}}>
                        <Text style={{color: "white", fontSize: 24, fontWeight: "bold", textAlign: "center"}}>Welcome Back to EduSign</Text>

                        <TextInput 
                            onChangeText={text => onChangeEmail(text.trim())} 
                            placeholder="Email"
                            placeholderTextColor={"white"}
                            autoCapitalize="none"
                            style={styles.submissionBox}
                            keyboardAppearance="dark"
                        />
                    
                        <TextInput 
                            onChangeText={text => onChangePassword(text.trim())} 
                            secureTextEntry={true}
                            placeholder="Password"
                            placeholderTextColor={"white"}
                            style={styles.submissionBox}
                            keyboardAppearance="dark"
                        />

                        <TouchableOpacity style={{marginTop: 10, marginLeft: 45, alignSelf: "flex-start"}} onPress={() => navigation.navigate('Forgot Password')}>
                            <Text style={{color:'white'}}>Forgot your password?</Text>    
                        </TouchableOpacity>
                    </View>
                
                    <View style={{alignItems: "center", flex: 0.2}}>
                        <TouchableOpacity onPress={login} style={[styles.submissionBox, {alignItems: "center", width: 300, height: 70, justifyContent: "center"}]}>
                            <Text style={{color: 'white', fontSize: 24, fontWeight: 'bold'}}>Login</Text>
                        </TouchableOpacity>

                        <View style={{paddingVertical: 10, alignItems: "center", justifyContent: "center", flexDirection: "row"}}>
                            <Text style={{color: "white"}}>Don't have an account?   </Text>
                            <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
                                 <Text style={{color: 'white'}}>Sign Up</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                
        </KeyboardAwareScrollView>
        </SafeAreaView>
    )
    
}