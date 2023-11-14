
import { initializeApp, getApps } from 'firebase/app';
import { setDoc, getDoc, doc, getFirestore } from 'firebase/firestore';

import { firebaseConfig } from '../Secrets';
import { SET_USER } from './Reducer';

let app;
const apps = getApps();
if (apps.length == 0) { 
  app = initializeApp(firebaseConfig);
} else {
  app = apps[0];
}
const db = getFirestore(app);

const addUser = (authUser) => {
  return async (dispatch) => {
    userToAdd = {
      displayName: authUser.displayName,
      email: authUser.email,
      key: authUser.uid
    };
    await setDoc(doc(db, 'users', authUser.uid), userToAdd);
  }
}
const setUser = (authUser) => {
  return async (dispatch) => {
    const userSnap = await getDoc(doc(db, 'users', authUser.uid));
    const user = userSnap.data();
    console.log('dispatching with user', authUser, user);
    dispatch({
      type: SET_USER,
      payload: {
        user: user
      }
    });
  }
}

export { addUser, setUser };