import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyChbnMzmFvCqz6N-I6g1l46JRYg62ZJKYQ",
  authDomain: "afs-cs.firebaseapp.com",
  projectId: "afs-cs",
  storageBucket: "afs-cs.firebasestorage.app",
  messagingSenderId: "1087150086741",
  appId: "1:1087150086741:web:0c49aefa7fad3355ded2dc",
  measurementId: "G-NWPVP77G9H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export const uploadImages = async (files) => {
  try {
    const uploadPromises = files.map(async (file) => {
      const storageRef = ref(storage, `workorders/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    });

    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error('Error uploading images:', error);
    throw error;
  }
}; 