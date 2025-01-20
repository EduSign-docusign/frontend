import { getAuth } from "firebase/auth";
import { getFirestore, doc, collection, getDocs, getDoc, setDoc } from "firebase/firestore"

async function getUserInfo() {
    const auth = getAuth()
    const db = getFirestore()

    const userRef = doc(db, 'users', auth.currentUser.uid);
    const userDoc = await getDoc(studentRef);
    const userData = studentDoc.data()

    return userData
}