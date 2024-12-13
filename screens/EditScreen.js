import { Button } from '@rneui/themed';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput,ScrollView, Animated } from 'react-native';
import { useSelector } from 'react-redux';
import { signOut } from '../AuthManager';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Food_ingredients from '../components/food_ingredients';
import Step from '../components/step';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"; 
import { getDatabase, ref as dbRef, set } from "firebase/database"; 

import {useDispatch} from 'react-redux';
import { addStep, addIngredient, setCover, nonAuthorEditRecipe, setStep } from '../data/userSlice';
import { collection, addDoc, doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import {db, storage} from '../database_init';
import { Divider } from '@rneui/themed';










export function EditScreen({navigation, route}) {
  
    const dispatch = useDispatch();

    const {is_author, recipe_author} = route.params;
    if(!is_author){
      dispatch(nonAuthorEditRecipe());
    }
    const recipe = useSelector(state => state.userSlice.currentRecipe);
    
    const currentUser = useSelector(state => state.userSlice.currentUser);
    const ingredients = useSelector(state=>state.userSlice.currentRecipe.ingredients);
    const [name, setName] = useState(recipe.name);
    const [foodIngredients, setFoodIngredients] = useState([]);
    const [cover, setCover] = useState(recipe.cover);
    const steps = useSelector(state => state.userSlice.currentRecipe.steps);
    const [visible, setVisible] = useState(false); 
    


    const handleUpdateIngredient = (id, field, value) => {
        setFoodIngredients((prev) =>
        prev.map((item) =>
            item.id === id ? { ...item, [field]: value } : item
        )
        );
        
    };

    const handleUpdateStep = (step)=>{
        setSteps([...steps, step]);
    }

    const handleAddImage = async () => {
   
      const options = {
          mediaType: 'photo', 
          selectionLimit: 1, 
          quality: 1, 
          includeBase64: false, 
        };
      const result = await ImagePicker.launchImageLibraryAsync(options);
      
      if (!result.canceled) {
        
        setCover(result.assets[0].uri); 
       
      }
    };

  

    
    
      
    const uploadImageToFirebase = async (imageUri, recipe_id, is_cover, step_index) => {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const storage = getStorage();
        let storageRef = undefined;
        if(!is_cover){
          storageRef = ref(storage, `${recipe_id}_${currentUser.displayName}_${step_index}.jpg`);
        }else{
          storageRef = ref(storage, `${recipe_id}_${currentUser.displayName}_cover.jpg`);
        }
       
        await uploadBytes(storageRef, blob);

        
        const downloadUrl = await getDownloadURL(storageRef);
        return downloadUrl;
    };
    
    const saveRecipe = async () => {
      
     
        if(is_author){
          
          console.log('hi');
          
          const recipe_ref = doc(db, 'Recipe', recipe.id);
          const docSnap = await getDoc(recipe_ref);
          const prev_recipe = docSnap.data();
          console.log(prev_recipe);
          
        
          
          
         
            
            
            const updatedSteps = await Promise.all(
              steps.map(async (step, index) => {
                  // console.log(step.image);
                  // console.log(prev_recipe.steps[index].image);
                  if (step.image.startsWith('file://')) {
                    const prevImageUri = prev_recipe.steps[index]?.imageUri || '';
                    
                    if (prevImageUri && step.image !== prev_recipe.steps[index]?.image) {
                      try {
                        const fileRef = ref(storage, prevImageUri);
                        await deleteObject(fileRef);
                        console.log(`Deleted image: ${prevImageUri}`);
                      } catch (error) {
                        console.error('Error deleting image:', error);
                      }
                    }
                    console.log('finish delete');
              
                   
                    const downloadUrl = await uploadImageToFirebase(step.image, recipe.id, false, index);
                    return { ...step, imageUri: downloadUrl };
                  }
                  return step; 
              })
          );
          console.log(updatedSteps);
          dispatch(setStep(updatedSteps));
          const updatedRecipe = { ...recipe, steps: updatedSteps, name: name, keywords: name.split(' ') };
          console.log('the updated recipe is' , updatedRecipe);
          
          
        
          await setDoc(recipe_ref, updatedRecipe);
          navigation.pop();

        }
        else{
            const recipeColl = collection(db, 'Recipe');
            const recipeRef = await addDoc(recipeColl, {}); 
            const recipeId = recipeRef.id; 
            console.log();
            const updatedSteps = await Promise.all(
              steps.map(async (step, index) => {
                console.log('the saved step is',step);
                  if (step.image.startsWith('file://')) {
                  
                      const downloadUrl = await uploadImageToFirebase(step.image, recipeId, false, index);
                    
                      return { ...step, imageUri: downloadUrl };
                  }
                  return step; 
              })
          );
          console.log('begin upload cover ',cover);
          
          const cover_url = await uploadImageToFirebase(cover,recipeId, true, 0);
          console.log(cover_url);
          const recipe = {
            id: recipeId, 
            name: name,
            keywords: name.split(' '),
            author_name: currentUser.displayName,
            author_uid: currentUser.key,
            folk_author_name: recipe_author,
            cover: cover_url,
            steps: updatedSteps,
            ingredients: ingredients,
            comments:[],
            num_star:0,
            num_comment:0,
          };
          console.log(recipe);

         

          try {
            await setDoc(recipeRef, recipe);
            console.log('Recipe saved successfully');
          } catch (error) {
            console.error('Error saving recipe:', error);
          }
          
          console.log('finish');
          navigation.navigate('User');

          const userRef = doc(db, 'User', currentUser.key);
          let new_own_recipe = [...currentUser.own_recipe_list, recipeId];
          updateDoc(userRef, {
            "own_recipe_list": new_own_recipe
          })
          
        }
        
      
     
    };


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={()=>{navigation.navigate('Home')}}>
            <Text style={styles.text}>X</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={()=>{
            saveRecipe();
        }}>
            <Text style={styles.text}>Save</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Food Ingredients */}
        
        <Image source={{ uri: recipe.cover }} style={styles.image} />
        
        <TextInput
            style={styles.input}
            placeholder="Add Title of Recipe"
            value={name}
            onChangeText={setName} 
        />
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle]}>Food Ingredients</Text>
          <Food_ingredients/>
          <TouchableOpacity style={styles.add_button} onPress={()=>dispatch(addIngredient())}>
            <Text style = {styles.text}>Add 1 Row</Text>
          </TouchableOpacity>
        </View>
        <Divider style={{ marginVertical: 30, backgroundColor: 'lightgray' }} />

        {/* Steps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Steps</Text>
          <Step/>
          <TouchableOpacity style={styles.add_button} onPress={()=>{
            dispatch(addStep());
          }}>
            <Text style = {styles.text}>Add 1 Step</Text>
          </TouchableOpacity>
          
        </View>

        {/* Label */}
       
      </ScrollView>
      <View style={styles.status_container}>
        <TouchableOpacity style={styles.plus_button} >
          <Image source={require('../assets/plus.png')} style={styles.plus_img}></Image>
          <Text>Create Recipe</Text>
        </TouchableOpacity>
      </View>
      

      
    </SafeAreaView>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10, 
    
    
  },
  section:{
    width:'100%',
    
    position:'relative'
  },
  sectionTitle:{
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 20,
  },
  header:{
    height: 60, 
    width: '100%',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    
  },
  filter_container:{
    flex:0.8,
    alignItems:'center',
    justifyContent:'space-evenly'
  },
  status_container: {
    height: 80, 
    width: '100%',
    borderTopWidth: 1,
    borderColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  plus_img:{
    resizeMode:'contain',
    width:'100%',
    height:'100%',
  },
  plus_button:{
    height:50,
    width:50,
    
  },
  filter_button:{
    backgroundColor: '#58b1f5',
    borderRadius:10,
    height: 40,
    justifyContent:'center',
    paddingHorizontal:10,
  },
  scrollContent: {
    flexGrow: 1, 
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  text:{
    fontSize:20,
  },
  input: {
    height: 40, 
    borderBottomWidth: 1, 
    borderBottomColor: 'gray', 
    marginBottom: 20, 
    fontSize: 16, 
    paddingHorizontal: 10, 
  },
  add_button:{
    alignSelf: 'flex-end',
    backgroundColor: '#e8e8e8',
    width: '30%',
    borderRadius: 10,
    height: '40',
    alignItems:'center',
    justifyContent:'center'


  },
  text:{
    color: 'black',
    fontSize: 15,
  },
  button:{
    borderRadius:10,
    width:'100%',
    height:200,
    backgroundColor:'#e8e8e8',
    marginBottom:20,
    alignItems:'center',
    justifyContent:'center',
  },
  cover_text:{
    color:'grey',
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 10,
    borderRadius:10,
  },
  row:{
    flexDirection:'row',
  }
});

export default EditScreen;