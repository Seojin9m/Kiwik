import { useEffect, useState } from 'react';
import { 
    View, 
    SafeAreaView, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Keyboard,
    Platform,
    Image,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import { LinearGradient }  from 'expo-linear-gradient';
import { FontAwesome, AntDesign } from '@expo/vector-icons';

import { FIREBASE_AUTH, FIREBASE_DATABASE } from '../FirebaseConfig';
import { ref, onValue, query, orderByChild, equalTo } from 'firebase/database';

import Taskbar from './Taskbar';

const Profile = ({ navigation }) => {   
    const [username, setUsername] = useState('');
    const [profileImageUrl, setProfileImageUrl] = useState('');

    useEffect(() => {
        // Initialize profile image with a default image
        setProfileImageUrl(require('../assets/images/default-profile.png'));

        const userRef = ref(FIREBASE_DATABASE, 'usernames');
        const userQuery = query(userRef, orderByChild('uid'), equalTo(FIREBASE_AUTH.currentUser.uid));
        onValue(userQuery, (snapshot) => {
            if (snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
                    setUsername(childSnapshot.key);
                    return true;
                });
            }
        }, {
            onlyOnce: true
        });

        const profilePictureRef = ref(FIREBASE_DATABASE, `profile_pictures/${FIREBASE_AUTH.currentUser.uid}/photoURL`);
        onValue(profilePictureRef, (snapshot) => {
            if (snapshot.exists() && snapshot.val()) {
                setProfileImageUrl(snapshot.val());
            } else {
                setProfileImageUrl(require('../assets/images/default-profile.png'));
            }
        }, {
            onlyOnce: true
        });
    }, []);

    return (
        <NavigationContainer independent={true}>
            <SafeAreaView style={styles.container}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <KeyboardAvoidingView 
                        behavior={Platform.OS === "ios" ? "padding" : "height"} 
                        style={{ flex: 1 }}
                    >
                        <LinearGradient
                            colors={['#77ABE6', '#F9C4F0']}
                            style={styles.gradientContainer}
                        >
                            <TouchableOpacity style={styles.buttonGoBack} onPress={() => {
                                navigation.navigate('Front');
                            }}>
                                <AntDesign name="arrowleft" size={20} style={styles.buttonText}/>
                            </TouchableOpacity>
                            <Image source={{ uri: profileImageUrl }} style={styles.profileImage}/>
                            <Text style={styles.usernameText}>{username}</Text>
                            <View style={styles.socialMediaContainer}>
                                <View style={styles.iconBackground}>
                                    <TouchableOpacity>
                                        <FontAwesome name="twitter" size={30} color="white"/>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.iconBackground}>
                                <TouchableOpacity>
                                        <FontAwesome name="instagram" size={30} color="white"/>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.iconBackground}>
                                <TouchableOpacity>
                                        <FontAwesome name="facebook" size={30} color="white"/>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <Taskbar navigation={navigation}/>
                        </LinearGradient>
                    </KeyboardAvoidingView>
                </TouchableWithoutFeedback>
            </SafeAreaView>
        </NavigationContainer>
    );
};

export default Profile;

const styles = StyleSheet.create({  
    container: {
        flex: 1,
    },
    gradientContainer: {
        flex: 1,
    },
    socialMediaContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        position: 'absolute',
        bottom: 100, 
        left: 0,
        right: 0,
    },
    iconBackground: {
        width: 50, 
        height: 50, 
        borderRadius: 25,
        backgroundColor: '#77ABE6',
        justifyContent: 'center', 
        alignItems: 'center',
        marginHorizontal: -80,
    },
    profileImage: {
        width: 100, 
        height: 100, 
        borderRadius: 50, 
        alignSelf: 'center',
        marginTop: 20,
    },
    usernameText: {
        color: 'white',
        textAlign: 'center',
        fontFamily: 'BubbleFont',
        fontWeight: 'bold',
        fontSize: 20,
        marginTop: 10,
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontFamily: 'BubbleFont',
        fontWeight: 'bold',
    },
    buttonGoBack: {
        width: 50,
        alignItems: 'center',  
        justifyContent: 'center',
        padding: 10,
        borderRadius: 5,
        position: 'absolute',
        top: 10,
        left: 330,
        zIndex: 5,
    },
});