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
    ScrollView,
    Platform,
    Image,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import { LinearGradient }  from 'expo-linear-gradient';
import { AntDesign } from '@expo/vector-icons';

import { FIREBASE_AUTH, FIREBASE_DATABASE } from '../FirebaseConfig';
import { ref, onValue, query, orderByChild, equalTo, remove } from 'firebase/database';

import Taskbar from './Taskbar';

const Notification = ({ navigation }) => {    
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const notificationsRef = ref(FIREBASE_DATABASE, `notifications/${FIREBASE_AUTH.currentUser.uid}`);
    
        onValue(notificationsRef, (snapshot) => {
            let notificationPromises = [];
    
            snapshot.forEach((childSnapshot) => {
                const notificationKey = childSnapshot.key;
                const notification = childSnapshot.val();
                notificationPromises.push(new Promise((resolve) => {
                    const postRef = ref(FIREBASE_DATABASE, `posts/${notification.postId}`);
                    onValue(postRef, (postSnapshot) => {
                        const postKey = postSnapshot.key;
                        const postDetails = postSnapshot.val() || {};

                        const userRef = ref(FIREBASE_DATABASE, `usernames`);
                        const userQuery = query(userRef, orderByChild('uid'), equalTo(notification.triggeredById));

                        onValue(userQuery, (userSnapshot) => {
                            let username;
                            userSnapshot.forEach((userChild) => {
                                username = userChild.key;
                                return true;
                            });

                            const profilePictureRef = ref(FIREBASE_DATABASE, `profile_pictures/${notification.triggeredById}/photoURL`);
                            onValue(profilePictureRef, (profilePictureSnapshot) => {
                                let profileImageUrl = profilePictureSnapshot.exists() ? { uri: profilePictureSnapshot.val() } : require('../assets/images/default-profile.png');
                                resolve({
                                    id: notificationKey,
                                    ...notification,
                                    username: username,
                                    profileImageUrl: profileImageUrl,
                                    postDetails: {
                                        ...postDetails,
                                        id: postKey,
                                    },
                                });
                            }, { onlyOnce: true });
                        }, { onlyOnce: true });
                    }, { onlyOnce: true });
                }));
            });

            Promise.all(notificationPromises).then((fetchedNotifications) => {
                setNotifications(fetchedNotifications);
            });
        }, {
            onlyOnce: true
        });
    }, []);

    const handleNotificationPress = (notification) => {
        const notificationRef = ref(FIREBASE_DATABASE, `notifications/${FIREBASE_AUTH.currentUser.uid}/${notification.id}`);

        console.log('Notification ID:', notification.id);
        
        remove(notificationRef).then(() => {
            navigation.navigate('Comment', { 
                group: notification.postDetails.groupId, 
                postId: notification.postId,
                post: notification.postDetails
            });
        }).catch((error) => {
            console.error('Failed to remove notification:', error);
        });
    };

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
                            <ScrollView>
                                {notifications.length > 0 ? (
                                    notifications.map((notification, index) => (
                                        <TouchableOpacity
                                            key={`${notification.triggeredById}-${index}`}
                                            style={styles.textContainer}
                                            onPress={() => handleNotificationPress(notification)}
                                        >
                                            <View style={styles.profileContainer}>
                                                <Image 
                                                    source={notification.profileImageUrl}
                                                    style={styles.profileImage}
                                                />
                                                <View style={styles.userDetailsContainer}>
                                                    <Text style={styles.usernameText}>
                                                        {notification.username} commented to your post!
                                                    </Text>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    ))
                                ) : (
                                    <View style={styles.noNotificationsContainer}>
                                        <Text style={styles.noNotificationsText}>There are no notifications!</Text>
                                    </View>
                                )}
                            </ScrollView>                
                            <Taskbar navigation={navigation}/>
                        </LinearGradient>
                    </KeyboardAvoidingView>
                </TouchableWithoutFeedback>
            </SafeAreaView>
        </NavigationContainer>
    );
};

export default Notification;

const styles = StyleSheet.create({  
    container: {
        flex: 1,
    },
    gradientContainer: {
        flex: 1,
    },
    textContainer: {
        padding: 15,
        marginTop: 10,
        marginVertical: 5,
        marginHorizontal: 10,
        backgroundColor: 'white',
        borderRadius: 20,
        elevation: 2,
        position: 'relative',
    },
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    userDetailsContainer: {
        flexDirection: 'column',
        marginLeft: 10,
        flex: 1,
    },
    noNotificationsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    notificationItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    usernameText: {
        fontWeight: '500',
    },
    buttonText: {
        color: '#F9C4F0',
        textAlign: 'center',
        fontFamily: 'BubbleFont',
        fontWeight: 'bold',
    },
    postText: {
        fontWeight: '500',
    },
    noNotificationsText: {
        color: 'white',
        fontSize: 22,
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
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderColor: '#f3f2f1',
        borderWidth: 1,
    },
});