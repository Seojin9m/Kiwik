import { useEffect, useState  } from 'react';
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
import { NavigationContainer } from '@react-navigation/native';
import { LinearGradient }  from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { FIREBASE_AUTH } from '../FirebaseConfig';

const Front = ({ navigation }) => {
    const [query, setQuery] = useState('');

    const handleSearch = () => {
        // Empty function for now
        console.log("Search triggered with query: ", query);
    }

    return (
        <NavigationContainer independent={true}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <LinearGradient
                    colors={['rgb(9, 205, 202)', 'rgb(23, 230, 156)']}
                    style={styles.container}
                >   
                    <TouchableOpacity style={[styles.button, styles.buttonSpace]} onPress={() => FIREBASE_AUTH.signOut()}>
                        <Text style={styles.buttonText}>Sign Out</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Welcome</Text>
                    <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.input}
                            value={query}
                            onChangeText={setQuery}
                            placeholder="Search for an idol..."
                            placeholderTextColor="gray"
                        />
                        <TouchableOpacity style={styles.buttonSearch} onPress={handleSearch}>
                            <Ionicons name="ios-search" size={22} color="#17E69C"/>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.secondaryTitle}>Today's Idol</Text>
                </LinearGradient>
            </TouchableWithoutFeedback>
        </NavigationContainer>
    )
}

export default Front;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        marginTop: 60,
        marginLeft: -10,
    },
    title: {
        color: 'white',
        fontFamily: 'BubbleFont',
        fontSize: 50,   
        fontWeight: 'bold',
        position: 'absolute',
        left: 10, 
    },
    secondaryTitle: {
        color: 'white',
        fontFamily: 'BubbleFont',
        fontSize: 40,   
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 50,
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
    button: {
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
    buttonText: {
        color: '#17E69C',
        textAlign: 'center',
        fontFamily: 'BubbleFont',
        fontWeight: 'bold',
    },
    buttonSearch: {
        marginLeft: 0,
        padding: 10,
        backgroundColor: 'white',
        borderRadius: 5,
    }
});