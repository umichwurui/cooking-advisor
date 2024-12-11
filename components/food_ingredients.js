import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Image} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { updateIngredients, deleteIngredient } from '../data/userSlice';

export default function FoodIngredients() {
  const dispatch = useDispatch();
  const food_ingredients = useSelector(state => state.userSlice.currentRecipe.ingredients || {});
  const [ingredients, setIngredients] = useState([]);

  useEffect(() => {
    console.log('food ingredients')
    setIngredients(
      Object.keys(food_ingredients).map(key => ({
        name: key,
        amount: food_ingredients[key],
      }))
    );
  }, [food_ingredients]);

  const handleIngredientChange = (index, field, value) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index][field] = value;
    setIngredients(updatedIngredients); 
  };

  const handleBlur = () => {
    // console.log(ingredients);
    const updatedIngredientsObject = ingredients.reduce((acc, item) => {
        acc[item.name.toLowerCase()] = item.amount;
        return acc;
    }, {});
    // console.log('after');
    // console.log(updatedIngredientsObject);
  
    dispatch(updateIngredients(updatedIngredientsObject)); 
  };

  const removeIngredient = (name)=>{
    console.log(name);
    dispatch(deleteIngredient(name));
  }
  useEffect(() => {
    if (food_ingredients) {
      setIngredients(
        Object.keys(food_ingredients).map(key => ({
          name: key,
          amount: food_ingredients[key] || 0,
        }))
      );
    }
  }, [food_ingredients]);
  
  return (
    <View style={styles.component_container}>
      {ingredients.map((item, index) => (
        
        <View key={index} style={styles.row}>
          <TextInput
            style={styles.input}
            placeholder="Food Material E.x. Egg"
            value={item.name}
            onChangeText={text => handleIngredientChange(index, 'name', text)} 
            onBlur={handleBlur}
          />
          <TextInput
            style={styles.input}
            placeholder="Amount E.x. 1"
            value={item.amount}
            onChangeText={text => handleIngredientChange(index, 'amount', text)}
            onBlur={handleBlur} 
          />
          <TouchableOpacity style={styles.remove_button} onPress={()=>removeIngredient(item.name)}>
            <Image style={styles.remove_image} source={require('../assets/remove.png')}/>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  component_container: {
    flexDirection: 'column',
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    // borderWidth: 1,
    borderBottomWidth:1,
    borderColor: 'lightgray',
    borderRadius: 5,
    padding: 10,
    marginHorizontal: 5,
  },
  remove_button:{
    
    
  },
  remove_image:{
    resizeMode:'contain',
    width: 20,
    height:20,
    tintColor:'grey',
  }
});
