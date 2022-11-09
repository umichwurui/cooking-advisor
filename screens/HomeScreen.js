import { Button } from '@rneui/themed';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { getApps, initializeApp } from 'firebase/app';
import { onSnapshot, getFirestore, collection } from 'firebase/firestore';
import { firebaseConfig } from '../Secrets';
import { useEffect, useState } from 'react';

let app;
const apps = getApps();

if (apps.length == 0) { 
  app = initializeApp(firebaseConfig);
} else {
  app = apps[0];
}

const auth = getAuth(app);
const db = getFirestore(app);

function HomeScreen({navigation}) {
  const [displayName, setDisplayName] = useState('');
  const [currUserId, setCurrUserId] = useState(auth.currentUser?.uid);
  const [users, setUsers] = useState([]);

  useEffect(()=>{
    onSnapshot(collection(db, 'users'), qSnap => {
      let newUsers = [];
      qSnap.forEach(docSnap => {
        let newUser = docSnap.data();
        newUser.key = docSnap.id;
        if (newUser.key === currUserId) {
          setDisplayName(newUser.displayName);
        }
        newUsers.push(newUser);
      });
      console.log('currUserId:', currUserId)
      console.log('updated users:', newUsers);
      setUsers(newUsers);
    })
  }, []);

  return (
    <View style={styles.container}>
      <Text style={{padding:'5%'}}>
        Hi, {displayName}! Say hello to your little friends:
      </Text>
      <View style={styles.listContainer}>
        <FlatList
          data={users.filter(u=>u.key!==currUserId)}
          renderItem={({item}) => {
            return (
              <View>
                <Text>{item.displayName}</Text>
              </View>
            );
          }}
        />
      </View>
      <Button
        onPress={async () => {
          await signOut(auth);
          navigation.navigate('Login');
        }}
      >
        Now sign out!
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    flex: 0.3,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default HomeScreen;