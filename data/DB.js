
import { getAuth, signOut } from 'firebase/auth';
import { getApps, initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  onSnapshot, 
  collection,
  doc,
  setDoc, 
  getDocs 
} from 'firebase/firestore';
import { firebaseConfig } from '../Secrets';
import { actionTypes, loadUsers } from './Actions';

let firebaseApp = null;
const userCollection = 'users';


const getFBApp = () => {
  if (!firebaseApp) {
    if (getApps() == 0) {
      firebaseApp = initializeApp(firebaseConfig);
    } else {
      firebaseApp = getApps()[0];
    }
  }
  return firebaseApp;
}

const getFBAuth = () => {
  return getAuth(getFBApp());
}

const getDB = () => {
  return getFirestore(getFBApp());
}

const signOutFB = () => {
  signOut(getAuth());
}

const loadUsersAndDispatch = async (action, dispatch) => {
  // load users from Firebase
  let db = getDB();
  let auth = getAuth();
  let currentUser = auth.currentUser;
  let newUsers = [];

  // if user is logged in, load 'em up
  if (currentUser) {
    const qSnap = await getDocs(collection(db, userCollection));
    newUsers = processUserQuerySnapshot(qSnap);
  }  
  action.payload = {
    users: newUsers
  }
  dispatch(action);
}

const processUserQuerySnapshot = (uqSnap) => {
  let newUsers = [];
  uqSnap.forEach(docSnap => {
    let newUser = docSnap.data();
    newUser.uid = docSnap.id;
    newUsers.push(newUser);
  });
  return newUsers;
}

const subscribeToUsers = (dispatch) => {
  onSnapshot(collection(getDB(), userCollection), qSnap => {
    let newUsers = processUserQuerySnapshot(qSnap);
    console.log('\n\nusers coll updated:\n\n', newUsers);
    dispatch(loadUsers(newUsers));
  });
}

const createUser = (action, dispatch) => {
  const { user } = action.payload;
  setDoc(doc(collection(getDB(), userCollection), user.uid), {
    displayName: user.displayName
  });
  // no need to dispatch to reducer
}

const saveAndDispatch = (action, dispatch) => {
  switch (action.type) {
    case actionTypes.LOAD_USERS:
      loadUsersAndDispatch(action, dispatch);
    case actionTypes.CREATE_USER:
      createUser(action, dispatch);
  }
}

export { 
  saveAndDispatch, 
  subscribeToUsers, 
  getFBAuth,
  signOutFB 
};