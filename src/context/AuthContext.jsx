import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore'; // Import onSnapshot
import { auth, db } from '../../firebase/firebase';
import { toast } from 'sonner';
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null); // <-- Firestore data
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setAuthLoading(false);

      let unsubscribeFirestore = () => {}; // Initialize a no-op function for Firestore unsubscribe

      // Fetch user data from Firestore if signed in
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        // Use onSnapshot for real-time updates to currentUserData
        unsubscribeFirestore = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            setCurrentUserData(docSnap.data());
            console.log("User Firestore data (real-time):", docSnap.data());
          } else {
            console.log("No such document in Firestore!");
            setCurrentUserData(null);
          }
        }, (error) => {
          console.error("Error listening to user document:", error);
          toast.error("Failed to load user data."); // Use toast for error messages
        });
      } else {
        setCurrentUserData(null); // reset if signed out
      }

      // Cleanup function for both auth and firestore listeners
      return () => {
        unsubscribeAuth();
        unsubscribeFirestore(); // Unsubscribe from Firestore listener
      };
    });

    // The return of onAuthStateChanged is the unsubscribe function for auth state changes.
    // The inner return handles the firestore listener.
    return () => unsubscribeAuth(); // This ensures the outer auth listener is cleaned up
  }, []); // Empty dependency array means this runs once on mount and cleans up on unmount

  const logout = async () => {
    try {
      await signOut(auth);
      console.log("User signed out");
    } catch (error) {
      console.error("Logout error:", error);
      // You might want to add a toast.error here as well
    }
  };

  const getAccessToken = async () => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      console.log("Access Token:", token);
      return token;
    } else {
      console.log("No user is signed in");
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, currentUserData, authLoading, logout, getAccessToken }}>
      {!authLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
