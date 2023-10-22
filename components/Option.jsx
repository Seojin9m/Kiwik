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
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import { FIREBASE_AUTH, FIREBASE_DATABASE } from '../FirebaseConfig';
import { ref, push, onValue, query, equalTo, orderByChild } from 'firebase/database';

const Option = (props) => {
    const [posts, setPosts] = useState([]);
    const [selectedOption, setSelectedOption] = useState('Posts');
    const [postText, setPostText] = useState('');
    const [threadTitle, setThreadTitle] = useState('');
    const [threadSelected, setThreadSelected] = useState(true);

    useEffect(() => {
        if (selectedOption === 'Posts') {
            // Reference to Posts node
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
                setPosts(fetchedPosts);
            });

            // Clean up listener when component unmounts
            return () => unsubscribe();
        }
    }, [selectedOption, props.group]);

    const handleOptionClick = (option) => {
        setSelectedOption(option);
    }

    const handlePostImageUpload = () => {
        // Empty function for now
        console.log("Image upload triggered");
    }

    const handlePost = () => {
        try {
            const post = {
                userId: FIREBASE_AUTH.currentUser.uid,
                groupId: props.group,
                postText: postText,
                threadTitle: threadTitle,
                timestamp: new Date().toISOString(),
            }

            console.log('New post:', post);

            // Reference to storage node
            const postsRef = ref(FIREBASE_DATABASE, 'posts');

            // Push the post object to the database
            push(postsRef, post).then(() => {
                console.log("Post successfully added");
            }).catch((error) => {
                console.log("Error saving post: ", error);
            });
        } catch (error) {
            console.log("Error saving post: ", error);
        } finally {
            // Clear inputs after posting
            setPostText('');
            setThreadTitle('');
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"} 
                style={{ flex: 1 }}
            >
                <View style={styles.optionContainer}>
                    <TouchableOpacity onPress={() => handleOptionClick('Posts')}>
                        <Text style={[styles.option, selectedOption === 'Posts' && styles.selectedOption]}>Posts</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleOptionClick('Wiki')}>
                        <Text style={[styles.option, selectedOption === 'Wiki' && styles.selectedOption]}>Wiki</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleOptionClick('Media')}>
                        <Text style={[styles.option, selectedOption === 'Media' && styles.selectedOption]}>Media</Text>
                    </TouchableOpacity>
                </View>
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
                {selectedOption === 'Posts' && posts.map(post => (
                    <View key={post.id} style={styles.textContainer}>
                        <Text style={styles.postText}>{post.postText}</Text>
                    </View>
                ))}
                {selectedOption === 'Wiki' && <Text style={styles.displayOption}>Wiki here</Text>}
                {selectedOption === 'Media' && <Text style={styles.displayOption}>Media here</Text>}
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
    textContainer: {
        padding: 15,
        marginVertical: 5,
        marginHorizontal: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        elevation: 2,
    },
    optionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
        marginHorizontal: 20,
        padding: 10,
        backgroundColor: '#17E69C',
        borderRadius: 25,
        overflow: 'hidden',
    },
    threadPostContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        justifyContent: 'space-between',
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
        color: 'grey',
        fontSize: 16,
        fontFamily: 'BubbleFont',
        fontWeight: 'bold',
    },
    selectedOption: {
        padding: 10,
        fontSize: 16,
        color: 'white',
        fontFamily: 'BubbleFont',
        fontWeight: 'bold',
    },
    displayOption: {
        marginTop: 10,
        fontSize: 20,
        alignSelf: 'center',
    },
    postText: {
        fontFamily: 'BubbleFont',
        fontWeight: 'bold',
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontFamily: 'BubbleFont',
        fontWeight: 'bold',
    },
    buttonPost: {
        width: 60,
        alignItems: 'center',  
        justifyContent: 'center',  
        backgroundColor: '#17E69C',
        padding: 10,
        borderRadius: 5,
    },
    iconButton: {
        marginLeft: 10, 
    },
});