import { useState } from 'react';
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
    Keyboard 
} from 'react-native';
import { LinearGradient }  from 'expo-linear-gradient';

import { FIREBASE_AUTH } from '../FirebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailFilled, setEmailFilled] = useState(false);

    const auth = FIREBASE_AUTH;

    const signIn = async () => {
        setLoading(true);

        try {
            const response = await signInWithEmailAndPassword(auth, email, password);
            console.log(response);
        } catch (error) {
            console.log(error);
            alert('Invalid email or password. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    const signUp = async () => {
        setLoading(true);

        try {
            const response = await createUserWithEmailAndPassword(auth, email, password);
            console.log(response);
        } catch (error) {
            console.log(error);
            alert('Register failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    }

    const handleEmailEndEditing = () => {
        setEmailFilled(true);
        Keyboard.dismiss();
    }

    const handlePasswordEndEditing = () => {
        if (emailFilled) signIn();
        Keyboard.dismiss();
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <LinearGradient
                colors={['rgb(9, 205, 202)', 'rgb(23, 230, 156)']}
                style={styles.container}
            >
                <KeyboardAvoidingView behavior="padding">
                    <ScrollView
                        style={{ backgroundColor: 'transparent' }}
                        contentContainerStyle={{flexGrow: 1}}
                        keyboardShouldPersistTaps='handled'
                    >
                        <Text style={styles.title}>Kiwik</Text>
                        <TextInput 
                            value={email}
                            style={styles.input} 
                            placeholder="Email" 
                            placeholderTextColor="gray"
                            autoCapitalize="none"
                            underlineColorAndroid="transparent"
                            autoCorrect={false}
                            onChangeText={(text) => setEmail(text)}
                            onEndEditing={handleEmailEndEditing}
                        ></TextInput>
                        <TextInput 
                            secureTextEntry={true}
                            value={password}
                            style={styles.input} 
                            placeholder="Password" 
                            placeholderTextColor="gray"
                            autoCapitalize="none"
                            onChangeText={(text) => setPassword(text)}
                            onEndEditing={handlePasswordEndEditing}
                        ></TextInput>
                        { loading ? (
                            <ActivityIndicator style={styles.loadingIndicator} size="large" color="#FFFFFF"/> 
                        ) : ( 
                            <> 
                                <TouchableOpacity style={[styles.button, styles.buttonSpace]} onPress={() => signIn()}>
                                    <Text style={styles.buttonText}>Login</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.button} onPress={() => signUp()}>
                                    <Text style={styles.buttonText}>Create Account</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </ScrollView>
                </KeyboardAvoidingView>
            </LinearGradient>
        </TouchableWithoutFeedback>
    )
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
        color: '#17E69C',
        textAlign: 'center',
        fontFamily: 'BubbleFont',
        fontWeight: 'bold',
    },
    loadingIndicator: {
        marginTop: 20,
    }
});