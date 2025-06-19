import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useAuth } from "../context/AuthContext";

const CheckProfile = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const check = async () => {
      const docRef = doc(db, "users", currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        navigate("/whatsapp"); 
      } else {
        navigate("/user"); 
      }
    };
    if (currentUser) check();
  }, [currentUser]);

  return null;
};

export default CheckProfile;
