import React, { useState, useRef, useEffect } from "react";
import { View, Image, Text, Pressable, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAuth, sendPasswordResetEmail, onAuthStateChanged } from "firebase/auth";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import styles from "../styles";

export default function ResetPassword() {
    const [email, onChangeEmail] = useState()
    
    
    async function verification() {
        const auth = getAuth()
        try {
            await sendPasswordResetEmail(auth, email)
            console.log("Sent Email Verification")
        } catch(error) {
            alert(error.message)
        }
    }

    
    return (
        <SafeAreaView style={styles.container}>
        <KeyboardAwareScrollView contentContainerStyle={Platform.OS == "ios" ? (styles.container) : {}} enableOnAndroid={true}>
                <View style={{alignItems: "center", flex: 1}}>
                    <Image style={{ height: 200, width: 200, resizeMode: "contain"}} source={require('../../../assets/torus.png')}></Image>

                    <Text style={{marginVertical: 10, color: "white", fontSize: 20}}>Forgot your Password?</Text>
                    <Text style={{ textAlign:'center', fontSize: 16, color: "white", paddingHorizontal: 50}}>Please enter your email address. If you have an account, you will receive a link to reset your password.</Text>

                    <TextInput 
                        onChangeText={onChangeEmail} 
                        placeholder="Email"
                        placeholderTextColor={"white"}
                        style={[styles.submissionBox]}
                    />
                </View>
                <View style={{justifyContent: "center", alignItems: "center", flex: 0.5}}>
                    <Pressable onPress={verification} style={[styles.submissionBox, {padding: 20}]}>
                        {({pressed}) => 
                            <Text style={{color: pressed ? 'gray' : 'white', fontSize: 16, textAlign: "center"}}>Send Verification</Text>
                        }
                    </Pressable>
                </View>
        </KeyboardAwareScrollView>
        </SafeAreaView>
    )
}