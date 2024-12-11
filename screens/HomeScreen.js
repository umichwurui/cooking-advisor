import { Button } from '@rneui/themed';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput } from 'react-native';
import { useSelector } from 'react-redux';
import { signOut } from '../AuthManager';
import { resetRecipe } from '../data/userSlice';
import {useDispatch} from 'react-redux';
import { useState, useEffect } from "react";
import { collection, addDoc, doc, updateDoc, setDoc, getDoc, query, where, getDocs } from 'firebase/firestore';
import {db} from '../database_init';

function HomeScreen({navigation}) {
  const dispatch = useDispatch();
  const currentUser = useSelector(state => state.userSlice.currentUser);
  
  const [title, setTitle] = useState('');

  const handleSubmit = async ()=>{
    console.log(title);
    const title_list = title.split(' ');
    console.log(title_list);
    try {
        const recipesRef = collection(db, "Recipe");
        const recipeCount = {}; 
    
        
      for(const word of title_list){
          const q = query(
            recipesRef,
            where('keywords', "array-contains", word) 
          );
    
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach((doc) => {
            console.log('enter');
            const recipeId = doc.id;
    
            
            if (!recipeCount[recipeId]) {
              recipeCount[recipeId] = 0;
            }
            recipeCount[recipeId] += 1;
          });
        }
        
    
       
        const sortedRecipes = Object.entries(recipeCount)
          .sort(([, countA], [, countB]) => countB - countA) 
          .map(([recipeId]) => recipeId);
    
        console.log("Ranked Recipes:", sortedRecipes);
        navigation.navigate('Result', {sortedRecipes});
        return sortedRecipes;
      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
  }
  

  
  return (
    <View style={styles.container}>
      <View style={styles.filter_container}>
        
        {/* <Text>
          Direct Search
        </Text>
        */}
        <View style={styles.input}>
          <Image style={styles.search_img} source={require('../assets/search.png')} />
          <TextInput
             
              placeholder="Search Recipe"
              value={title}
              onChangeText={setTitle} 
              onSubmitEditing={handleSubmit}
          />
        </View>
       
        <Image style={styles.fridge_img}source={require("../assets/fridge.png")}/>
        <TouchableOpacity style={styles.fridge_button} onPress={()=>{
          navigation.navigate('Input');
        }}>
          <View>
            <Text style={styles.fridge_text}>
            Find Recipe based on
            </Text>
            <Text style={styles.fridge_text}>
            What you have
            </Text>
          </View>
          <Image style={styles.arrow_img}source={require("../assets/right-arrow.png")}/>
        </TouchableOpacity>
      
      </View>
      <View style={styles.status_container}>
       <TouchableOpacity style={styles.collection_button} onPress={()=>{
            navigation.navigate('Home')
        }}>
          <Image source={require('../assets/black_home.png')} style={styles.plus_img}></Image>
          <Text style={{alignSelf:'center', margin: 10}}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.collection_button} onPress={async()=>{
            await dispatch(resetRecipe());
            navigation.navigate('Create')
        }}>
          <Image source={require('../assets/plus.png')} style={styles.plus_img}></Image>
          <Text  style={{alignSelf:'center', marginVertical: 10}}>Create</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.collection_button} onPress={()=>{
            navigation.navigate('Collection')
        }}>
          <Image source={require('../assets/star.png')} style={styles.plus_img}></Image>
          <Text style={{alignSelf:'center', marginVertical: 10}}>Collection</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.collection_button} onPress={()=>{
            navigation.navigate('User')
        }}>
          <Image source={require('../assets/user.png')} style={styles.plus_img}></Image>
          <Text style={{alignSelf:'center', margin: 10}}>User</Text>
        </TouchableOpacity>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filter_container:{
    flex:0.8,
    alignItems:'center',
    justifyContent:'space-evenly'
  },
  status_container:{
    flex: 0.2,
    borderTopWidth:1,
    width:'100%',
    flexDirection:'row',
    justifyContent:'space-evenly',
    alignItems:'center',
  
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
  collection_button:{
    height:50,
    width:80,
  },
  
  input: {
    height: 50, 
    paddingHorizontal: 10, 
    backgroundColor: 'lightgray',
    borderRadius: 20, 
    width:300,
    borderColor: 'gray', 
    fontSize: 16, 
    color: 'black', 
    flexDirection:'row',
    alignItems:'center',
    
  },
  search_img:{
    height:30,
    width:30,
    resizeMode:'contain',
    tintColor:'grey',
    marginRight:20,
  },
  fridge_img:{
    height:200,
    width:200,
    

  },
  fridge_text:{
    width:300,
    alignSelf:'center',
    fontSize: 30,
    fontWeight:'400',
   
    textAlign: 'center', 
  },
  fridge_button:{
    flexDirection:'row',
    width:350,
    alignItems:'center'
    
  },
  arrow_img:{
    height:40,
    width:40,
    resizeMode:'contain',
    tintColor:'grey'
    
  }
});

export default HomeScreen;