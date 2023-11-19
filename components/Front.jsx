import { useEffect, useState, useRef  } from 'react';
import { 
    View, 
    StyleSheet, 
    Text, 
    TextInput, 
    Image,
    TouchableOpacity,
    TouchableWithoutFeedback, 
    KeyboardAvoidingView,
    Keyboard,
} from 'react-native';
import { useNavigation, NavigationContainer } from '@react-navigation/native';
import { Alert } from 'react-native';
import { LinearGradient }  from 'expo-linear-gradient';
import { AntDesign, FontAwesome } from '@expo/vector-icons';

import Taskbar from './Taskbar';
import { GROUPS, GROUP_LOGOS, NO_GROUP } from './constants';

import { FIREBASE_AUTH, FIREBASE_DATABASE } from '../FirebaseConfig';
import { getDatabase, ref, set, get, onValue, child } from 'firebase/database';

const Front = () => {
    const navigation = useNavigation();

    const userId = FIREBASE_AUTH.currentUser.uid;
    const [query, setQuery] = useState('');
    const [groups, setGroups] = useState(GROUPS);
    const [userGroups, setUserGroups] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const textInputRef = useRef(null);

    const groupLogos = GROUP_LOGOS;
    const defaultGroupImage = NO_GROUP.image;

    useEffect(() => {
        if (query) {
            setSuggestions(groups.filter((group) => group.toLowerCase().includes(query.toLowerCase())));
        } else {
            setSuggestions([]);
        }
    }, [query, groups]);

    useEffect(() => {
        const db = getDatabase();
        const userGroupsRef = ref(db, `groups/${userId}`);
    
        const unsubscribe = onValue(userGroupsRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const fetchedGroups = Object.keys(data).filter(key => data[key] === true);
                setUserGroups(fetchedGroups);
            } else {
                setUserGroups(['No Groups']);
                console.log('No groups found for user.')
            }
        }, {
            onlyOnce: false
        });
    
        return () => unsubscribe();
    }, [userId]);

    const handleAddGroup = () => {
        if (!query) {
            alert('Please enter a group name.');
            return;
        }
    
        if (groups.includes(query)) {
            Alert.alert(
                "Add Group",
                `Are you sure you want to add ${query} to your groups?`,
                [
                    {
                        text: "Confirm",
                        onPress: () => {
                            const db = getDatabase();
                            const userGroupsRef = ref(db, `groups/${userId}`);
    
                            get(child(userGroupsRef, query)).then((snapshot) => {
                                if (snapshot.exists()) {
                                    alert('Group already added.');
                                } else {
                                    set(ref(db, `groups/${userId}/${query}`), true)
                                        .then(() => {
                                            console.log('Group added to Firebase database');
                                        })
                                        .catch((error) => {
                                            console.error('Error adding group to Firebase database', error);
                                        });
                                }
                            }).catch((error) => {
                                console.error('Error checking group in Firebase database', error);
                            });
                        }
                    },
                    {
                        text: "Cancel",
                        style: "cancel"
                    },
                ]
            );
        } else {
            alert('This group does not exist.');
        }
    };

    const handleSuggestionClick = (groupName, event) => {
        event.stopPropagation();
        setSuggestions([]);
        setQuery(groupName);
    };

    const dismissSuggestions = () => {
        setSuggestions([]);
    };

    const getGroupLogo = (groupName) => {
        return groupLogos[groupName] || null;
    };

    return (
        <NavigationContainer independent={true}>
            <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); dismissSuggestions(); }}>
                    <KeyboardAvoidingView 
                        behavior={Platform.OS === "ios" ? "padding" : "height"} 
                        style={{ flex: 1 }}
                    >
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>Kiwik</Text>
                        <TouchableOpacity style={styles.buttonSignOut} onPress={async () => {
                            await FIREBASE_AUTH.signOut();
                            navigation.navigate('Login');
                        }}>
                            <FontAwesome name="sign-out" size={24} color="black"/>
                        </TouchableOpacity>
                    </View>
                    <LinearGradient
                        colors={['rgb(79, 146, 223)', 'rgb(249, 196, 243)']}
                        style={styles.container}
                    >   
                        <View style={styles.gridContainer}>
                            {userGroups[0] === 'No Groups' ? (
                                <View style={styles.defaultGroupContainer}>
                                    <Image source={defaultGroupImage} style={styles.defaultGroupImage}/>
                                    <Text style={styles.defaultGroupText}>You have no groups yet!</Text>
                                </View>
                            ) : userGroups.length > 0 ? (
                                userGroups.map((group) => (
                                    <View key={group}> 
                                        <TouchableOpacity style={styles.imageButton} onPress={() => {navigation.navigate('Group', { group: group })}}>
                                            <Image source={getGroupLogo(group)} style={styles.image}/>
                                        </TouchableOpacity>
                                        <Text style={styles.groupName}>{group}</Text>
                                    </View>
                                ))
                            ) : null} 
                        </View>
                        <View style={styles.searchContainer}>
                            <TextInput
                                ref={textInputRef}
                                style={styles.input}
                                value={query}
                                onChangeText={setQuery}
                                placeholder="Search for a group..."
                                placeholderTextColor="grey"
                            />
                            <TouchableOpacity style={styles.buttonAddGroup} onPress={handleAddGroup}>
                                <AntDesign name="addusergroup" size={24} color="black" />
                            </TouchableOpacity>
                            {suggestions.length > 0 && (
                                <View style={styles.suggestionContainer}>
                                    {[...suggestions].reverse().map((suggestion) => (    
                                        <TouchableOpacity
                                            key={suggestion}
                                            onPress={(event) => handleSuggestionClick(suggestion, event)}
                                            style={styles.suggestion}
                                        >
                                            <Text style={styles.suggestionText}>{suggestion}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>
                        <Taskbar navigation={navigation}/>
                    </LinearGradient>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </NavigationContainer>
    );
}

export default Front;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    titleContainer: {
        flex: 1,
        backgroundColor: 'white',
        marginBottom: -670,
    },
    searchContainer: {
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 5,
        position: 'absolute',
        bottom: 50,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyConent: 'flex-start',
        marginLeft: 15,
        marginTop: 20,
    },
    suggestionContainer: {
        position: 'absolute',
        bottom: 60,
        left: 10,
        right: 10,
        zIndex: 10,
        backgroundColor: 'white',
        borderRadius: 4,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    defaultGroupContainer: {
        flex: 1,
        alignItems: 'center',   
    },
    title: {
        color: '#77ABE6',
        fontFamily: 'BubbleFont',
        fontSize: 30,   
        fontWeight: 'bold',
        textAlign: 'center',
    },
    input: {
        flex: 1,
        fontFamily: 'BubbleFont',
        fontSize: 15,
        width: '80%',
        marginHorizontal: 10,
        borderWidth: 0,
        borderRadius: 4,
        padding: 10,
        borderWidth: 1, 
        borderColor: 'grey', 
        borderRadius: 10, 
        backgroundColor: '#fff',
    },
    suggestion: {
        padding: 10,
    },
    suggestionText: {
        color: 'grey',
        fontFamily: 'BubbleFont',
        fontSize: 15,
    },
    buttonText: {
        color: '#77ABE6',
        textAlign: 'center',
        fontFamily: 'BubbleFont',
        fontWeight: 'bold',
    },
    defaultGroupText: {
        color: 'white',
        fontFamily: 'BubbleFont',
        fontSize: 20,
    },
    buttonSignOut: {
        width: 80,
        top: -30,
        left: 350,
    },
    buttonAddGroup: {
        marginLeft: 0,
        padding: 7,
        backgroundColor: 'white',
        borderRadius: 5,
    },
    groupName: {
        color: 'white',
        fontSize: 12,
        fontWeight: '900',
        textAlign: 'center',
        marginTop: 2.5,
        marginBottom: 10,
    },
    imageButton: {
        width: 80,
        height: 80,
        margin: 5,
        borderRadius: 40,
        overflow: 'hidden',
    },
    image: {
        width: '100%', 
        height: '100%',
        resizeMode: 'contain', 
    },
    defaultGroupImage: {
        marginVertical: 10,
    },
});