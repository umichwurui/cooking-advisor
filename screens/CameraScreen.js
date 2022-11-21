import { Button } from '@rneui/themed';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { subscribeToUsers, getFBAuth, signOutFB } from '../data/DB';

const auth = getFBAuth();

function CameraScreen({navigation}) {
  
  const currentUser = useSelector(state => {
    const currentUserId = auth.currentUser.uid;
    return state.users.find(u => u.uid === currentUserId);
  })

  const dispatch = useDispatch();

  useEffect(()=>{
    subscribeToUsers(dispatch);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.navHeader}>
        <Button
          type='clear'
          size='sm'
          onPress={async () => {
            navigation.goBack();
          }}
        >
          {'< Back Home'}
        </Button>
      </View>

      <Text style={{padding:'5%'}}>
        Hi, {currentUser?.displayName}! Time to take a picture!
      </Text>
      <View style={styles.listContainer}>
      </View>
      <Button>
        Snap!
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
  navHeader: {
    flex: 0.05,
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: '100%',
    padding: '5%',
    //backgroundColor: 'green'
  },
  listContainer: {
    flex: 0.8,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default CameraScreen;