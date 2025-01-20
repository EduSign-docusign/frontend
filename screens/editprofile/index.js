import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, ActivityIndicator, Pressable, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import { getAuth, signOut } from 'firebase/auth';
import axios from 'axios';

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
    
    async function getUser() {
        try {
          const user_url = `https://backend-375617093037.us-central1.run.app/api/getUser?user_id=${auth.currentUser.uid}`
          console.log(user_url)
    
          const response = await axios.get(user_url);
          setUser(response.data.user);
        } catch (error) {
          console.error('Error fetching documents:', error);
        }      
    }

    useEffect(() => {
      getUser()
    }, []);

    
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

            <TouchableOpacity onPress={logOut} style={styles.updateField}>
              <Text style={{color: "red", flex: 0.5}}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
    )
}

