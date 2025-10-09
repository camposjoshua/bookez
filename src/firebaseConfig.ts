import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Initialize Firebase
const ENVIRONMENT = "1.0.0";
const firebaseConfig = {
  apiKey: "AIzaSyBbtC1cN8Y_HChZQU3C8o5gtJwzU8YBGYk",
  authDomain: "silverlining-ec543.firebaseapp.com",
  projectId: "silverlining-ec543",
  storageBucket: "silverlining-ec543.appspot.com",
  messagingSenderId: "664295705802",
  appId: "1:664295705802:web:f9f8c72bb514ecaf887833",
  measurementId: "G-KMEQYY54BH",
};

// staging
// const firebaseConfig = {
//   apiKey: 'AIzaSyBC_kJLQ6PyVJNFbYpA0_g1AtNxjIV0qRw',
//   authDomain: 'sl-staging-805b0.firebaseapp.com',
//   databaseURL:
//     'https://sl-staging-805b0-default-rtdb.asia-southeast1.firebasedatabase.app',
//   projectId: 'sl-staging-805b0',
//   storageBucket: 'sl-staging-805b0.appspot.com',
//   messagingSenderId: '15131791209',
//   appId: '1:15131791209:web:21ccaf2d5405205426b7f8',
//   measurementId: 'G-R502XJZMW4',
// };

// const ENVIRONMENT = 'STAGING';
// const firebaseConfig = {
//   apiKey: "AIzaSyCkoWUBW2rWpNlsrIbwC8jGDtwxicUY6cM",
//   authDomain: "sl-staging-805b0.firebaseapp.com",
//   databaseURL: "https://sl-staging-805b0-default-rtdb.asia-southeast1.firebasedatabase.app",
//   projectId: "sl-staging-805b0",
//   storageBucket: "sl-staging-805b0.firebasestorage.app",
//   messagingSenderId: "15131791209",
//   appId: "1:15131791209:web:26fd8b98be074c9a26b7f8",
//   measurementId: "G-SDLCD6KT60"
// };

//Custom
// const firebaseConfig = {
//   apiKey: "AIzaSyBLLig_SgwVTjyWhGqYIDD6m9VkHDChAa4",
//   authDomain: "silverlining-ec543.firebaseapp.com",
//   projectId: "silverlining-ec543",
//   storageBucket: "silverlining-ec543.appspot.com",
//   messagingSenderId: "664295705802",
//   appId: "1:664295705802:web:e1abba9c7f50ab90887833",
//   measurementId: "G-TN421HNJB3"
// };

//BookEz
// const ENVIRONMENT = 'BookEz';
// const firebaseConfig = {
//   apiKey: 'AIzaSyAMHWcjDdIYloqLZZjeFmD1ukeVhGkUaQ0',
//   authDomain: 'book-ez-2d4c3.firebaseapp.com',
//   projectId: 'book-ez-2d4c3',
//   storageBucket: 'book-ez-2d4c3.firebasestorage.app',
//   messagingSenderId: '508022702287',
//   appId: '1:508022702287:web:11d0f2f04a1e72fea637ba',
//   measurementId: 'G-0PGWJ5X92R',
// };

export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIRESTORE_DB = getFirestore(FIREBASE_APP);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIREBASE_ENV = ENVIRONMENT;
