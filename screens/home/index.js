import React, { useState, useRef, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, RefreshControl, SectionList, Alert, Animated, ActivityIndicator, StatusBar, Modal, TouchableWithoutFeedback, Keyboard, TextInput } from "react-native";
import axios from 'axios';
import { getAuth } from "firebase/auth";
import * as WebBrowser from 'expo-web-browser';
import { Feather } from '@expo/vector-icons';

import styles from "./styles"
import { ScrollView } from "react-native-gesture-handler";

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

  async function getStudentDocuments() {
    try {
      const documents_url = `https://backend-375617093037.us-central1.run.app/api/getDocuments?user_id=${auth.currentUser.uid}`
      console.log(documents_url)

      const response = await axios.get(documents_url);
      console.log("Response", response.data)
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

      // if (document.status == "Completed") {
      //   Alert.alert("Already Complete")
      //   return
      // }

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
                <Feather name="info" size={24} color="#666" />
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
        <Text style={styles.nameText}>{user.name} ({user.type})</Text>
      </Animated.View>

      <TextInput
        style={styles.searchBar}
        placeholder="Search documents..."
        placeholderTextColor={"white"}
        value={searchQuery}
        onChangeText={onSearch}
      />

      <AnimatedSectionList
        sections={filteredSections || sections}
        keyExtractor={(item) => item.id}
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
  console.log(status)

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
