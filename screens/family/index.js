import React, { useState, useCallback, useEffect } from "react";
import { View, Image, Text, SafeAreaView, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons'; 
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import axios from 'axios';

import styles from "./styles";
import { getAuth } from "firebase/auth";


export default function FamilyScreen() {
    const [requests, setRequests] = useState([])
    const [children, setChildren] = useState([])
    const [numOfPendingDocuments, setNumOfPendingDocuments] = useState(0)
    const [numOfCompletedDocuments, setNumOfCompletedDocuments] = useState(0)
    const [refreshing, setRefreshing] = useState(false)
    const [user, setUser] = useState()
    const auth = getAuth();
    const navigation = useNavigation()

    const onRefresh = async() => {
        setRefreshing(true);
        await fetchRequests()
        setRefreshing(false);
    };
    
    async function handleApprove(data) {
        try {
            console.log("Accepting...");

            await axios.post(`https://backend-375617093037.us-central1.run.app/api/addChild`, {
                parent_id: auth.currentUser.uid,
                student_id: data.id
            });

            onRefresh()

        } catch (error) {
            console.error("Error approving request:", error);
        }
    }

    async function handleReject(data) {
        try {
            console.log("Rejecting...");

            await axios.post(`https://backend-375617093037.us-central1.run.app/api/removeChild`, {
                parent_id: auth.currentUser.uid,
                student_id: data.id
            });

            onRefresh()

        } catch (error) {
            console.error("Error rejecting request:", error);
        }
    }

    const Request = ({data}) => (
        <View style={styles.userContainer}>
            <Image style={styles.pfp} source={{uri: data.pfp_url}}/>

            <View style={{paddingLeft: 20, height: 50, flex: 1}}>
                <Text>
                    <Text style={[styles.text, {fontWeight: "bold"}]}>{data.name}</Text>
                    <Text style={[styles.text]}> has requested to be your child </Text>
                </Text>
            </View>
            
            <View style={{flex: 0.4, flexDirection: "row", justifyContent: "space-evenly"}}>
                <TouchableOpacity onPress={() => handleApprove(data)}>
                    <Ionicons name={"checkmark-circle"} size={32} color={"rgb(47, 139, 128)"}/>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleReject(data)}>
                    <Ionicons name={"close-circle"} size={32} color={"rgb(208, 116, 127)"}/>
                </TouchableOpacity>
            </View>
        </View>
    );

    const Child = ({data}) => (
        <View style={styles.userContainer}>
            <Image style={styles.pfp} source={{uri: data.pfp_url}}/>
            <View>
                <Text style={[styles.text, { fontWeight: "bold", marginLeft: 20 }]}>{data.name}</Text>
                <Text style={[{ color: "lightgrey", fontStyle: "italic", marginLeft: 20, textTransform: "capitalize" }]}>{data.school || data.type}</Text>
            </View>
        </View>
    );

    async function getUser() {
        try {
            const user_url = `https://backend-375617093037.us-central1.run.app/api/getUser?user_id=${auth.currentUser.uid}`;
            console.log(user_url);

            const response = await axios.get(user_url);
            setUser(response.data.user);
            return response.data.user;
        } catch (error) {
            console.error('Error fetching user:', error);
        }      
    }

    async function getStudentDocuments() {
        try {
            const documents_url = `https://backend-375617093037.us-central1.run.app/api/getDocuments?user_id=${auth.currentUser.uid}`
            console.log(documents_url)
        
            const response = await axios.get(documents_url);
            return response.data.documents
        } catch (error) {
          console.error('Error fetching documents:', error);
        }      
    }

    async function getFamilyMembers() {
        try {
            const members_url = `https://backend-375617093037.us-central1.run.app/api/getFamilyMembers?user_id=${auth.currentUser.uid}`
            console.log(members_url)

            const response = await axios.get(members_url)
            return { members: response.data.members, requests: response.data.requests }
        } catch(error) {
            console.error('Error fetching members', error)
        }
    }

    async function fetchRequests() {
        await getUser();    
        const { members, requests } = await getFamilyMembers()
        //requests should be [] if user is a student (students dont get to see requests)

        const sections = await getStudentDocuments()
        let total = 0;
        let tempNumOfCompletedDocuments = 0;
        sections.forEach((section) => {
            console.log(section.data[0])
            const completedDocuments =  section.data.filter(doc => doc.status === "Completed")
            total += section.data.length;
            tempNumOfCompletedDocuments += completedDocuments.length
          });

        setNumOfCompletedDocuments(tempNumOfCompletedDocuments)
        setNumOfPendingDocuments(total - tempNumOfCompletedDocuments)

        setChildren(members)
        setRequests(requests)
    }

    useEffect(() => {
        fetchRequests();
    }, []);

    if (!children || !user) {
        return (
            <View style={{flex: 1, backgroundColor: "rgb(22, 23, 24)", justifyContent: "center", alignItems: "center"}}>
                <ActivityIndicator />
            </View>
        );
    }
    
    return (
        <SafeAreaView style={styles.container}>

            <View style={{ height: 200, flexDirection: 'row', paddingTop: 25, alignItems: "center" }}>
                <View style={{ flex: 1, alignItems: "center" }}>
                    <Pressable onPress={() => {navigation.navigate("Edit Profile")}}>
                        <Image style={{ width: 100, height: 100, borderRadius: 50 }} source={{uri: user.pfp_url}}/>
                        <View  style={{position: "absolute", bottom: 5, right: 5, backgroundColor: "rgb(47, 139, 128)", borderRadius: 15, width: 25, height: 25, justifyContent: "center", alignItems: "center"}}>
                            <MaterialIcons name="edit" size={20} color="white"/>
                        </View>
                    </Pressable>
                    
                    <Text style={{ color: "white", fontSize: 16, maxWidth: 150, textAlign: "center", marginVertical: 4, fontWeight: "bold" }}>{user.name}</Text>

                    <Text style={{textAlign: "center", color: "lightgray", fontSize: 12, fontStyle: "italic", marginVertical: 5 }}>{user.school}</Text>
                </View>

                <View style={{ flex: 1, paddingRight: 30, justifyContent: "center" }}>
                    <View>
                        <View style={{ flexDirection: "row", justifyContent: "space-around", marginBottom: 10 }}>
                            <Pressable onPress={() => {}}>
                                <Text style={{fontWeight: "bold", textAlign: "center", color: "white"}}>{numOfPendingDocuments}</Text>
                                <Text style={{color: "white", maxWidth: 75, textAlign: "center"}}>Documents Pending</Text>
                            </Pressable>

                            <Pressable onPress={() => {}}>
                                <Text style={{fontWeight: "bold", textAlign: "center", color: "white"}}>{numOfCompletedDocuments}</Text>
                                <Text style={{color: "white", maxWidth: 75, textAlign: "center"}}>Documents Signed</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </View>

            <FlatList 
                data={[...children, ...requests]}
                renderItem={({ item }) => item.pending_parent ? <Request data={item} /> : <Child data={item} />}
                ItemSeparatorComponent={() => <View style={styles.item_seperator}/>}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={"white"} />}
                ListHeaderComponent={() => (
                    <View style={styles.headerContainer}>
                      <Text style={styles.headerText}>Family Members</Text>
                    </View>
                  )}
            />
        </SafeAreaView>
    );
}
