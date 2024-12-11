import { Button } from '@rneui/themed';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput,ScrollView, KeyboardAvoidingView, Modal } from 'react-native';
import { Overlay } from '@rneui/themed';

import { useSelector } from 'react-redux';
import { signOut } from '../AuthManager';
import { useEffect, useState, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Food_ingredients from '../components/food_ingredients';
import Step from '../components/step';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"; 
import { getDatabase, ref as dbRef, set } from "firebase/database"; 

import {useDispatch} from 'react-redux';
import { addStep, addIngredient, setCover } from '../data/userSlice';
import { collection, addDoc, doc, updateDoc, setDoc, increment, arrayUnion, deleteDoc } from 'firebase/firestore';
import {db} from '../database_init';
import { Divider } from '@rneui/themed';

import { addComment, deleteComment } from '../data/userSlice';











export function RecipeScreen({navigation, route}) {
    const dispatch = useDispatch();
    const currentUser = useSelector(state => state.userSlice.currentUser);
    const storage = getStorage();
    
    // console.log(currentUser);
    const recipe = useSelector(state=>state.userSlice.currentRecipe);
    // console.log('current recipe is');
    // console.log(recipe);
    const recipeRef = doc(db, "Recipe", recipe.id);
    const userRef = doc(db, 'User', currentUser.key);
    const textInputRef = useRef(null);
    const [isStar, setIsStar] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null); 

    const [numStar, setNumStar] = useState(recipe.num_star);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isOperationVisible, setIsOperationVisible] = useState(false);
    const [comment, setComment] = useState('');
    const [isDelete, setIsDelete] = useState(false);
    const [currentComment, setCurrentComment] = useState({});
    const [isPickerVisible, setIsPickerVisible] = useState(false);

    const handleImageSelection = async (type) => {
      try {
        let result;
        if (type === 'camera') {
          result = await ImagePicker.launchCameraAsync({
            mediaType: 'photo', 
            selectionLimit: 1, 
            quality: 1, 
            includeBase64: false, 
          });
        } else if (type === 'gallery') {
          result = await ImagePicker.launchImageLibraryAsync({
            mediaType: 'photo', 
            selectionLimit: 1, 
            quality: 1, 
            includeBase64: false, 
          });
        }
        console.log(result);

        if (!result.canceled) {
          console.log('Selected Image:', result.assets[0].uri);
          setSelectedImage(result.assets[0].uri); 
          
        
        }
        setIsPickerVisible(false); 
      } catch (error) {
        console.error('Error selecting image:', error);
      }
    };

    const uploadImageToStorage = async (imageUri) => {
      try {
        const response = await fetch(imageUri); 
        const blob = await response.blob(); 
        const storageRef = ref(storage, `${recipe.id}_comments/${Date.now()}.jpg`); 
    
        await uploadBytes(storageRef, blob); 
        const downloadUrl = await getDownloadURL(storageRef); 
    
        return downloadUrl;
      } catch (error) {
        console.error("Error uploading image:", error);
        throw error;
      }
    };
    

    useEffect(()=>{
        console.log(selectedImage);
        const has_starred = currentUser.starred_recipe_list.filter(item=>{
           return item === recipe.id;
        })
        if(has_starred.length === 0){
            setIsStar(false);
        }else{
            setIsStar(true);
        }
        
    },[])

    const send_star = async ()=>{
        if(!isStar){
            await updateDoc(recipeRef, {
                num_star: increment(1)
            });
            setNumStar(numStar+1);
            await updateDoc(userRef, {
                starred_recipe_list: [...currentUser.starred_recipe_list, recipe.id],
            });
        }else{
            await updateDoc(recipeRef, {
                num_star: increment(-1)
            });
            let new_recipe_list = currentUser.starred_recipe_list.filter(item=>{
                return item !== recipe.id;
            })
            await updateDoc(userRef, {
                starred_recipe_list: new_recipe_list,
            });
            setNumStar(numStar-1);

        }
        setIsStar(!isStar)
        
    }

    const closeCommentBox = () => {
        setIsModalVisible(false);
        setComment(""); 
    };

    const closeOperationBox = () => {
      setIsOperationVisible(false);
      
    };

    const sendComment = async() => {
        console.log('enter');
        let imageUrl = null;
        if (selectedImage) {
          imageUrl = await uploadImageToStorage(selectedImage); 
        }
        const new_comment = {
            username: currentUser.displayName,
            content: comment,
            image: imageUrl,
            timestamp: Date.now() 
          };
        dispatch(addComment({recipeRef, new_comment}));
        closeCommentBox(); 
        setSelectedImage(null);
    };

    const openCommentBox = () => {
        setIsModalVisible(true); 
        setTimeout(() => {
           
            if (textInputRef.current) {
            textInputRef.current.focus();
            }
        }, 100); 
    };

    const edit_recipe = ()=>{
      let is_author = recipe.author_uid === currentUser.key ? true : false;
      
      
      navigation.navigate('Edit', {is_author: is_author, recipe_author: recipe.author_name});
    }

    const deleteRecipe = async()=>{
      const cover_ref = ref(storage, recipe.cover);
      deleteObject(cover_ref);
      for(const step of recipe.steps){
        if(step.imageUri !== ''){
          const step_ref = ref(storage, step.imageUri);
          deleteObject(step_ref);
        }
      }
      const userRef = doc(db,'User',currentUser.key);
      console.log("orinial_own_recipe", currentUser.own_recipe_list);
      const new_own_recipes = currentUser.own_recipe_list.filter(recipe_id=>{
        return recipe_id !== recipe.id
      })
      console.log('new_own_recipes ', new_own_recipes);
      await updateDoc(userRef,{
        own_recipe_list: new_own_recipes
      })
      console.log(recipe.id);
      const docRef = doc(db, 'Recipe', recipe.id);
      await deleteDoc(docRef);

      
      navigation.navigate('User');


    }
    


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={()=>{navigation.navigate('Home')}}>
            <Text style={styles.text}>X</Text>
        </TouchableOpacity>
        <View style={styles.title_box}>
          <Text style={styles.title_input}>
              {recipe.name}
          </Text>
          <Text style={styles.author}>
              {recipe.author_name}
          </Text>
        </View>
        <TouchableOpacity onPress={()=>{
            setIsOperationVisible(true);
        }}>
            <Text style={[{fontWeight: '900', fontSize: 20}]}>···</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Food Ingredients */}
        
        <Image source={{ uri: recipe.cover }} style={styles.image} />
        
            
          
       
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle]}>Food Ingredients</Text>
          <View style={styles.component_container}>
            {Object.entries(recipe.ingredients).map(([key, value], index) => (
                
                <View key={index} style={styles.row}>
                  <Text style={styles.input} > 
                      {key}
                  </Text>
                  <Text style={styles.input} > 
                      {value}
                  </Text>
                
                </View>
            ))}
        </View>
         
        </View>
        <Divider style={{ marginVertical: 30, backgroundColor: 'lightgray' }} />

        {/* Steps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Steps</Text>
          {recipe.steps.map((step, index) => (
            <View key={index} style={styles.step}>
                <View style={styles.step_operation}>
                    <Text style={styles.step_index}>Step {index+1}</Text>

                  
                    
                </View>
                {step.imageUri === '' ? null : ( <Image source={{ uri: step.imageUri }} style={styles.image} />)}

                
            
                <Text style={styles.step_input}>
                    {step.description}
                </Text>
            </View>
        ))}
          
        </View>

        <View>
        <Text style={styles.commentTitle}>Comments :</Text>
        {("comments" in recipe) ? 
            (recipe.comments.map((comment, index)=>(
                <View key={index}>
                    <Text style={styles.comment_name}>{comment.username} :</Text>
                    <TouchableOpacity onPress={()=>{
                      console.log(comment);
                        if(currentUser.displayName === comment.username){
                            setCurrentComment(comment);
                            console.log('now current comment is ', currentComment)
                            setIsDelete(true);
                        }
                    }}>
                        <Text style={styles.comment_content}>
                        {comment.content}
                        </Text>
                        {comment.image ? (<Image style={styles.comment_image} source={{uri: comment.image}}/>): null}
                    </TouchableOpacity>
                    
                </View>

            )))
            :
            <Text>There's no comment. Leave some comments.</Text>
            
        }
      </View>

       
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.collection_button} onPress={()=>{
               send_star();
            }}>

            {isStar ? 
            <Image source={require('../assets/starred.png')} style={styles.plus_img}></Image>
            :
            <Image source={require('../assets/star.png')} style={styles.plus_img}></Image>
            }
            
            <Text style={{alignSelf:'center', marginVertical: 10}}>{numStar}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.collection_button} onPress={()=>{
               
            }}>
            
            <Image source={require('../assets/speech-bubble.png')} style={styles.plus_img}></Image>
            <Text style={{alignSelf:'center', marginVertical: 10}}>{recipe.comments.length}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.input_button} onPress={()=>{
               openCommentBox();
            }}>
           
            <Text style={{alignSelf:'center', marginVertical: 10}}>Say Something</Text>
        </TouchableOpacity>
        

      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={closeCommentBox}
        presentationStyle='overFullScreen'
      >
         <View style={styles.modalBackground}>
         
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={closeCommentBox}
          />

          
          <KeyboardAvoidingView
            style={styles.modalContent}
            behavior="padding" 
          >
            <View style={styles.commentBox}>
              <View style={styles.comment_big_box}>
                <TextInput
                  ref={textInputRef} 
                  style={styles.new_input}
                  placeholder="Leave some comments :)"
                  value={comment}
                  onChangeText={setComment}
                  multiline={true}
                  placeholderTextColor="gray" 
                />
              
                <TouchableOpacity style={styles.cameraButton} onPress={() => setIsPickerVisible(true)}>
                    <Image source={require('../assets/camera.png')} style={styles.cameraIcon} />
                  </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.sendButton} onPress={()=>sendComment()}>
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
            {selectedImage && ( 
                <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
              )}
          </KeyboardAvoidingView>
        </View>

      </Modal>
      <Overlay  isVisible={isDelete} onBackdropPress={()=>setIsDelete(false)}>
        <TouchableOpacity style={styles.sendButton} onPress={()=>{
            console.log('hi');
            console.log(currentComment);
            dispatch(deleteComment({recipeRef,currentComment}));
            setIsDelete(false);
            }}>
            <Text style={styles.sendButtonText}>Delete</Text>
        </TouchableOpacity>
      </Overlay>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isOperationVisible}
        onRequestClose={closeOperationBox}
        presentationStyle='overFullScreen'
      >
         <View style={styles.modalBackground}>
         
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={closeOperationBox}
          />

          
         <View style={styles.operationContent}>

             
         <TouchableOpacity style={styles.operation_back} onPress={()=>{
          setIsOperationVisible(false);
         }}>
          <Image style = {[styles.operation_img,{tintColor:'grey'}]}source={require('../assets/close.png')}/>
         </TouchableOpacity>
         <TouchableOpacity style={styles.operation_button} onPress={()=>{
                    setIsOperationVisible(false);
                    edit_recipe();
                }}>
                   <View style={styles.operation_view}>
                    <Image style={styles.operation_img}source={require('../assets/edit.png')}/>
                    </View>
                    <Text style={styles.text}> Edit</Text>
          </TouchableOpacity>
            {recipe.author_uid === currentUser.key ? 
                ( <TouchableOpacity style={styles.operation_button} onPress={()=>{
                    
                    deleteRecipe();
                    setIsOperationVisible(false);
                }}>
                   <View style={styles.operation_view}>
                    <Image style={styles.operation_img}source={require('../assets/bin.png')}/>
                    </View>
                    <Text style={styles.text}> Delete Recipe</Text>
                </TouchableOpacity>) 
                : 
                null}

           
         </View>
        </View>
        </Modal>

        <Modal
          transparent={true}
          visible={isPickerVisible}
          animationType="slide"
          onRequestClose={() => setIsPickerVisible(false)}
        >
          <View style={styles.modalBackground_option}>
            <View style={styles.modalContent_option}>
              <TouchableOpacity
                style={styles.modalButton_option}
                onPress={() => handleImageSelection('camera')}
              >
                <Text>Take a Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton_option}
                onPress={() => handleImageSelection('gallery')}
              >
                <Text>Choose from Library</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalCloseButton_option} onPress={() => setIsPickerVisible(false)}>
                <Text>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
          
     
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10, 
    
    
  },
  footer:{
    flexDirection: 'row',
    width: '100%',
    height: '10%',
    justifyContent:'space-evenly'
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
  title_input: {
    height: 30, 
    fontSize: 20, 
    paddingHorizontal: 10, 
    fontWeight:'800',
    fontStyle: 'italic'
    
  },
  author:{
    height: 20, 
    
    
    fontSize: 15, 
    paddingHorizontal: 10, 
    fontWeight:'500',
    fontStyle: 'italic'
    
  },
  title_box:{
    flexDirection:'column',
    alignItems:'center'
  },
  step_input: {
    marginTop:20,
    borderBottomWidth: 1, 
    borderBottomColor: 'gray', 
    marginBottom: 20, 
    fontSize: 16, 
    paddingHorizontal: 10, 
  },
  input: {
    // height: 40, 
    width:'45%',
    // borderWidth:1,
    borderBottomWidth: 1, 
    borderBottomColor: 'gray', 
    marginBottom: 20, 
    fontSize: 16, 
    // textAlignVertical:'bottom',
   
    padding: 1,
    paddingBottom:0,
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
  new_input:{
    height: 50, 
    width: "80%",
    borderColor: "#ccc",
   
    borderRadius: 10,
    paddingHorizontal: 15, 
    paddingVertical: 15, 
    textAlignVertical: "center", 
    fontSize: 16, 
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
    flexDirection:'row'
  },
  input_button:{
    height:50,
    width: 150,
    backgroundColor: '#e8e8e8',
    borderRadius: 20,
    
    justifyContent: 'center'
  },
  modalBackground: {
    flex: 1,
    justifyContent: "flex-end", 
    backgroundColor: "rgba(0, 0, 0, 0.5)", 
   
  },
  overlay: {
    flex: 1,
  },
  modalContent: {
    justifyContent: "center",
    backgroundColor: "#fff",
    // padding: 20,
    marginVertical:20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: "100%",
    flexDirection:'column',
  },
  operationContent:{
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: "100%",
    height:'35%',
    flexDirection:'row',
    justifyContent:'space-evenly',
    alignItems:'center'
  },
  sendButton: {
    backgroundColor: "#ed5118",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: "center",
    marginLeft:5,
  },
  commentBox: {
    backgroundColor: "#fff",
    paddingVertical: 20,
    width:'100%',
    borderWidth:1,
    borderRadius: 10,
   
    flexDirection:'row',
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  comment_content:{
    fontSize: 20,
  },

  comment_name:{
    fontSize:15,
    fontStyle:'italic'
  },
  row:{
    flexDirection:'row',
    width:'100%',
    // borderWidth:1,
    justifyContent: 'space-between'
  },
  commentTitle:{
    fontSize:20,
    marginVertical:20,
  },
  operation_img:{
    width:'50%',
    height:'50%',
    resizeMode:'contain',
    
  },
  operation_view:{
    width:'70%',
    height:'70%',
    borderRadius: 9999,
    backgroundColor:'#e8e8e8',
    alignItems:'center',
    justifyContent:'center',
    marginBottom:10,
  },
  operation_button:{
    
    width:'100',
    height:'100',
    

    alignItems:'center',
    justifyContent:'center',
  },
  operation_back:{
    position:'absolute',
    top:20,
    right:10,
    height:30,
    width:30,
  },
  cameraIcon:{
    height:30,
    width:30,
    resizeMode:'contain',
    alignSelf:'flex-end'
  },
  modalButton_option: {
    padding: 10,
    marginVertical: 10,
    backgroundColor: "#e8e8e8",
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
  },
  modalCloseButton_option: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#ff5252",
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
  },
  modalBackground_option: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent_option: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  selectedImage: {
    width: 100,
    height: 100, 
    marginTop: 10,
    resizeMode:'contain',
    borderRadius: 10,
  },
  comment_big_box:{
    flexDirection:'row',
    borderWidth:1,
    borderRadius:40,
    alignItems:'center',
    width:320,
    marginLeft:20,
  },
  comment_image: {
    width: 100,  
    height: 100, 
    resizeMode: 'contain',
  },
});

export default RecipeScreen;