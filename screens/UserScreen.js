import { Button } from '@rneui/themed';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { signOut } from '../AuthManager';
import RecipeBlock from '../components/recipe_block';
import { ScrollView } from 'react-native'
import { resetRecipe } from '../data/userSlice';


function UserScreen({ navigation }) {
  const dispatch = useDispatch();
  const currentUser = useSelector(state => state.userSlice.currentUser);
  console.log('currentuser is ', currentUser);

  return (
    <View style={styles.container}>
      <View style={styles.title_container}>
        <Text style={styles.title}>Your own Recipe</Text>
      </View>
      <ScrollView style={styles.scrollView}>
        <View style={styles.filter_container}>
          <RecipeBlock navigation={navigation} recipe_list={currentUser.own_recipe_list} />
        </View>
      </ScrollView>
      <View style={styles.status_container}>
        <TouchableOpacity style={styles.collection_button} onPress={() => navigation.navigate('Home')}>
          <Image source={require('../assets/home.png')} style={styles.plus_img} />
          <Text style={{ alignSelf: 'center', margin: 10 }}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.plus_button} onPress={async() => {
          await dispatch(resetRecipe());
          navigation.navigate('Create')}}>
          <Image source={require('../assets/plus.png')} style={styles.plus_img} />
          <Text style={{ alignSelf: 'center', marginVertical: 10 }}>Create</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.collection_button} onPress={() => navigation.navigate('Collection')}>
          <Image source={require('../assets/star.png')} style={styles.plus_img} />
          <Text style={{ alignSelf: 'center', marginVertical: 10 }}>Collection</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.collection_button} onPress={() => navigation.navigate('User')}>
          <Image source={require('../assets/black_user.png')} style={styles.plus_img} />
          <Text style={{ alignSelf: 'center', margin: 10 }}>User</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title_container: {
    flex: 0.15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop:20,
  },
  scrollView: {
    flex: 0.6,
    width: '100%',
    borderTopWidth: 1,
    borderColor: '#c9c9c9',
  },
  filter_container: {
    alignItems: 'center',
    paddingVertical: 10,
    width: '100%',
  },
  status_container: {
    flex: 0.2,
    borderTopWidth: 1,
    borderColor: '#c9c9c9',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  plus_img: {
    resizeMode: 'contain',
    width: '100%',
    height: '100%',
  },
  plus_button: {
    height: 50,
    width: 50,
  },
  collection_button: {
    height: 50,
    width: 80,
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
    marginTop: 10,
  },
});

export default UserScreen;
