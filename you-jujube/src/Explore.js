import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const db = getFirestore(app);
const Explore = () => {
  const [data, setData] = useState(null);

  // Function to add data to Firestore
  const addData = async () => {
    try {
      await addDoc(collection(db, "user"), {
        name: "Test User",
        level: "beginner",
      });
      console.log("Document added!");
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  // Function to get data from Firestore
  const getData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "user"));
      const data = querySnapshot.docs.map((doc) => doc.data());
      setData(data);
    } catch (error) {
      console.error("Error getting documents: ", error);
    }
  };

  useEffect(() => {
    // Test the function once the component is mounted
    addData();
    getData();
  }, []);

  return (
    <div>
      <h2>Explore Page</h2>
      <p>Discover new content and features on YouLearn!</p>
      <div className="data-section">
        <button onClick={addData}>Add Test Data</button>
        <button onClick={getData}>Get Test Data</button>

        <h2>Data from Firestore:</h2>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  );
};

export default Explore;
