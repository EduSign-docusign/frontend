import { StyleSheet, Platform } from "react-native";

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#161718',
      paddingTop: 15,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: Platform.OS === 'ios' ? 60 : 40,
      backgroundColor: '#161718',
      justifyContent: 'flex-end',
      paddingBottom: 20,
    },
    welcomeText: {
      fontSize: 16,
      color: '#999',
      marginBottom: 4,
    },
    nameText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#fff',
    },
    listContent: {
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    sectionHeader: {
      paddingVertical: 12,
      backgroundColor: '#161718',
    },
    sectionHeaderText: {
      fontSize: 18,
      fontWeight: '600',
      color: '#fff',
      opacity: 0.9,
    },
    itemContainer: {
      marginBottom: 12,
    },
    item: {
      backgroundColor: '#222324',
      borderRadius: 12,
      borderLeftWidth: 4,
      flexDirection: 'row',
      alignItems: 'center',
      overflow: 'hidden',
    },
    itemContent: {
      flex: 1,
      padding: 16,
    },
    itemRightContent: {
      flexDirection: "row",
      alignItems: 'center',
      paddingRight: 16,
      gap: 8,
    },
    itemTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: '#fff',
      marginBottom: 4,
    },
    itemSubtitle: {
      fontSize: 16,
      color: '#999',
    },
    statusText: {
      fontSize: 12,
      fontWeight: '500',
      textTransform: 'capitalize',
      maxWidth: 75,
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      width: '80%',
      backgroundColor: 'white',
      padding: 20,
      borderRadius: 10,
      alignItems: 'center',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    modalText: {
      fontSize: 16,
      marginBottom: 20,
    },
    closeModalButton: {
      backgroundColor: '#2196F3',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
    },
    closeModalButtonText: {
      color: 'white',
      fontWeight: 'bold',
    }, 
    searchBar: {
      backgroundColor: "rgb(63, 63, 63)", // Light gray background
      borderRadius: 8,           // Rounded corners
      paddingVertical: 8,        // Vertical padding
      paddingHorizontal: 16,     // Horizontal padding
      marginHorizontal: 16,      // Margin on the left and right
      marginVertical: 10,        // Margin on the top and bottom
      fontSize: 16,              // Text size
      color: "white",             // Text color
      elevation: 2,              // Shadow for Android
      shadowColor: "#000",       // Shadow color for iOS
      shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
      shadowOpacity: 0.2,        // Shadow opacity for iOS
      shadowRadius: 4,           // Shadow radius for iOS
    },
  });
  
export default styles;