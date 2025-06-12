import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyA68yKSkqNaSAIKO4_Vneq0htMUHVMqVDs",
    authDomain: "niaxtu-8e0dd.firebaseapp.com",
    projectId: "niaxtu-8e0dd",
    storageBucket: "niaxtu-8e0dd.firebasestorage.app",
    messagingSenderId: "765265055722",
    appId: "1:765265055722:web:5ecb5fe1fbb839729cac93"
  };

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Initialiser les services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app; 