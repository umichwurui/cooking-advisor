import { Button } from '@rneui/themed';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput,ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { signOut } from '../AuthManager';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Food_ingredients from '../components/food_ingredients';
import Step from '../components/step';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"; 
import { getDatabase, ref as dbRef, set } from "firebase/database"; 

import {useDispatch} from 'react-redux';
import { addStep, addIngredient, setCover } from '../data/userSlice';
import { collection, addDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
import {db} from '../database_init';
import { Divider } from '@rneui/themed';



export function CreateScreen({navigation}) {
    const dispatch = useDispatch();
   
    const currentUser = useSelector(state => state.userSlice.currentUser);
    // console.log(currentUser);
    const ingredients = useSelector(state=>state.userSlice.currentRecipe.ingredients);
    const [name, setName] = useState('');
    const [foodIngredients, setFoodIngredients] = useState([]);
    const [cover, setCover] = useState('');
    const steps = useSelector(state => state.userSlice.currentRecipe.steps);


    const handleUpdateIngredient = (id, field, value) => {
        setFoodIngredients((prev) =>
        prev.map((item) =>
            item.id === id ? { ...item, [field]: value } : item
        )
        );
        // console.log(foodIngredients);
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
        // console.log('ok?');
        const storage = getStorage();
        let storageRef = undefined;
        if(!is_cover){
          storageRef = ref(storage, `${recipe_id}_${step_index}.jpg`);
        }else{
          storageRef = ref(storage, `${recipe_id}_cover.jpg`);
        }
        // console.log(storageRef);
        await uploadBytes(storageRef, blob);

        
        const downloadUrl = await getDownloadURL(storageRef);
        return downloadUrl;
    };
    
    const saveRecipe = async () => {
      navigation.navigate('Home');
      const recipeColl = collection(db, 'Recipe');
      const recipeRef = await addDoc(recipeColl, {}); 
      const recipeId = recipeRef.id; 
      // console.log('hi');
      const updatedSteps = await Promise.all(
        steps.map(async (step, index) => {
          console.log(step);
            if (step.image.startsWith('file://')) {
             
                const downloadUrl = await uploadImageToFirebase(step.image, recipeId, false, index);
               
                return { ...step, imageUri: downloadUrl };
            }else{
              return { ...step, imageUri: ''};
            }
            return step; 
        })
    );
    
    const cover_url = await uploadImageToFirebase(cover,recipeId, true, 0);
    console.log(cover_url);
    const recipe = {
      id: recipeId, 
      name: name,
      keywords: name.split(' '),
      author_name: currentUser.displayName,
      
      author_uid: currentUser.key,
      folk_author_name: '',
      cover: cover_url,
      steps: updatedSteps,
      ingredients: ingredients,
      comments:[],
      num_star:0,
      num_comment:0,
    };
    console.log(recipe);

    console.log('Recipe Reference:', recipeRef);

    try {
      await setDoc(recipeRef, recipe);
      console.log('Recipe saved successfully');
    } catch (error) {
      console.error('Error saving recipe:', error);
    }
    
    console.log('finish');

    const userRef = doc(db, 'User', currentUser.key);
    let new_own_recipe = [...currentUser.own_recipe_list, recipeId];
    updateDoc(userRef, {
      "own_recipe_list": new_own_recipe
    })
    
    

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
        {cover ? (
            <Image source={{ uri: cover }} style={styles.image} />
          ) : (
            <TouchableOpacity style={styles.button} onPress={()=>handleAddImage()}>
                <Text style={styles.cover_text}>Add a cover of the Recipe.</Text>
            </TouchableOpacity>
          )}
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
});

export default CreateScreen;