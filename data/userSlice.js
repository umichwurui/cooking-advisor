import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import { initializeApp, getApps } from 'firebase/app';
import {setDoc, doc, getFirestore, collection, onSnapshot, getDoc, updateDoc,  arrayUnion, arrayRemove} from 'firebase/firestore';
import { firebaseConfig } from '../Secrets';

import {db, storage} from '../database_init';

// let app;
// const apps = getApps();
// if (apps.length == 0) {
//   app = initializeApp(firebaseConfig);
// } else {
//   app = apps[0];
// }
// const db = getFirestore(app);


export const subscribeToUserUpdates = (dispatch, userKey) => {

  const userDocRef = doc(db, 'User', userKey); 
  let snapshotUnsubscribe = undefined;
  snapshotUnsubscribe = onSnapshot(userDocRef, (docSnap) => {
    if (docSnap.exists()) {
      const updatedUser = docSnap.data();
      dispatch(loadUser([updatedUser])); 
    } else {
      console.warn(`User document with key ${userKey} does not exist.`);
    }
  });

  return snapshotUnsubscribe; 
};



export const loadUser = createAsyncThunk(
  'chat/loadUser',
  async (user) => {
    console.log('now the user is')
    console.log(user);
    return [...user];
  }
)


export const addUser = createAsyncThunk(
  'app/addUser',
  async (user) => {
    const userToAdd = {
      displayName: user.displayName,
      email: user.email,
      key: user.uid,
      own_recipe_list:[],
      starred_recipe_list:[]
    };
    // console.log(userToAdd);
    await setDoc(doc(db, 'User', user.uid), userToAdd);
  }
)

export const setUser = createAsyncThunk(
  'add/setUser',
  async (authUser) => {
    // console.log(authUser);
    const userSnap = await getDoc(doc(db, 'User', authUser.uid));
    // console.log(userSnap);
    const user = userSnap.data();
    console.log(user);
    return user;
  }
)

export const addComment =  createAsyncThunk(
  'add/addComment',
  async({recipeRef, new_comment}) =>{
    console.log('add comment');
    console.log(new_comment);
    console.log(recipeRef);
    try {
      await updateDoc(recipeRef, {
        comments: arrayUnion(new_comment),
      });
      console.log('finish');
      return new_comment;
    } catch (error) {
      console.error('Error while adding comment:', error);
      throw error;
    }

    return new_comment;
  }
)

export const deleteComment =  createAsyncThunk(
  'add/deleteComment',
  async({recipeRef, currentComment}) =>{
    try {
      console.log("now delete comment is");
      console.log(currentComment);
      console.log()
      await updateDoc(recipeRef, {
        comments: arrayRemove(currentComment),
      });
      console.log('finish');
      return currentComment.timestamp;
    } catch (error) {
      console.error('Error while adding comment:', error);
      throw error;
    }

   
  }
)

export const loadRecipe = createAsyncThunk(
  'add/loadRecipe',
  async (recipe_id, { rejectWithValue }) => {
   
    const recipe_ref = doc(db, 'Recipe', recipe_id);
    try {
      const recipe_snap = await getDoc(recipe_ref);
      console.log('finish');
      
      if (recipe_snap.exists()) {
        console.log(recipe_snap.data());
        return recipe_snap.data();
      } else {
        console.warn(`Recipe with ID ${recipe_id} does not exist.`);
        return rejectWithValue(`Recipe with ID ${recipe_id} does not exist.`);
      }
    } catch (error) {
      console.error(`Error fetching recipe with ID ${recipe_id}:`, error);
      return rejectWithValue(error.message);
    }
  }
);

export const nonAuthorEditRecipe = createAsyncThunk(
  'add/editRecipe',
  async () => {
   
    const recipe_ref = doc(db, 'Recipe', recipe_id);
    try {
      const collectionRef = collection(db, 'Recipe');
      const docRef = await addDoc(collectionRef, {});
      
   
      
      if (recipe_snap.exists()) {
        
        return docRef.id;
      }
    } catch (error) {
      console.error(`Error fetching recipe with ID ${recipe_id}:`, error);
      return error.message;
    }
  }
);










export const userSlice = createSlice({
  name: 'users',
  initialState: {
    currentUser: {},
    currentRecipe: {
      steps: [], 
      ingredients:{},
      cover: '',
      comments: [],
    },
  },
  
  reducers: {
    addStep: (state, action)=>{
      
      if (!state.currentRecipe.steps) {
        state.currentRecipe.steps = []; 
      }
      const step = {
        // index: state.currentRecipe.steps.length,
        image: '',
        description: '',
      }
      state.currentRecipe.steps.push(step); 
    },
    setStep:(state, action)=>{
      state.currentRecipe.steps = action.payload;
      // console.log(state.currentRecipe.steps);
    },
    addIngredient:(state, action)=>{
      const newName = `Ingredient_${Object.keys(state.currentRecipe.ingredients).length + 1}`;
      state.currentRecipe.ingredients[newName] = 0;
      console.log(state.currentRecipe.ingredients);
    },
    updateIngredients:(state,action)=>{

      
      state.currentRecipe.ingredients = action.payload;
    },
    deleteIngredient:(state,action)=>{
      const name = action.payload;
      console.log(name);
      const updatedIngredients = { ...state.currentRecipe.ingredients };
      delete updatedIngredients[name];
      state.currentRecipe.ingredients = updatedIngredients;
      console.log(state.currentRecipe.ingredients);
    },
    deleteStep: (state, action) => {
      const index = action.payload; 
      state.currentRecipe.steps = state.currentRecipe.steps.filter((_, i) => i !== index);
    },
    setCover: (state, action) =>{
      state.currentRecipe.cover = action.payload;
    },
    resetRecipe:(state, action) =>{
      state.currentRecipe = {
          steps: [], 
          ingredients:{},
          cover: '',
          comments: [],
        
      }
    },


    
    
  },
  extraReducers: (builder) => {
    builder.addCase(setUser.fulfilled, (state, action) => {
      // console.log(action.payload);
      state.currentUser = action.payload
      // console.log(state.currentUser);
    });
    builder.addCase(loadUser.fulfilled, (state, action) => {
      // console.log('load user:');
      // console.log(action.payload);
      state.currentUser = action.payload[0];
      
    });
    builder.addCase(addComment.fulfilled, (state, action) => {
      console.log(action.payload);
      state.currentRecipe.comments = [...state.currentRecipe.comments, action.payload];
      
    });
    builder.addCase(deleteComment.fulfilled, (state, action) => {
      console.log(action.payload);
      state.currentRecipe.comments = state.currentRecipe.comments.filter(
        (comment) => comment.timestamp !== action.payload
      );;
      
    });

    builder.addCase(loadRecipe.fulfilled, (state, action) => {
      console.log('enter');
      state.currentRecipe = action.payload;
      console.log('now recipe is ', state.currentRecipe);
    });

    builder.addCase(nonAuthorEditRecipe.fulfilled, (state, action) => {
      state.currentRecipe.id = action.payload;
      state.currentRecipe.comments = [];
      state.currentRecipe.num_star = 0;
      state.currentRecipe.author_name = state.currentUser.displayName;
      state.currentRecipe.author_uid = state.currentUser.key;
      state.currentRecipe.num_comment = 0;
      console.log('now recipe_id is ', state.currentRecipe.id);
    });
  }
})
export const { addStep, setStep, updateIngredients, addIngredient, deleteIngredient, deleteStep, setCover, resetRecipe } = userSlice.actions;
export default userSlice.reducer