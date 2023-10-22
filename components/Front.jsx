import { useEffect, useState, useRef  } from 'react';
import { 
    View, 
    StyleSheet, 
    Text, 
    TextInput, 
    Image,
    TouchableOpacity,
    TouchableWithoutFeedback, 
    Keyboard,
} from 'react-native';
import { useNavigation, NavigationContainer } from '@react-navigation/native';
import { LinearGradient }  from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import Taskbar from './Taskbar';

import { FIREBASE_AUTH } from '../FirebaseConfig';

const Front = () => {
    const navigation = useNavigation();

    const [query, setQuery] = useState('');
    const [groups, setGroups] = useState(['LE SSERAFIM', 'aespa', 'NewJeans', 'IVE', 'NMIXX', 'STAYC']);

    const textInputRef = useRef(null);

    const handleSearch = () => {
        // Empty function for now
        console.log("Search triggered with query: ", query);
    };

    const handleAddGroup = () => {
        if (textInputRef.current) {
            textInputRef.current.focus();
        }
    };

    const groupLogos = {
        'LE SSERAFIM': require('../assets/logos/lesserafim-logo.png'),
        'aespa': require('../assets/logos/aespa-logo.png'),
        'NewJeans': require('../assets/logos/newjeans-logo.png'),
        'IVE': require('../assets/logos/ive-logo.png'),
        'NMIXX': require('../assets/logos/nmixx-logo.png'),
        'STAYC': require('../assets/logos/stayc-logo.png'),
        // ... add more as needed
    }

    const getGroupLogo = (groupName) => {
        return groupLogos[groupName] || null;
    }

    return (
        <NavigationContainer independent={true}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <LinearGradient
                    colors={['rgb(9, 205, 202)', 'rgb(23, 230, 156)']}
                    style={styles.container}
                >   
                    <TouchableOpacity style={styles.buttonSignOut} onPress={async () => {
                        await FIREBASE_AUTH.signOut();
                        navigation.navigate('Login');
                    }}>
                        <Text style={styles.buttonText}>Sign Out</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>KIWIK</Text>
                    <View style={styles.searchContainer}>
                        <TextInput
                            ref={textInputRef}
                            style={styles.input}
                            value={query}
                            onChangeText={setQuery}
                            onSubmitEditing={handleSearch} 
                            placeholder="Search for a group..."
                            placeholderTextColor="gray"
                        />
                        <TouchableOpacity style={styles.buttonSearch} onPress={handleSearch}>
                            <Ionicons name="ios-search" size={22} color="#17E69C"/>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.secondaryTitle}>Your Groups</Text>
                    <View style={styles.gridContainer}>
                        {groups.map((group, index) => (
                            <View>
                                <TouchableOpacity key={index} style={styles.imageButton} onPress={() => {navigation.navigate('Group', { group: group })}}>
                                    <Image source={getGroupLogo(group)} style={styles.image}/>
                                </TouchableOpacity>
                                <Text style={styles.groupName}>{group}</Text>
                            </View>
                        ))}
                        <TouchableOpacity style={styles.buttonAddGroup} onPress={handleAddGroup}>
                            <Text style={styles.buttonAddGroupText}>+</Text>
                        </TouchableOpacity>
                    </View>
                    <Taskbar/>
                </LinearGradient>
            </TouchableWithoutFeedback>
        </NavigationContainer>
    );
}

export default Front;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        marginTop: 50,
        marginLeft: -10,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyConent: 'flex-start',
        marginLeft: 15,
    },
    title: {
        color: 'white',
        fontFamily: 'BubbleFont',
        fontSize: 35,   
        fontWeight: 'bold',
        position: 'absolute',
        top: 10,
        left: 10, 
    },
    secondaryTitle: {
        color: 'white',
        fontFamily: 'BubbleFont',
        fontSize: 35,   
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 40,
        marginBottom: 20, 
    },
    input: {
        flex: 1,
        fontFamily: 'BubbleFont',
        fontSize: 20,
        width: '80%',
        marginVertical: 5,
        marginHorizontal: 10,
        borderWidth: 0,
        borderRadius: 4,
        padding: 10,
        backgroundColor: '#fff',
    },
    buttonText: {
        color: '#17E69C',
        textAlign: 'center',
        fontFamily: 'BubbleFont',
        fontWeight: 'bold',
    },
    buttonAddGroupText: {
        fontSize: 30,
        color: '#17E69C',
        textAlign: 'center',
        fontFamily: 'BubbleFont',
        fontWeight: 'bold',
    },
    buttonSignOut: {
        width: 80,
        alignItems: 'center',  
        justifyContent: 'center',  
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 5,
        position: 'absolute',
        top: 10,
        left: 300,
    },
    buttonSearch: {
        marginLeft: 0,
        padding: 10,
        backgroundColor: 'white',
        borderRadius: 5,
    },
    buttonAddGroup: {
        width: 80,
        height: 80,
        margin: 5,
        borderRadius: 40,
        backgroundColor: 'white', 
        alignItems: 'center',
        justifyContent: 'center',
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
    }
});