import { useEffect, useState } from 'react';
import { 
    View, 
    SafeAreaView, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Image,
    Alert,
} from 'react-native';
import YouTubePlayer from 'react-native-youtube-iframe';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient }  from 'expo-linear-gradient';
import { FontAwesome, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { GROUP_MEDIA } from './constants';

import { FIREBASE_AUTH, FIREBASE_DATABASE, FIREBASE_STORAGE } from '../FirebaseConfig';
import { ref, push, set, remove, onValue, query, equalTo, orderByChild } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

const Option = (props) => {
    const navigation = props.navigation;

    const [selectedOption, setSelectedOption] = useState('Posts');
    const [userDetails, setUserDetails] = useState({});
    const [posts, setPosts] = useState([]);
    const [image, setImage] = useState(null);
    const [postText, setPostText] = useState('');
    const [threadTitle, setThreadTitle] = useState('');
    const [threadSelected, setThreadSelected] = useState(true);
    const [groupDescription, setGroupDescription] = useState('');

    useEffect(() => {
        if (selectedOption === 'Posts') {
            // Reference to post database node
            const postRef = ref(FIREBASE_DATABASE, 'posts');
            const postsQuery = query(postRef, orderByChild('groupId'), equalTo(props.group));
    
            const unsubscribe = onValue(postsQuery, (snapshot) => {
                let fetchedPosts = [];
                let userDetailsFetchPromises = [];
                snapshot.forEach((childSnapshot) => {
                    const post = childSnapshot.val();
                    post.id = childSnapshot.key;
                    fetchedPosts.push(post);
    
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
                                let profileImageUrl = profilePictureSnapshot.exists() 
                                    ? { uri: profilePictureSnapshot.val() } 
                                    : require('../assets/images/default-profile.png');
                                    
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
    
                // Reverse the order of posts and set to state
                setPosts(fetchedPosts.reverse());
            });
    
            return () => unsubscribe();
        }
    }, [selectedOption, props.group]);

    useEffect(() => {
        if (selectedOption === 'Posts') {
            // Reference to post database node
            const postRef = ref(FIREBASE_DATABASE, 'posts');

            // Query to filter by groupId
            const postsQuery = query(postRef, orderByChild('groupId'), equalTo(props.group));

            // Listening for data changes
            const unsubscribe = onValue(postsQuery, (snapshot) => {
                const fetchedPosts = [];
                snapshot.forEach((childSnapshot) => {
                    const post = childSnapshot.val();
                    post.id = childSnapshot.key;
                    fetchedPosts.push(post);
                });
                setPosts(fetchedPosts.reverse());
            });

            // Clean up listener when component unmounts
            return () => unsubscribe();
        }
    }, [selectedOption, props.group]);

    useEffect(() => {
        const groupDescriptionRef = ref(FIREBASE_DATABASE, `group-description/${props.group}`);

        onValue(groupDescriptionRef, (snapshot) => {
            if (snapshot.exists()) {
                setGroupDescription(snapshot.val());
            } else {
                console.log('Group description not found!');
            }
        }, { onlyOnce: true });
    }, []);

    useEffect(() => {
        (async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                alert('Sorry, we need media library permissions to make this work!');
            }
        })();
    }, []);

    const handleOptionClick = (option) => {
        setSelectedOption(option);
    };

    const handlePostImageUpload = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
    
        console.log('Image upload result: ', result);
    
        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handlePost = async () => {
        const newPostRef = push(ref(FIREBASE_DATABASE, 'posts'));
        try {
            let imageUrl = '';
            if (image) {
                const response = await fetch(image);
                const blob = await response.blob();
                const imageRef = storageRef(FIREBASE_STORAGE, `post_images/${newPostRef.key}`);
                const snapshot = await uploadBytes(imageRef, blob);
                imageUrl = await getDownloadURL(snapshot.ref);
            }
    
            const post = {
                userId: FIREBASE_AUTH.currentUser.uid,
                groupId: props.group,
                postText: postText || '',
                threadTitle: threadTitle || '',
                timestamp: new Date().toISOString(),
                imageUrl: imageUrl,
            };
    
            console.log('New post:', post);

            await set(newPostRef, post);
            console.log("Post successfully added");

            setPostText('');
            setThreadTitle('');
            setImage(null);
        } catch (error) {
            console.log("Error saving post: ", error);
        }
    };

    const handleDeletePost = (postId) => {
        // Reference to post database node
        const postRef = ref(FIREBASE_DATABASE, `posts/${postId}`);

        remove(postRef).then(() => {
            console.log("Post successfully deleted");

            setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
        }).catch ((error) => {
            console.log("Error deleting post: ", error);
        });
    };

    const confirmDeletePost = (postId) => {
        Alert.alert(
            "Delete Post",
            "Are you sure you want to delete this post?",
            [
                {
                    text: "Cancel",
                    onPress: () => console.log("Post deletion cancelled"),
                    style: "cancel"
                },
                {
                    text: "Delete",
                    onPress: () => handleDeletePost(postId),
                    style: "destructive"
                }
            ]
        );
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}. ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        
        return formattedDate;
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"} 
                style={{ flex: 1 }}
            >
                <LinearGradient
                    colors={['#77ABE6', '#F9C4F0']}
                    style={styles.optionContainer}
                >
                    <TouchableOpacity onPress={() => handleOptionClick('Posts')}>
                        <Text style={[styles.option, selectedOption === 'Posts' && styles.selectedOption]}>Posts</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleOptionClick('Wiki')}>
                        <Text style={[styles.option, selectedOption === 'Wiki' && styles.selectedOption]}>Wiki</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleOptionClick('Media')}>
                        <Text style={[styles.option, selectedOption === 'Media' && styles.selectedOption]}>Media</Text>
                    </TouchableOpacity>
                </LinearGradient>
                {selectedOption === 'Posts' && (
                    <View>
                        <View style={styles.inputContainer}>
                            <TextInput 
                                value={postText}
                                style={styles.input} 
                                placeholder="Create Post" 
                                placeholderTextColor="gray"
                                underlineColorAndroid="transparent"
                                onChangeText={(text) => setPostText(text)}
                            />
                            <TouchableOpacity onPress={handlePostImageUpload} style={styles.iconButton}>
                                <FontAwesome name="image" size={24} color="grey"/>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setThreadSelected(!threadSelected)} style={styles.iconButton}>
                                <FontAwesome name="link" size={24} color="grey"/>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                <View style={styles.threadPostContainer}>
                    {threadSelected && selectedOption === 'Posts' && (
                        <TextInput
                            value={threadTitle}
                            style={styles.threadInput} 
                            placeholder="Thread Title" 
                            placeholderTextColor="gray"
                            underlineColorAndroid="transparent"
                            onChangeText={(text) => setThreadTitle(text)}
                        />
                    )}
                    {!threadSelected && selectedOption === 'Posts' && <View style={styles.threadInputPlaceholder}></View>}
                    {selectedOption === 'Posts' && (
                        <View>
                            <TouchableOpacity style={styles.buttonPost} onPress={handlePost}>
                                <Text style={styles.buttonText}>Post</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
                <ScrollView>
                    {selectedOption === 'Posts' && posts.map(post => (
                        <View key={post.id} style={styles.textContainer}>
                            <View style={styles.profileContainer}>
                                <Image 
                                    source={userDetails[post.userId]?.profileImageUrl} 
                                    style={styles.profileImage}
                                />
                                <View style={styles.userDetailsContainer}>
                                    <Text style={styles.usernameText}>
                                        {userDetails[post.userId]?.username}
                                    </Text>
                                    <Text style={styles.timestampText}>{formatDate(post.timestamp)}</Text>
                                    <TouchableOpacity onPress={() => {
                                        navigation.navigate('Comment', {
                                            group: props.group, 
                                            postId: post.id,
                                            post: post
                                        })
                                    }}>
                                        <MaterialCommunityIcons name="comment-text" size={24} color="#77ABE6" style={styles.iconComment} />
                                    </TouchableOpacity>
                                    {post.userId === FIREBASE_AUTH.currentUser.uid && (
                                        <TouchableOpacity onPress={() => confirmDeletePost(post.id)}>
                                            <Ionicons name="ios-trash-sharp" size={24} color="#FF7377"style={styles.iconDelete} />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                            <View style={styles.postContentContainer}>
                                {post.imageUrl ? (
                                    <Image
                                        source={{ uri: post.imageUrl }}
                                        style={styles.postImage}
                                        resizeMode="cover"
                                    />
                                ) : null}
                                <View style={styles.postTextContainer}>
                                    <Text style={styles.postText}>{post.postText}</Text>
                                    {post.threadTitle && 
                                        <Text style={styles.threadTitleText}>#{post.threadTitle}</Text>
                                    }
                                </View>
                            </View>
                        </View>
                    ))}
                </ScrollView>
                {selectedOption === 'Wiki' && 
                    <View style={styles.wikiContainer}>
                        <Text style={styles.wikiText}>
                            {groupDescription}
                        </Text>
                    </View>
                }
                {selectedOption === 'Media' && 
                    <View style={styles.mediaContainer}>
                        <Text style={styles.mediaText}>
                            Popular 
                        </Text>
                        {GROUP_MEDIA[props.group] && Object.keys(GROUP_MEDIA[props.group]).map((index) => (
                            <YouTubePlayer
                                height={205}
                                key={index}
                                videoId={GROUP_MEDIA[props.group][index]}
                            />
                        ))}
                    </View>
                }
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

export default Option;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
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
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
    },
    postTextContainer: {
        flex: 1,
    },
    textContainer: {
        padding: 15,
        marginVertical: 5,
        marginHorizontal: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        elevation: 2,
        position: 'relative',
    },
    optionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
        marginHorizontal: 20,
        padding: 10,
        backgroundColor: '#241F55',
        borderRadius: 25,
        overflow: 'hidden',
    },
    threadPostContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        justifyContent: 'space-between',
    },
    wikiContainer: {
        flex: 1,
        marginVertical: 20,
        marginHorizontal: 20,
    },
    mediaContainer: {
        flex: 1,
        marginVertical: 20,
        marginHorizontal: 20,
    },
    input: {
        flex: 1, 
        fontFamily: 'BubbleFont',
        width: '80%',
        marginVertical: 5,
        borderWidth: 0,
        borderRadius: 4,
        padding: 10,
        backgroundColor: '#fff',
    },
    threadInput: {
        fontFamily: 'BubbleFont',
        width: '80%',
        marginVertical: 5,
        marginHorizontal: 0,
        borderWidth: 0,
        borderRadius: 4,
        padding: 10,
        backgroundColor: '#fff',
    },
    threadInputPlaceholder: {
        flex: 1,
        height: 36.5,
        marginVertical: 5,
    },
    option: {
        padding: 10,
        color: '#E0E0E0',
        fontSize: 16,
        fontFamily: 'BubbleFont',
        fontWeight: 'bold',
    },
    selectedOption: {
        padding: 10,
        color: 'white',
        fontFamily: 'BubbleFont',
        fontSize: 16,
        fontWeight: 'bold',
    },
    displayOption: {
        marginTop: 10,
        fontSize: 20,
        alignSelf: 'center',
    },
    postText: {
        fontWeight: '500',
    },
    threadTitleText: {
        color: '#F9C4F0',
        fontWeight: '800',
    },
    usernameText: {
        fontWeight: 'bold',
    },
    timestampText: {
        color: 'grey',
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontFamily: 'BubbleFont',
        fontWeight: 'bold',
    },
    wikiText: {
        color: 'black',
        fontFamily: 'BubbleFont',
        fontSize: 16,
    },
    mediaText: {
        color: '#77ABE6',
        fontFamily: 'BubbleFont',
        fontSize: 22,
        textAlign: 'center',
        marginBottom: 20,
    },
    buttonPost: {
        width: 60,
        alignItems: 'center',  
        justifyContent: 'center',  
        backgroundColor: '#77ABE6',
        padding: 10,
        borderRadius: 5,
    },
    iconButton: {
        marginLeft: 10, 
    },
    iconComment: {
        position: 'absolute',
        top: -30,
        right: 0,
    },
    iconDelete: {
        position: 'absolute',
        top: -32,
        right: 35,
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderColor: '#f3f2f1',
        borderWidth: 1,
    },
    postImage: {
        width: '90%',
        height: 200, 
        borderRadius: 10, 
        marginTop: 10, 
        marginBottom: 10,
    },
});