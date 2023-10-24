import { useEffect, useState  } from 'react';
import { SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import AppLoading from 'expo-app-loading';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { FIREBASE_AUTH } from '../FirebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

import Login from '../components/Login.jsx';
import SignUp from '../components/SignUp';
import Front from '../components/Front.jsx';
import Group from '../components/Group.jsx';

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
        <SafeAreaView style={{ flex: 1 }}>
            <NavigationContainer independent={true}>
                <Stack.Navigator initialRouteName={user ? "Front" : "Login"} screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="Login" component={Login}/>
                    <Stack.Screen name="Front" component={Front}/>
                    <Stack.Screen name="Group" component={Group}/>
                    <Stack.Screen name="SignUp" component={SignUp}/>
                </Stack.Navigator>
            </NavigationContainer>
        </SafeAreaView>
    );
}

export default Home;