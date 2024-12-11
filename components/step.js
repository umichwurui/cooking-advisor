
import React from 'react';
import { View, Text, StyleSheet, Image, TextInput, Button,TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import {useDispatch} from 'react-redux';
import { addStep, setStep, deleteStep } from '../data/userSlice';
import * as ImagePicker from 'expo-image-picker';
import { useState, useEffect } from 'react';


export default function Step() {
    const dispatch = useDispatch();
  const steps = useSelector(state => state.userSlice.currentRecipe.steps || []); 
  const [localInputs, setLocalInputs] = useState(
    steps.map(step => step.description) 
  );
  const handleUpdateStep = (index, description) => {
    const updatedSteps = [...steps];
    updatedSteps[index] = { ...updatedSteps[index], description };
    console.log(updatedSteps);
    dispatch(setStep(updatedSteps));
  };

  const uploadImageToFirebase = async (imageUri, stepIndex) => {
    const response = await fetch(imageUri);
    const blob = await response.blob();

    const storage = getStorage();
    const storageRef = ref(storage, `steps/${stepIndex}_${Date.now()}.jpg`);
    await uploadBytes(storageRef, blob);

    
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  };




  const handleAddImage = async (stepIndex) => {
   
    const options = {
        mediaType: 'photo', 
        selectionLimit: 1, 
        quality: 1, 
        includeBase64: false, 
      };
    const result = await ImagePicker.launchImageLibraryAsync(options);
    
    if (!result.canceled) {
       
    const updatedSteps = JSON.parse(JSON.stringify(steps));
      
    updatedSteps[stepIndex]["image"] = result.assets[0].uri; 
    
      console.log(updatedSteps);
      dispatch(setStep(updatedSteps));  
    }
  };
  const handleInputChange = (index, text) => {
    const updatedInputs = [...localInputs];
    updatedInputs[index] = text;
    setLocalInputs(updatedInputs); 
  };

  const removeStep = (index)=>{
   
    dispatch(deleteStep(index));
  }
  useEffect(() => {
    setLocalInputs(steps.map(step => step.description));
  }, [steps]);


  return (
    <View style={styles.container}>
      {steps.map((step, index) => (
        <View key={index} style={styles.step}>
            <View style={styles.step_operation}>
                <Text style={styles.step_index}>Step {index+1}</Text>

                <TouchableOpacity style={styles.remove_button} onPress={()=>removeStep(index)}>
                    <Image style={styles.remove_image} source={require('../assets/remove.png')}/>
                </TouchableOpacity>
                
            </View>
          {step.image ? (
            <Image source={{ uri: step.image }} style={styles.image} />
          ) : (
            <TouchableOpacity style={styles.button} onPress={()=>handleAddImage(index)}>
                <Text style={styles.text}>Add the image of the step.</Text>
                <Text style={styles.text}>Clear steps can make the recipe more popular.</Text>
            </TouchableOpacity>
          )}
          <TextInput
            style={styles.input}
            placeholder={`Step ${index + 1} Description`}
            value={localInputs[index]}
            onChangeText={text => handleInputChange(index, text)} 
            onBlur={() => handleUpdateStep(index, localInputs[index])} 
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    // borderWidth:1,
  },
  step: {
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 10,

    borderRadius:10,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
   
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
  text:{
    color:'grey',
  },
  step_index:{
    fontWeight:'regular',
    fontSize: 20,
    marginBottom:10,
  },
  remove_image:{
    resizeMode:'contain',
    width: 20,
    height:20,
    tintColor:'grey',
  },
  step_operation:{
    flexDirection:'row',
    justifyContent:'space-between'
  }
});
