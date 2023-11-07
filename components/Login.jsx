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
import { LinearGradient }  from 'expo-linear-gradient';

import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { FIREBASE_AUTH, FIREBASE_DATABASE } from '../FirebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ref, set, get, child } from 'firebase/database';

const Login = () => {
    const auth = FIREBASE_AUTH;
    const navigation = useNavigation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailFilled, setEmailFilled] = useState(false);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });
    }, [navigation]);

    useFocusEffect(
        useCallback(() => {
            // Reset email and password states every time
            setEmail('');
            setPassword('');
        }, [])
    );

    const signIn = async () => {
        setLoading(true);

        try {
            const response = await signInWithEmailAndPassword(auth, email, password);
            console.log(response);

            navigation.navigate('Front');
        } catch (error) {
            console.log(error);
            alert('Invalid email or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <LinearGradient
                colors={['rgb(79, 146, 223)', 'rgb(249, 196, 243)']}
                style={styles.container}
            >
                <KeyboardAvoidingView behavior="padding">
                    <Text style={styles.title}>Kiwik</Text>
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
                    { loading ? (
                        <ActivityIndicator style={styles.loadingIndicator} size="large" color="#FFFFFF"/> 
                    ) : ( 
                        <> 
                            <TouchableOpacity style={[styles.button, styles.buttonSpace]} onPress={() => signIn()}>
                                <Text style={styles.buttonText}>Login</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('SignUp')}>
                                <Text style={styles.buttonText}>Create Account</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </KeyboardAvoidingView>
            </LinearGradient>
        </TouchableWithoutFeedback>
    );
}

export default Login;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    input: {
        fontFamily: 'BubbleFont',
        width: '80%',
        marginVertical: 5,
        marginHorizontal: 40,
        borderWidth: 0,
        borderRadius: 4,
        padding: 10,
        backgroundColor: '#fff',
    },
    title: {
        color: 'white',
        fontFamily: 'BubbleFont',
        fontSize: 50,   
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20, 
    },
    buttonSpace: {
        marginTop: 20,
    },
    button: {
        width: 130,
        alignItems: 'center',  
        justifyContent: 'center',  
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 5,
        alignSelf: 'center',  
        marginBottom: 10,    
    },
    buttonText: {
        color: '#77ABE6',
        textAlign: 'center',
        fontFamily: 'BubbleFont',
        fontWeight: 'bold',
    },
    loadingIndicator: {
        marginTop: 20,
    }
});