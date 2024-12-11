import { Button } from '@rneui/themed';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { signOut } from '../AuthManager';
import RecipeBlock from '../components/recipe_block';


function ResultScreen({navigation, route}) {
  
  const currentUser = useSelector(state => state.userSlice.currentUser);
  const {sortedRecipes} = route.params;

  
  return (
    <View style={styles.container}>
      <View style={styles.title_container}>
        {/* <Text >
          Name : {currentUser.displayName}
        </Text> */}
       
        <Text style={styles.title}>
          Result
        </Text>
        
        
      </View>
      <View style={styles.filter_container}>
         <RecipeBlock navigation={navigation} recipe_list={sortedRecipes}/>
      </View>
     

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height:'100%',
    justifyContent: 'center',
    alignItems: 'center',
    
  },
  title_container:{
    height:100,
    alignItems:'center',
    justifyContent:'center',
  },
  filter_container:{
    height:800,
    alignItems:'center',
    justifyContent:'flex-start',
    width: '100%',
    borderTopWidth:1,
    borderColor:'#c9c9c9'
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
  },
  recipe_block:{
    height: 100,
    borderWidth:1,
    width:'80%',
    alignSelf:'flex-start'
  },
  title:{
    fontSize:20,
    width:'100%',
    marginTop:10,
    fontWeight:'500'
  }
});

export default ResultScreen;