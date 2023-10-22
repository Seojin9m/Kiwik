import { useState } from 'react';
import { View, SafeAreaView, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const Option = (props) => {
    const [selectedOption, setSelectedOption] = useState('Posts');
    const [postText, setPostText] = useState('');
    const [threadTitle, setThreadTitle] = useState('');
    const [threadSelected, setThreadSelected] = useState(true);

    const handleOptionClick = (option) => {
        setSelectedOption(option);
    }

    const handlePostImageUpload = () => {
        // Empty function for now
        console.log("Image upload triggered");
    }

    const handlePost = () => {
        // Empty function for now
        console.log("Post:", postText, "Thread:", threadTitle, "for group:", props.group);
    }

    return (
        <SafeAreaView style={styles.container}>
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
                    <TouchableOpacity style={styles.buttonPost} onPress={handlePost}>
                        <Text style={styles.buttonText}>Post</Text>
                    </TouchableOpacity>
                )}
            </View>
            {selectedOption === 'Wiki' && <Text style={styles.displayOption}>Wiki here</Text>}
            {selectedOption === 'Media' && <Text style={styles.displayOption}>Media here</Text>}
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