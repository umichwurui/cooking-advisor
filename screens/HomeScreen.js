import { Button } from '@rneui/themed';
import { View, Text, StyleSheet } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { getApps, initializeApp } from 'firebase/app';
import { firebaseConfig } from '../Secrets';

let app;
const apps = getApps();

if (apps.length == 0) { 
  app = initializeApp(firebaseConfig);
} else {
  app = apps[0];
}

const auth = getAuth(app);

function HomeScreen({navigation}) {
  return (
    <View style={styles.container}>
      <Text>
        You're signed in!
      </Text>
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
    backgroundColor: 'pink'
  }
});

export default HomeScreen;