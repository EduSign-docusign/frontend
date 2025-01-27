import React, { useState, useRef, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, RefreshControl, SectionList, Alert, Animated, ActivityIndicator, StatusBar, Modal, TouchableWithoutFeedback, Keyboard, TextInput, Platform } from "react-native";
import axios from 'axios';
import { getAuth } from "firebase/auth";
import * as WebBrowser from 'expo-web-browser';
import { Feather } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

import styles from "./styles"
import { ScrollView } from "react-native-gesture-handler";

import { getToken } from "../../utils";

import { LogBox } from 'react-native';
LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
LogBox.ignoreAllLogs();//Ignore all log notifications

const AnimatedSectionList = Animated.createAnimatedComponent(SectionList);

const PermissionSlipsScreen = () => {
  const [sections, setSections] = useState([]);
  const [filteredSections, setFilteredSections] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [documentSummary, setDocumentSummary] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const auth = getAuth();

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [120, 80],
    extrapolate: 'clamp'
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [1, 0],
    extrapolate: 'clamp'
  });

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  const [expoPushToken, setExpoPushToken] = useState('');
  const [channels, setChannels] = useState([]);
  const [notification, setNotification] = useState(undefined);
  const notificationListener = useRef();
  const responseListener = useRef();

  async function registerForPushNotificationsAsync() {
    console.log("Registering...")
    let token;
  
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('myNotificationChannel', {
        name: 'A channel is needed for the permissions prompt to appear',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      // Learn more about projectId:
      // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
      // EAS projectId is used here.
      try {
        const projectId =
          Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        if (!projectId) {
          throw new Error('Project ID not found');
        }
        token = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;
        console.log("Registered", token);
      } catch (e) {
        token = `${e}`;
      }
    } else {
      alert('Must use physical device for Push Notifications');
    }
  
    return token;
  }

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => token && setExpoPushToken(token));

    if (Platform.OS === 'android') {
      Notifications.getNotificationChannelsAsync().then(value => setChannels(value ?? []));
    }
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(notificationListener.current);
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  async function updateExpoPushToken() {
    try {
      const notification_url = `https://backend-375617093037.us-central1.run.app/api/setExpoPushToken`
      console.log(notification_url)

      const token = await getToken()
      console.log(token)

      const response = await axios.post(notification_url, {expoPushToken: expoPushToken}, {
        headers: {
          Authorization: `Bearer ${token}`, 
          "Content-Type": "application/json", 
        },
      });

    } catch (error) {
      console.error('Error setting Expo token:', error);
    }   
  }

  async function getUser() {
    const user_url = `https://backend-375617093037.us-central1.run.app/api/getUser`;
    const token = await getToken()
    console.log(user_url);
    console.log(token)
    
    let attempts = 0;
    const maxAttempts = 3;
    
    const delay = ms => new Promise(res => setTimeout(res, ms));

    while (attempts < maxAttempts) {
      try {
        await delay(3000)
        console.log("Attempt", attempts + 1, "Retrying...")
        
        const response = await axios.get(user_url, {
          headers: {
            Authorization: `Bearer ${token}`, 
            "Content-Type": "application/json", 
          }
        });
        
        console.log("User Response", JSON.stringify(response.data))
        if (response.data.user) {
          setUser(response.data.user);
          return; // Exit the function if successful
        } else {
          console.warn(`Attempt ${attempts + 1}: No data received, retrying...`);
        }
      } catch (error) {
        console.error(`Attempt ${attempts + 1}: Error fetching documents`, error);
      }
  
      attempts++;
    }
  
    console.error("Max retries reached. Failed to fetch user asd.");
  }
  

  async function getStudentDocuments() {
    try {
      const documents_url = `https://backend-375617093037.us-central1.run.app/api/getDocuments`
      console.log(documents_url)

      const token = await getToken()
      const response = await axios.get(documents_url, {
        headers: {
          Authorization: `Bearer ${token}`, 
          "Content-Type": "application/json", 
        }
      });
      console.log("Documents", response.data)
      setSections(response.data.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }      
  }

  const getDocumentSummary = async (document_id) => {
    try {
      setModalVisible(true);

      const summary_url = `https://backend-375617093037.us-central1.run.app/api/getDocumentSummary?document_id=${document_id}`
      console.log(summary_url)

      const response = await axios.get(summary_url);
      setDocumentSummary(response.data.summary);
    } catch (error) {
      console.error('Error fetching document summary:', error);
    }
  };
  
  const notifyStudentOrParent = async (document) => {
    try {
      const notify_url = `https://backend-375617093037.us-central1.run.app/api/remindStudentOrParent?document_id=${document.id}&student_id=${document.student_id}`
      console.log(notify_url)

      const token = await getToken()
      const response = await axios.post(notify_url, {}, {
        headers: {
          Authorization: `Bearer ${token}`, 
          "Content-Type": "application/json", 
        },
      });

      if (response.data.success) {
        Alert.alert("Notified signers!")
      }

    } catch (error) {
      console.error('Error notifying:', error);
    }
  };

  const onRefresh = async() => {
    setRefreshing(true);
    await getStudentDocuments();
    setRefreshing(false);
  };

  const onSearch = (query) => {
    setSearchQuery(query);

    if (query.trim() === "") {
      setFilteredSections(null);
      return;
    }

    const lowercasedQuery = query.toLowerCase();
    const filtered = sections.map((section) => {
      const filteredData = section.data.filter((doc) =>
        doc.file_name.toLowerCase().includes(lowercasedQuery)
      );
      return filteredData.length > 0 ? { ...section, data: filteredData } : null;
    }).filter(Boolean);

    setFilteredSections(filtered);
  };

  const signDocument = async (document) => {
    try {
      if (user.type == "student" && document.status == "Pending Parent") {
        console.log("Student Has Already Signed! Waiting for parent...")
        Alert.alert("Student Has Already Signed! Waiting for parent...")
        return
      }

      if (user.type == "parent" && document.status == "Pending Student") {
        Alert.alert("Parent can't sign until student has signed")
        return
      }

      const get_signing_url_request = `https://backend-375617093037.us-central1.run.app/api/getSigningURL?type=${user.type}&document_id=${document.id}&student_id=${document.student_id}`
      const response = await axios.get(get_signing_url_request);

      if (response.data?.url) {
        await WebBrowser.openBrowserAsync(response.data.url);
      } else {
        Alert.alert('Error', 'Unable to open signing page');
      }
    } catch (error) {
      console.error('Error fetching signing URL:', error);
    }
  };


  useEffect(() => {
    getUser()
    getStudentDocuments()
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (expoPushToken && user) {
      updateExpoPushToken()
    }
  }, [expoPushToken])

  const renderItem = function({ item, index }) { 
    return (
      <Animated.View
        style={[
          styles.itemContainer,
          {
            opacity: fadeAnim,
            transform: [{
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0]
              })
            }]
          }
        ]}
      >
        <TouchableOpacity
          style={[styles.item, { borderLeftColor: getStatusColor(item.status) }]}
          onPress={() => signDocument(item)}
        >
          <View style={styles.itemContent}>
            { user.type == "parent" && (
              <Text style={styles.itemSubtitle}>
                To: {item.name}
              </Text>
            )}
           
            <Text style={styles.itemTitle}>{item.file_name}</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={styles.itemSubtitle}>
                {item.due_date ? `Due: ${new Date(item.due_date._seconds * 1000).toLocaleDateString()}` : 'No due date'}
              </Text>

              <TouchableOpacity style={{marginLeft: 10}} onPress={() => getDocumentSummary(item.id)}>
                <Feather name="info" size={18} color="#666" />
              </TouchableOpacity>

              <TouchableOpacity style={{marginLeft: 5}} onPress={() => notifyStudentOrParent(item)}>
                <Feather name="bell" size={18} color="#666" />
              </TouchableOpacity>
            </View> 
          </View>
          <View style={styles.itemRightContent}>
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status || 'pending'}</Text>
              <Feather name="chevron-right" size={24} color="#666" />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderSectionHeader = ({ section: { title } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );

  if (!user) {
    return (
      <View style={[styles.container, {justifyContent: "center", alignItems: "center"}]}>
        <ActivityIndicator />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <Animated.Text style={[styles.welcomeText, { opacity: headerOpacity }]}>
          Welcome back,
        </Animated.Text>
        <Text style={styles.nameText}>{user.name}</Text>
      </Animated.View>

      <TextInput
        style={styles.searchBar}
        placeholder="Search documents..."
        placeholderTextColor={"white"}
        value={searchQuery}
        onChangeText={onSearch}
      />

      { sections.length != 0 && (
        <AnimatedSectionList
          sections={filteredSections || sections}
          keyExtractor={(item) => item.id + item.student_id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
          }
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
        />
      )}
      

      { sections.length == 0 && (
        <ScrollView contentContainerStyle={{flex: 1, justifyContent: "center", alignItems: "center"}}   refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}>
            <Ionicons name="document-text" size={64} color="grey" style={{borderWidth: 2, borderRadius: 64, borderColor: "gray", padding: 25}} />
            <Text style={{color: "gray", fontSize: 18, marginTop: 15}}>No Pending Documents</Text>
            <Text style={{color: "gray", fontSize: 18, marginTop: 10}}>You're Good To Go!</Text>
        </ScrollView>
      )}

      {/* Modal for Document Summary */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
         <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Document Summary</Text>
                
                {!documentSummary ? (
                  // Show loading indicator while fetching the summary
                  <ActivityIndicator size="large" color="#2196F3" style={{marginVertical: 20}}/>
                ) : (
                  // Show document summary once loaded
                  <ScrollView>
                    <Text style={styles.modalText}>{documentSummary}</Text>
                  </ScrollView>
                )}

                <TouchableOpacity style={styles.closeModalButton} onPress={() => {setModalVisible(false); setDocumentSummary(null)}}>
                  <Text style={styles.closeModalButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending student':
      return '#4CAF50';
    case 'pending parent':
      return '#FFC107';
    case 'completed':
      return '#2196F3';
  }
};

export default PermissionSlipsScreen;
