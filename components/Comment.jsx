import { useEffect, useState } from 'react';
import { 
    View, 
    SafeAreaView, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    TextInput,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Keyboard,
    ScrollView,
    Platform,
    Image,
    Alert,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import { LinearGradient }  from 'expo-linear-gradient';
import { FontAwesome, AntDesign, Feather, Ionicons} from '@expo/vector-icons';

import { FIREBASE_AUTH, FIREBASE_DATABASE } from '../FirebaseConfig';
import { ref, push, set, remove, onValue, query, equalTo, orderByChild } from 'firebase/database';

import Taskbar from './Taskbar';

const Comment = ({ navigation, route }) => {    
    const group = route.params.group;
    const postId = route.params.postId;
    const post = route.params.post;

    const [postUsername, setPostUsername] = useState('');
    const [postProfileImageUrl, setPostProfileImageUrl] = useState(null);

    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState([]);
    const [userDetails, setUserDetails] = useState({});

    useEffect(() => {
        const usernamesRef = ref(FIREBASE_DATABASE, 'usernames');
        const usernamesQuery = query(usernamesRef, orderByChild('uid'), equalTo(post.userId));

        const unsubscribe = onValue(usernamesQuery, (snapshot) => {
            snapshot.forEach((child) => {
                setPostUsername(child.key);
                return true;
            });
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const profilePictureRef = ref(FIREBASE_DATABASE, `profile_pictures/${post.userId}/photoURL`);

        const unsubscribe = onValue(profilePictureRef, (snapshot) => {
            setPostProfileImageUrl(snapshot.exists() ? { uri: snapshot.val() } : require('../assets/images/default-profile.png'));
        });

        return () => unsubscribe();
    }, []);
    

    useEffect(() => {
        // Reference to post database node
        const postRef = ref(FIREBASE_DATABASE, 'posts');
        const postsQuery = query(postRef, orderByChild('groupId'), equalTo(group));

        const unsubscribe = onValue(postsQuery, (snapshot) => {
            let fetchedPosts = [];
            let userDetailsFetchPromises = [];
            snapshot.forEach((childSnapshot) => {
                // Prepare promises to fetch user details
                userDetailsFetchPromises.push(new Promise((resolve) => {
                    const usernamesQuery = query(ref(FIREBASE_DATABASE, 'usernames'), orderByChild('uid'), equalTo(post.userId));
                    onValue(usernamesQuery, (usernameSnapshot) => {
                        let username;
                        usernameSnapshot.forEach((child) => {
                            username = child.key;
                            return true;
                        });

                        const profilePictureRef = ref(FIREBASE_DATABASE, `profile_pictures/${post.userId}/photoURL`);
                        onValue(profilePictureRef, (profilePictureSnapshot) => {
                            let profileImageUrl = profilePictureSnapshot.exists() ? { uri: profilePictureSnapshot.val() } : require('../assets/images/default-profile.png');
                            resolve({ userId: post.userId, username, profileImageUrl });
                        }, { onlyOnce: true });
                    }, { onlyOnce: true });
                }));
            });

            // Fetch all user details
            Promise.all(userDetailsFetchPromises).then((fetchedUserDetails) => {
                const userDetailsMap = fetchedUserDetails.reduce((acc, { userId, username, profileImageUrl }) => {
                    acc[userId] = {
                        username: username || 'Unknown',
                        profileImageUrl: profileImageUrl
                    };
                    return acc;
                }, {});

                setUserDetails(userDetailsMap);
            });
        });

        return () => unsubscribe();
    }, [group]);

    useEffect(() => {
        const commentsRef = ref(FIREBASE_DATABASE, `comments/${postId}`);
        
        const unsubscribe = onValue(commentsRef, (snapshot) => {
            const fetchComments = [];
            const userDetailsFetchPromises = [];
            const uniqueUserIds = new Set(); // To track unique userIds
    
            snapshot.forEach((childSnapshot) => {
                const comment = childSnapshot.val();
                comment.id = childSnapshot.key;
                fetchComments.push(comment);
    
                // Check if we already fetched or are fetching details for this userId
                if (!uniqueUserIds.has(comment.userId)) {
                    uniqueUserIds.add(comment.userId);
                    userDetailsFetchPromises.push(
                        fetchUserDetails(comment.userId)
                    );
                }
            });
        
            setComments(fetchComments);
    
            Promise.all(userDetailsFetchPromises).then((fetchedUserDetails) => {
                const newUserDetails = { ...userDetails };
                fetchedUserDetails.forEach(({ userId, username, profileImageUrl }) => {
                    newUserDetails[userId] = { username, profileImageUrl };
                });
    
                setUserDetails(newUserDetails);
            });
        });
    
        return () => unsubscribe();
    }, [postId]);

    const fetchUserDetails = (userId) => {
        return new Promise((resolve) => {
            // Query for the username based on the UID
            const usernamesQuery = query(ref(FIREBASE_DATABASE, 'usernames'), orderByChild('uid'), equalTo(userId));
    
            onValue(usernamesQuery, (snapshot) => {
                let username = 'Unknown';
                let profileImageUrl = require('../assets/images/default-profile.png');
    
                snapshot.forEach((childSnapshot) => {
                    username = childSnapshot.key;
                    return true;
                });
    
                // Fetch the profile picture URL using the UID
                const profilePictureRef = ref(FIREBASE_DATABASE, `profile_pictures/${userId}/photoURL`);
                onValue(profilePictureRef, (profilePictureSnapshot) => {
                    if (profilePictureSnapshot.exists()) {
                        profileImageUrl = { uri: profilePictureSnapshot.val() };
                    }
                    resolve({ userId, username, profileImageUrl });
                }, { onlyOnce: true });
            }, { onlyOnce: true });
        });
    };
    
    const handleComment = () => {
        if (commentText.trim() === '') {
            // Show alert if comment is empty
            Alert.alert(
                "Empty Comment",
                "Please enter a commnet before sending.",
                [{ text: "Confirm", onPress: () => console.log("OK Pressed") }]
            );
            
            return;
        }

        const newCommentRef = ref(FIREBASE_DATABASE, `comments/${postId}`);
        const newComment = {
            userId: FIREBASE_AUTH.currentUser.uid,
            commentText: commentText,
            timestamp: new Date().toISOString(),
        };

        // Push the comment object to database
        push(newCommentRef, newComment).then(() => {
            setCommentText('');
        }).catch((error) => {
            console.log("Error posting comment: ", error);
        });

        createNotification(postId, post.userId, FIREBASE_AUTH.currentUser.uid);
    };

    const handleCommentImageUpload = () => {
        // Empty function for now
        console.log("Image upload triggered");
    };

    const handleDeleteComment = (commentId) => {
        const commentRef = ref(FIREBASE_DATABASE, `comments/${postId}/${commentId}`);
        remove(commentRef)
            .then(() => {
                console.log("Comment deleted successfully");
                setComments(previousComments => previousComments.filter(comment => comment.id !== commentId));
            })
            .catch((error) => {
                console.log("Error deleting comment: ", error);
                Alert.alert(
                    "Error",
                    "There was a problem deleting the comment. Please try again later.",
                )
            });
    }

    const confirmDeleteComment = (commentId) => {
        Alert.alert(
            "Delete Comment",
            "Are you sure you want to delete this comment?",
            [
                {
                    text: "Cancel",
                    onPress: () => console.log("Deletion cancelled"),
                    style: "cancel"
                },
                {
                    text: "Delete",
                    onPress: () => handleDeleteComment(commentId),
                    style: "destructive"
                }
            ]
        );
    };

    const createNotification = (postId, postOwnerId, commentOwnerId) => {
        if (postOwnerId !== commentOwnerId) {
            const newNotificationRef = ref(FIREBASE_DATABASE, `notifications/${postOwnerId}`);
            const newNotification = {
                postId: postId,
                triggeredById: commentOwnerId,
                type: 'comment',
                read: false,
            };

            // Push the notification object to database
            push(newNotificationRef, newNotification).then(() => {
                console.log("Notification created successfully")
            }).catch((error) => {
                console.log("Error creating notification: ", error);
            });
        }
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}. ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        
        return formattedDate;
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
                                navigation.navigate('Group', { group: group });
                            }}>
                                <AntDesign name="arrowleft" size={20} style={styles.buttonText}/>
                            </TouchableOpacity>
                            <View style={styles.textContainer}>
                                <View style={styles.profileContainer}>
                                    <Image 
                                        source={postProfileImageUrl || require('../assets/images/default-profile.png')}
                                        style={styles.profileImage}
                                    />
                                    <View style={styles.userDetailsContainer}>
                                        <Text style={styles.usernameText}>
                                            {postUsername || 'Loading...'}
                                        </Text>
                                        <Text style={styles.timestampText}>{formatDate(post.timestamp)}</Text>
                                    </View>
                                </View>
                                <View style={styles.postContentContainer}>
                                    <View style={styles.postTextContainer}>
                                        <Text style={styles.postText}>{post.postText}</Text>
                                        {post.threadTitle && <Text style={styles.threadTitleText}>#{post.threadTitle}</Text>}
                                    </View>
                                </View>
                            </View>

                            {comments.map((comment) => (
                                <View key={comment.id} style={styles.commentContainer}>
                                    <View style={styles.profileContainer}>
                                        <Image
                                            source={userDetails[comment.userId]?.profileImageUrl || require('../assets/images/default-profile.png')}
                                            style={styles.profileImage}
                                        />
                                        <View style={styles.userDetailsContainer}>
                                            <Text style={styles.usernameText}>
                                                {userDetails[comment.userId]?.username || 'Loading...'}
                                            </Text>
                                            <Text style={styles.timestampText}>{formatDate(comment.timestamp)}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.commentContentContainer}>
                                        <Text style={styles.commentText}>{comment.commentText}</Text>
                                        {comment.userId === FIREBASE_AUTH.currentUser.uid && (
                                            <TouchableOpacity onPress={() => confirmDeleteComment(comment.id)} style={styles.trashIcon}>
                                                <Ionicons name="ios-trash-sharp" size={24} color="#FF7377" />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            ))}                          
                            <View style={styles.inputContainer}>
                                <TextInput
                                    value={commentText}
                                    style={styles.input} 
                                    onChangeText={(text) => setCommentText(text)}
                                    placeholder="Write a comment..."
                                    placeholderTextColor="gray"
                                    underlineColorAndroid="transparent"
                                />
                                <TouchableOpacity onPress={handleCommentImageUpload} style={styles.iconButton}>
                                    <FontAwesome name="image" size={24} color="grey"/>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.iconButton} onPress={handleComment}>
                                    <Feather name="send" size={24} color="grey"/>
                                </TouchableOpacity>
                            </View>
                            <Taskbar navigation={navigation}/>
                        </LinearGradient>
                    </KeyboardAvoidingView>
                </TouchableWithoutFeedback>
            </SafeAreaView>
        </NavigationContainer>
    );
}

export default Comment;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradientContainer: {
        flex: 1,
    },
    commentContainer: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 10,
        marginVertical: 5,
        marginHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84, 
        elevation: 5,
    },
    commentContentContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    inputContainer: {
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 5,
        paddingHorizontal: 5,
        position: 'absolute',
        bottom: 50,
        left: 0,
        right: 0,
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
    postContentContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    postTextContainer: {
        flex: 1,
    },
    input: {
        flex: 1, 
        fontFamily: 'BubbleFont',
        width: '80%',
        marginVertical: 5,
        marginLeft: 10,
        borderWidth: 0,
        borderRadius: 4,
        padding: 10,
        borderWidth: 1, 
        borderColor: 'grey', 
        borderRadius: 10, 
        backgroundColor: '#fff',
    },
    commentText: {
        marginTop: 5,
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        flex: 1,
    },
    buttonText: {
        color: '#F9C4F0',
        textAlign: 'center',
        fontFamily: 'BubbleFont',
        fontWeight: 'bold',
    },
    usernameText: {
        fontWeight: 'bold',
    },
    timestampText: {
        color: 'grey',
    },
    postText: {
        fontWeight: '500',
    },
    threadTitleText: {
        color: '#F9C4F0',
        fontWeight: '800',
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
    iconButton: {
        marginLeft: 10,
        marginHorizontal: 5,
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderColor: '#f3f2f1',
        borderWidth: 1,
    },
});