import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"; 
import { getDatabase, ref as dbRef, set } from "firebase/database"; 
import {db, storage} from '../database_init';
import { collection, addDoc, doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput,ScrollView, ActivityIndicator } from 'react-native';
import { loadRecipe } from '../data/userSlice';
import {useDispatch} from 'react-redux';
import { useSelector } from 'react-redux';





export default function RecipeBlock({ navigation, recipe_list, }) {
    const dispatch = useDispatch();
    const currentUser = useSelector(state => state.userSlice.currentUser);
    const [recipeInfo, setRecipeInfo] = useState([]);
    const [imagesLoaded, setImagesLoaded] = useState(0);
  
    // Fetch recipes
    const fetchRecipes = async () => {
      try {
        const recipe_promises = recipe_list.map(async (recipe_id) => {
          console.log('recipe block: ',recipe_id);

          const recipe_ref = doc(db, 'Recipe', recipe_id);
          const recipe_snap = await getDoc(recipe_ref);
          if(!recipe_snap.exists()){
            console.log('not exist  ', recipe_id);

            const user_ref = doc(db, 'User', currentUser.key);
            const new_collection = currentUser.starred_recipe_list.filter(recipe=>{
              return recipe !== recipe_id
            })
            const new_owned = currentUser.own_recipe_list.filter(recipe=>{
              return recipe !== recipe_id
            })
            console.log('new collection is ', new_collection);
          
          console.log('new owned is ', new_owned);
            await updateDoc(user_ref, {
              starred_recipe_list: new_collection,
              own_recipe_list: new_owned
            });
          }
          return recipe_snap.exists() ? recipe_snap.data() : null;
        });
  
        const recipe_info = (await Promise.all(recipe_promises)).filter(
          (recipe) => recipe !== null
        );
        setRecipeInfo(recipe_info);
      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
    };
  
    useEffect(() => {
      fetchRecipes();
    }, [recipe_list]);
  
    const totalImages = recipeInfo.length;
  
    return (
      <ScrollView
        style={{ flex: 1, width: '100%' }}
        contentContainerStyle={styles.container}
      >
        {recipeInfo.length === 0 ? (
          <View style={styles.empty_view}>
            <Image style={styles.empty_box} source={require("../assets/empty-box.png")}/>
            <Text style={styles.text_box}>    Empty list. Go and find more recipes ~</Text>
          </View>
        ) : (
          recipeInfo.map((recipe) => (
            <TouchableOpacity key={recipe.id} style={styles.block}  onPress={async () => {
              await dispatch(loadRecipe(recipe.id));
              navigation.navigate('Recipe');
              }}>
              <View style={styles.img_container}>
                <Image
                  source={{ uri: recipe.cover }}
                  style={styles.cover_img}
                  onLoad={() => console.log("Image loaded:", recipe.cover)}
                  onError={(e) => console.log("Image load error:", e.nativeEvent.error)}
                />
              </View>
              <View style={styles.text_container}>
                <Text style={styles.title}>{recipe.name}</Text>
                <Text style={{color:'grey'}}>{recipe.author_name}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    );
    
  }
  
  

const styles = StyleSheet.create({
  container: {
   
    
    position:'flex',
    alignItems: 'center',
    width: '100%',
    height:'100%',
    borderwidth:1,
    flexDirection: 'column',
    flexGrow: 1, 
    paddingBottom: 16, 
  },
  
  block:{
        flexDirection:'row',
        position:'flex',
        alignItems: 'center',
        width: '100%',
        height:150,
        marginTop:20,
        

  },
    cover_img:{
        borderRadius: 30,
        width:200,
        height:150,
        resizeMode: 'cover',
       

    },
    title:{
        
        fontFamily: 'Nunito',
        fontWeight: 'bold',
        fontSize:20,

    },
    img_container:{
        borderRadius: 30,
        width:200,
        height:150,
        borderWidth:1,
        position:'absolute',
        left: 20,
    },
    text_container:{
        position:'absolute',
        left: 250,
        width: 150,
       
        // alignItems:'center',
    },
    recipe_block:{
      height: 100,
      borderWidth:1,
      width:'80%',
      alignSelf:'center'
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5F5', 
        zIndex: 10, 
      },
    empty_box:{
      
      marginTop:200,
      marginBottom:70,
      height:200,
      width:200,
      resizeMode:'contain'
    },
    empty_view:{
      width:'100%',
      height:'100%',
      alignItems:'center'
    },
    text_box:{
      textAlign:'center',
      fontSize:20,
      color:'grey',
      fontStyle:'italic'
    }
  });
  