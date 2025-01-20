import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "rgb(22, 23, 24)",
    },

    item_seperator: {
        backgroundColor: 'gray',
        height: 1,
        width: "100%",
      },

    userContainer: {
        marginVertical: 10, 
        width: "100%", 
        flexDirection: "row", 
        paddingHorizontal: 20, 
        flex: 1, 
        alignItems: "center"
    },

    pfp: {
        width: 50, 
        height: 50, 
        borderRadius: 25
    },
    
    text: {
        color: "white"
    },

    button: {
        borderRadius: 20, 
        flex: 1, 
        justifyContent: "center", 
        alignItems: "center", 
        padding: 5
    },

    headerContainer: {
        padding: 16,
        borderBottomWidth: 1,      
        borderBottomColor: "#ddd", 
      },

    headerText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#ddd",
    },
})

export default styles;