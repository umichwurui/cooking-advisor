import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import { initializeApp, getApps } from 'firebase/app';
import {setDoc, doc, getFirestore, collection, onSnapshot, getDoc} from 'firebase/firestore';
import { firebaseConfig } from '../Secrets';



let app;
const apps = getApps();
if (apps.length == 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = apps[0];
}
const db = getFirestore(app);


export const subscribeToUserUpdates = (dispatch) => {
  let snapshotUnsubscribe = undefined;
  if (snapshotUnsubscribe) {
    snapshotUnsubscribe();
  }

  snapshotUnsubscribe = onSnapshot(collection(db, 'users'), usersSnapshot => {
    const updatedUsers = usersSnapshot.docs.map(uSnap => {
      return uSnap.data();
    });
    dispatch(loadUsers(updatedUsers));
  });
}
//
//
export const loadUsers = createAsyncThunk(
  'chat/loadUsers',
  async (users) => {
    return [...users];
  }
)


export const addUser = createAsyncThunk(
  'app/addUser',
  async (user) => {
    const userToAdd = {
      displayName: user.displayName,
      email: user.email,
      key: user.uid
    };
    await setDoc(doc(db, 'users', user.uid), userToAdd);
  }
)

export const setUser = createAsyncThunk(
  'add/setUser',
  async (authUser) => {
    const userSnap = await getDoc(doc(db, 'users', authUser.uid));
    const user = userSnap.data();
    return user;
  }
)


export const userSlice = createSlice({
  name: 'users',
  initialState: {
    currentUser: {},
  },
  // reducers is a mandatory argument even if all of our reducers
  // are in extraReducers
  reducers: [],
  extraReducers: (builder) => {
    builder.addCase(setUser.fulfilled, (state, action) => {
      state.currentUser = action.payload
    });
  }
})

export default userSlice.reducer