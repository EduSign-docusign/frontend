import { getAuth } from "firebase/auth";

export async function getToken() {
    const auth = getAuth()
  
    if (auth.currentUser) {
      const token = await auth.currentUser.getIdToken()
      return token;
    } else {
      throw new NotLoggedInError("User is not logged in")
    }  
  }
  
