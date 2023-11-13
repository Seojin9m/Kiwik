import { useEffect, useState  } from 'react';
import { View, StyleSheet, ActivityIndicator, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { FIREBASE_AUTH } from '../FirebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

import Login from '../components/Login.jsx';
import SignUp from '../components/SignUp';
import Front from '../components/Front.jsx';
import Group from '../components/Group.jsx';
import Comment from '../components/Comment.jsx';
import Photo from '../components/Photo';

const Stack = createNativeStackNavigator();

const Home = () => {
    const [fontsLoaded] = useFonts({
        'BubbleFont': require('../assets/fonts/BubbleFont.ttf'),
    });
    const [user, setUser] = useState(null);

    useEffect(() => {
        onAuthStateChanged(FIREBASE_AUTH, (user) => {
            console.log('user', user);
            setUser(user);
        });
    }, []);

    if (!fontsLoaded) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="dark-content"/>
                <ActivityIndicator size="large" color="#77ABE6" />
            </View>
        )
    }
    
    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content"/>
            <NavigationContainer independent={true}>
                <Stack.Navigator 
                    initialRouteName={user ? "Front" : "Login"}
                    screenOptions={{ headerShown: false }}
                >
                    <Stack.Screen name="Login" component={Login}/>
                    <Stack.Screen name="Front" component={Front}/>
                    <Stack.Screen name="Group" component={Group}/>
                    <Stack.Screen name="Comment" component={Comment}/>
                    <Stack.Screen name="SignUp" component={SignUp}/>
                    <Stack.Screen name="Photo" component={Photo}/>
                </Stack.Navigator>
            </NavigationContainer>
        </View>
    );
}

export default Home;

const styles = StyleSheet.create({  
    container: {
        flex: 1,
    },
});