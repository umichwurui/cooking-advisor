import { Button } from '@rneui/themed';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { signOut } from '../AuthManager';
import RecipeBlock from '../components/recipe_block';
import { useEffect, useState } from 'react';
import {db, storage} from '../database_init';

import { collection, addDoc, doc, updateDoc, setDoc, getDoc, query, where, getDocs } from 'firebase/firestore';


function InputScreen({navigation}) {
  
  const currentUser = useSelector(state => state.userSlice.currentUser);
  const [inputs, setInputs] = useState([{ id: 1, value: '' }, {id: 2, value: ''}, {id: 3, value: ''}]); 

  const handleAddInput = () => {
    const newId = inputs.length + 1; 
    setInputs([...inputs, { id: newId, value: '' }]); 
  };

  const handleInputChange = (id, text) => {
    const updatedInputs = inputs.map(input =>
      input.id === id ? { ...input, value: text } : input
    );
    setInputs(updatedInputs);
  };
  
  const handleSubmit = async ()=>{
    console.log(inputs);
    const filteredInputs = inputs.filter(item => item.value !== '');
    console.log(filteredInputs);
    try {
        const recipesRef = collection(db, "Recipe");
        const recipeCount = {}; 
    
      
        for (const input of filteredInputs) {

          const q = query(
            recipesRef,
            where(`ingredients.${input.value}`, "!=", null) 
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
    
        console.log('the recipe dictionary is',recipeCount);
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
      <View style={styles.title_container}>
        {/* <Text >
          Name : {currentUser.displayName}
        </Text> */}
       
        <Text style={styles.title}>
          Tell me what you have
        </Text>
        <TouchableOpacity style={styles.submit_button} onPress={()=>{handleSubmit()}}>
            <Text style={styles.submit_text}>Submit</Text>
        </TouchableOpacity>
        
        
      </View>
      <View style={styles.filter_container}>
         
         {inputs.map((input) => (
            <View key={input.id} style={styles.input_row}>
                <Text style={[styles.input,styles.label]}>{input.id}. </Text>
                <TextInput
                    style={styles.input}
                    placeholder={`Enter text for ${input.id}`}
                    value={input.value}
                    onChangeText={(text) => handleInputChange(input.id, text)}
                />
            </View>
      ))}

      <TouchableOpacity onPress={handleAddInput} style={styles.add_button}>
        <Text>Add More</Text>
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
  title_container:{
    flex:0.1,
    alignItems:'center',
    justifyContent:'center',
    // flexDirection:'row'
  },
  submit_button:{
    position:'absolute',
    left: 250,
    top:50,
  },
  submit_text:{
    fontSize:15,
  },
  filter_container:{
    flex:0.8,
    alignItems:'center',
   
    width: '100%',
    borderTopWidth:1,
    borderColor:'#c9c9c9'
  },
  status_container:{
    flex: 0.15,
    borderTopWidth:1,
    borderColor:'#c9c9c9',
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
  filter_button:{
    backgroundColor: '#58b1f5',
    borderRadius:10,
    height: 40,
    justifyContent:'center',
    paddingHorizontal:10,
    width:'100%'
  },

  recipe_block:{
    height: 100,
    borderWidth:1,
    width:'80%',
    alignSelf:'center'
  },
  title:{
    fontSize:20,
    width:'100%',
    marginTop:10,
    fontWeight:'500'
  },
  input_row:{
    flexDirection:'row',
    
    width:'70%',
    alignSelf:'center',
    borderBottomWidth:1,
    borderBottomColor:'lightgrey',
  },
  label:{
    fontSize:20,
    marginHorizontal:20,
  },
  input:{
    marginTop:20,
    height:30,
  },
  add_button:{
    alignSelf: 'flex-end',
    backgroundColor: '#e8e8e8',
    width: '25%',
    borderRadius: 50,
    height: '50',
    alignItems:'center',
    justifyContent:'center',
    marginTop:20,
    marginRight:10,
    

  },
});

export default InputScreen;