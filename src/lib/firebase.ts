import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAhEGlvQjcUC7ezJlMT781QWPMQrEB0KWY",
  authDomain: "wisdom-ebooks-club-7225a.firebaseapp.com",
  projectId: "wisdom-ebooks-club-7225a",
  storageBucket: "wisdom-ebooks-club-7225a.firebasestorage.app",
  messagingSenderId: "201540258904",
  appId: "1:201540258904:web:f2ca03443885940b6cce2d",
  measurementId: "G-7TPLE72SZ3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

