import { useEffect, useState  } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import { FIREBASE_AUTH } from '../FirebaseConfig';

const Front = ({ navigation }) => {

    return (
        <NavigationContainer independent={true}>
            <View style={styles.container}> 
                <Button onPress={() => FIREBASE_AUTH.signOut()} title="Sign Out"/>
            </View>
        </NavigationContainer>
    )
}

export default Front;

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        flex: 1,
        justifyContent: 'center',
    }
});