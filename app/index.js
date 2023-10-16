import { useEffect, useState  } from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import AppLoading from 'expo-app-loading';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { FIREBASE_AUTH } from '../FirebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

import Login from '../components/Login.jsx';
import Front from '../components/Front.jsx';

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
        return <AppLoading/>;
    }
    
    return (
        <NavigationContainer independent={true}>
            <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}> 
            { user ? (
                <Stack.Screen name="Front" component={Front} options={{ headerShown: false }}/>
            ) : (
                <Stack.Screen name="Login" component={Login} options={{ headerShown: false }}/>
            )}
            </Stack.Navigator>
        </NavigationContainer>
    )
}

export default Home;