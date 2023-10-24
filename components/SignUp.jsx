import { useEffect, useState, useCallback, useLayoutEffect } from 'react';
import { 
    View, 
    StyleSheet, 
    Text, 
    TextInput, 
    ActivityIndicator, 
    Button,
    ScrollView, 
    KeyboardAvoidingView, 
    TouchableOpacity,
    TouchableWithoutFeedback, 
    Keyboard,
} from 'react-native';

import { useNavigation, useFocusEffect, NavigationContainer } from '@react-navigation/native';
import { FIREBASE_APP, FIREBASE_AUTH, FIREBASE_DATABASE } from '../FirebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set, get, child } from 'firebase/database';

import { AntDesign } from '@expo/vector-icons';

const SignUp = () => {
    const auth = FIREBASE_AUTH;
    const navigation = useNavigation();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });
    }, [navigation]);

    useFocusEffect(
        useCallback(() => {
            // Reset username, email, password states every load
            setUsername('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
        }, [])
    );

    const signUp = async () => {
        setIsLoading(true);

        if (!username || !email || !password || !confirmPassword) {
            alert('Please fill in all fields.');
            return;
        }
    
        if (password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }

        const userRef = ref(FIREBASE_DATABASE, 'usernames/' + username);
        get(userRef).then((snapshot) => {
            if (snapshot.exists()) {
                alert('A user with that username already exists.');
            } else {
                // Proceed with creating account if username does not exist
                createUser();
            }
        }).catch((error) => {
            console.log('Error checking username', error);
            alert('Error signing up. Please try again.');
        });
    };

    const createUser = async () => {
        try {
            const response = await createUserWithEmailAndPassword(auth, email, password);
            console.log(response);

            // Store username after successful account registration
            const userId = response.user.uid;
            set(ref(FIREBASE_DATABASE, 'usernames/' + username), { uid: userId });

            navigation.navigate('Front');
        } catch (error) {
            console.log('Error with creating user', error);

            if (error.code === 'auth/email-already-in-use') {
                alert('An account with this email already exists.');
            } else {
                alert('Registration failed: ' + error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <NavigationContainer independent={true}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <TouchableOpacity style={styles.buttonGoBack} onPress={() => {
                        navigation.navigate('Login');
                    }}>
                        <AntDesign name="arrowleft" size={20} style={styles.buttonText}/>
                    </TouchableOpacity>
                    <Text style={styles.title}>Kiwik</Text>
                    <TextInput 
                        value={username}
                        style={styles.input} 
                        placeholder="Username" 
                        placeholderTextColor="lightgray"
                        autoCapitalize="none"
                        underlineColorAndroid="transparent"
                        autoCorrect={false}
                        onChangeText={(text) => setUsername(text)}
                    ></TextInput>
                    <TextInput 
                        value={email}
                        style={styles.input} 
                        placeholder="Email" 
                        placeholderTextColor="lightgray"
                        autoCapitalize="none"
                        underlineColorAndroid="transparent"
                        autoCorrect={false}
                        onChangeText={(text) => setEmail(text)}
                    ></TextInput>
                    <TextInput 
                        secureTextEntry={true}
                        value={password}
                        style={styles.input} 
                        placeholder="Password" 
                        placeholderTextColor="lightgray"
                        autoCapitalize="none"
                        onChangeText={(text) => setPassword(text)}
                    ></TextInput>
                    <TextInput 
                        secureTextEntry={true}
                        value={confirmPassword}
                        style={styles.input} 
                        placeholder="Confirm password" 
                        placeholderTextColor="lightgray"
                        autoCapitalize="none"
                        onChangeText={(text) => setConfirmPassword(text)}
                    ></TextInput>
                    <TouchableOpacity style={styles.button} onPress={signUp}>
                        <Text style={styles.buttonText}>Create Account</Text>
                    </TouchableOpacity>
                    {isLoading && <ActivityIndicator size="large" color="#17E69C" style={styles.activityIndicator}/>}
                </View>
            </TouchableWithoutFeedback>
        </NavigationContainer>
    );
}

export default SignUp;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        color: '#17E69C',
        fontFamily: 'BubbleFont',
        fontSize: 40,   
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    input: {
        fontFamily: 'BubbleFont',
        fontSize: 15,
        width: '80%',
        marginVertical: 5,
        marginHorizontal: 10,
        borderWidth: 0,
        borderRadius: 4,
        padding: 10,
        backgroundColor: '#fff',
    },
    button: {
        width: 130,
        alignItems: 'center',  
        justifyContent: 'center',  
        backgroundColor: '#17E69C',
        padding: 10,
        borderRadius: 5,
        alignSelf: 'center',  
        marginTop: 20,
        marginBottom: 10,    
    },
    buttonGoBack: {
        width: 50,
        alignItems: 'center',  
        justifyContent: 'center',  
        backgroundColor: '#17E69C',
        padding: 10,
        borderRadius: 5,
        position: 'absolute',
        top: 10,
        left: 330,
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontFamily: 'BubbleFont',
        fontWeight: 'bold',
    },
    activityIndicator: {
        marginTop: 20
    },
});