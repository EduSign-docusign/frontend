import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, ActivityIndicator, Pressable, ScrollView, RefreshControl, TouchableOpacity, Alert, Share } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import { getAuth, signOut, sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth';
import axios from 'axios';
import * as Clipboard from 'expo-clipboard';

import { pickImage } from '../../components/imagepicker';
import styles from './styles'


export default function EditProfile() {
      const [user, setUser] = useState(null)
      const [image_url, setImageURL] = useState(null)
      const [refreshing, setRefreshing] = useState(false)
      const navigation = useNavigation()
      const auth = getAuth()


      async function uploadToCDN(image) {

        const serverUrl = `https://backend-375617093037.us-central1.run.app/api/uploadPFP?user_id=${auth.currentUser.uid}`;
    
        const uri = image.uri || image.assets[0].uri
    
        const formData = new FormData();
          formData.append('file', {
            uri: uri,
            type: "image/jpeg",
            name: uri.split('/').pop() || 'newpic.jpg',
        });
    
        const response = await fetch(serverUrl, {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
    
        if (!response.ok) {
          throw new Error(`Failed to upload image. Status: ${response.status}`);
        }
    
        const responseData = await response.json();
        console.log('Upload successful. Server response:', responseData);
        return (responseData)
    }
  
    async function handleImageSelect(image) {
        console.log("Selected Image in CreatePing:", image);

        setRefreshing(true)

        try {
            const res = await uploadToCDN(image)
            console.log(res.pfp_url)
            await onRefresh()
        } catch (error) {   
            console.error('Error uploading image:', error.message);
        } finally {
          setRefreshing(false)
        }
      };  
    

    async function logOut() {
      await signOut(auth)
    }

    const onRefresh = async() => {
        setRefreshing(true);
        await getUser()
        setRefreshing(false)
      };
    
     async function resetPassword() {
            const auth = getAuth()
            try {
                await sendPasswordResetEmail(auth, user.email)
                console.log("Sent Password Reset")
                Alert.alert("Sent password reset link to your email!")
            } catch(error) {
                alert(error.message)
            }
        }
    
    async function getUser() {
        try {
          const user_url = `https://backend-375617093037.us-central1.run.app/api/getUser`
          console.log(user_url)
    
          const token = await getToken()
          const response = await axios.get(user_url, { 
              headers: {
                  Authorization: `Bearer ${token}`, 
                  "Content-Type": "application/json", 
          }});          
          
          setUser(response.data.user);
        } catch (error) {
          console.error('Error fetching documents:', error);
        }      
    }

    useEffect(() => {
      getUser()
    }, []);

    async function shareTempPassword() {
      try {
        const result = await Share.share({
          message:
            `Hey Parent! Login to EduSign with your temporary password: ${user.tempPassword}`,
        });
        // if (result.action === Share.sharedAction) {
        //   if (result.activityType) {
        //     // shared with activity type of result.activityType
        //   } else {
        //     // shared
        //   }
        // } else if (result.action === Share.dismissedAction) {
        //   // dismissed
        // }
      } catch (error) {
        Alert.alert(error.message);
      }    };

    if (!user) {
      return (
        <View style={{flex: 1, backgroundColor: "rgb(22, 23, 24)", justifyContent: "center", alignItems: 'center'}}>
          <ActivityIndicator />
      </View>
      )}

    return (
        <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={"white"} />}>
          <View style={{alignItems: "center", justifyContent: "center", flex: 0.2}}>
            <Pressable onPress={() => pickImage(handleImageSelect, {allowsEditing: true})} style={{width: 100, height: 100, borderRadius: 50, borderWidth: 2, justifyContent: 'center', alignItems: "center", borderStyle: 'dashed', borderColor: "gray"}}>
                      {!user.pfp_url && (
                          <View style={{justifyContent: "center", alignItems: "center"}}>
                            <Ionicons name="camera" size={24} color="gray" />
                            <Text style={{color: "gray"}}>Upload</Text>
                          </View>
                      )}

                      {user.pfp_url && (
                          <View style={{justifyContent: "center", alignItems: "center"}}>
                            <Image style={styles.pfp} source={{uri: user.pfp_url}}/>
                          </View>
                      )}

                      <Ionicons name="add-circle" size={32} color="rgb(47, 139, 128)" style={{position: "absolute", top: 0, right: 0}}/>
                    </Pressable>
          </View>
            
          <View style={{alignContent: "flex-start", flex: 1, marginTop: 20}}>
            <View style={styles.updateField}>
              <Text style={{color: "white", flex: 0.5}}>Name</Text>
              <Text style={{color: "white", flex: 1}}>{user.name}</Text>
            </View>
            
            {user.school && (
                <View style={styles.updateField}>
                 <Text style={{color: "white", flex: 0.5}}>School</Text>
                 <Text style={{color: "white", flex: 1}}>{user.school}</Text>
               </View>
            )}
            
            {user.tempPassword && (
              <View style={styles.updateField}>
                <Text style={{color: "white", flex: 0.5}}>Temp Parent Password</Text>
                <TouchableOpacity onPress={shareTempPassword}>
                  <Text style={{color: "lightgrey", flex: 1}}>{user.tempPassword}</Text>
                </TouchableOpacity>
              </View>
            )}
     
            <TouchableOpacity onPress={resetPassword} style={styles.updateField}>
              <Text style={{color: "red", flex: 0.5}}>Reset Password</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={logOut} style={styles.updateField}>
              <Text style={{color: "red", flex: 0.5}}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
    )
}

