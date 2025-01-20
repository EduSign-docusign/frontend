import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "rgb(22, 23, 24)",
        alignItems: "center",
    },

    loginContainer: {
        flex: 0.5, 
        alignItems: "center", 
    },

    text: {
        color: "white", 
        fontSize: 24, 
        margin: 20
    },

    submissionBox: {
        borderRadius: 10, 
        borderColor: "white", 
        borderWidth: 1, 
        marginBottom: 15, 
        color: "white", 
        padding: 10, 
        fontSize: 16
    },

    welcomeBack: {
        padding: 20, 
        alignItems: "center",
        justifyContent: "center"
    },

    signUpButton: {
        paddingVertical: 10, 
        alignItems: "center", 
        justifyContent: "center", 
        flexDirection: "row"
    },

    welcomeBackContainer: {
        flex: 0.5, 
        justifyContent: "flex-end", 
        alignItems: "center"
    }
})

export default styles;