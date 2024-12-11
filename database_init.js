import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import { initializeApp, getApps } from 'firebase/app';
import {setDoc, doc, getFirestore, collection, onSnapshot, getDoc} from 'firebase/firestore';
import { firebaseConfig } from './Secrets';
import { getStorage } from 'firebase/storage';



let app;
const apps = getApps();
if (apps.length == 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = apps[0];
}
export const db = getFirestore(app);
export const storage = getStorage(app);
