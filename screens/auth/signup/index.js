import React, { useState, useRef, useEffect } from "react";
import { View, Text, RefreshControl, TextInput, Platform, TouchableOpacity, Linking } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { getAuth, createUserWithEmailAndPassword, deleteUser } from "firebase/auth"
import { getFirestore, doc, setDoc } from "firebase/firestore"

import styles from "../styles";



export default function SignUpScreen() {
    const [fullName, onChangeFullName] = useState("")
    const [email, onChangeEmail] = useState("")
    const [parentEmail, onChangeParentEmail] = useState("")
    const [password, onChangePassword] = useState("")
    const [confirmPassword, onChangeConfirmPassword] = useState("")
    const [errorMessage, setErrorMessage] = useState()

    const [refreshing, setRefreshing] = useState()
    
    class InputError extends Error {
        constructor(message) {
            super(message)
            this.name = "InputError"
        }
    }

    class PasswordsDontMatch extends InputError {
        constructor(message) {
            super("Passwords do not match.")
            this.name = "PasswordsDontMatch"
        }
    }

    async function signUp() {
        setRefreshing(true)

        setErrorMessage("")
        const auth = getAuth()
    
        function isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }
        
        try {
            if (password != confirmPassword) {
                throw new PasswordsDontMatch()
            }


            if ( password.length < 6) {
                throw new InputError("Password must be atleast 6 characters long")
            }


            if (!isValidEmail(email)) {
                throw new InputError("Enter a valid email.")
            }


            await createUserWithEmailAndPassword(auth, email, password);
            console.log("Created in Firebase")
            
            const db = getFirestore()

            const docRef = doc(db, "users", auth.currentUser.uid);

            await setDoc(docRef, {
                name: fullName,
                email: email,
                parentEmail: parentEmail
            });

            console.log("Created documents succesully")
        } catch (error) {
            console.warn(error)

            if (error instanceof InputError) {
                setErrorMessage(error.message)
            } else {
                alert(error.message)

                if (auth.currentUser) {
                    deleteUser(auth.currentUser)
                }
            }
        } finally {
            setRefreshing(false)
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAwareScrollView refreshControl={<RefreshControl refreshing={refreshing} tintColor={"white"}/>} contentContainerStyle={Platform.OS == "ios" ? {flex: 1, paddingTop: 50} : {flexGrow: 1}} enableOnAndroid={true}>

                <View style={{flex: 1, justifyContent: "space-evenly", alignItems: "center"}}>
                    <Text style={{color: "white", fontSize: 16, textAlign: "center", maxWidth: 250}}>Enter your name as it appears on Canvas</Text>

                    <TextInput 
                        onChangeText={input => onChangeFullName(input.trim())} 
                        placeholder="Full Name"
                        maxLength={25}
                        placeholderTextColor={"white"}
                        style={styles.submissionBox}
                    />

                    <TextInput 
                        onChangeText={input => onChangeEmail(input.trim())} 
                        placeholder="Email"
                        placeholderTextColor={"white"}
                        style={styles.submissionBox}
                    />
                    
                    
                    <TextInput 
                        onChangeText={input => onChangeParentEmail(input.trim())} 
                        placeholder="Parent Email"
                        maxLength={25}
                        placeholderTextColor={"white"}
                        style={styles.submissionBox}
                    />

                    <TextInput 
                        onChangeText={input => onChangePassword(input.trim())} 
                        placeholder="Password"
                        placeholderTextColor={"white"}
                        secureTextEntry={true}
                        textContentType={'oneTimeCode'}
                        style={styles.submissionBox}
                    />

                    <TextInput 
                        onChangeText={input => onChangeConfirmPassword(input.trim())} 
                        placeholder="Confirm Password"
                        placeholderTextColor={"white"}
                        secureTextEntry={true}
                        textContentType={'oneTimeCode'}
                        style={styles.submissionBox}
                    />

                    <Text style={{color: "red", fontSize: 16, textAlign: "center", maxWidth: 300}}>{errorMessage}</Text>
                </View>


                <View style={{ justifyContent: "center", alignItems: "center", flex: 0.4 }}>
                    <TouchableOpacity onPress={signUp} style={styles.submissionBox}>
                        <Text style={[{color: 'white', fontSize: 16, textAlign: "center"}]}>Sign Up</Text>
                    </TouchableOpacity>
                    <Text style={{color: "white", fontSize: 12, textAlign: "center", marginTop: 15, maxWidth: 300}}>
                        By signing up, you agree to our{' '}
                        <Text style={{textDecorationLine: "underline"}} onPress={() => Linking.openURL('https://www.medihacks.org')}>
                            Terms of Conditions
                        </Text>
                        {" & "}
                        <Text style={{textDecorationLine: "underline"}} onPress={() => Linking.openURL('https://www.medihacks.org')}>
                            Privacy Policy
                        </Text>
                        .
                    </Text>                
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    )
}