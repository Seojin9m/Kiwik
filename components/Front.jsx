import { useEffect, useState  } from 'react';
import { 
    View, 
    StyleSheet, 
    Text, 
    TextInput, 
    Image,
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

    const handleCreateEdit = () => {
        // Empty function for now
        console.log("Create/Edit triggered");
    }

    const handleSearch = () => {
        // Empty function for now
        console.log("Search triggered with query: ", query);
    }

    const handleReadMore = () => {
        // Empty function for now
        console.log("See more triggered");
    }

    return (
        <NavigationContainer independent={true}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <LinearGradient
                    colors={['rgb(9, 205, 202)', 'rgb(23, 230, 156)']}
                    style={styles.container}
                >   
                    <TouchableOpacity style={styles.buttonCreateEdit} onPress={handleCreateEdit}>
                        <Text style={styles.buttonText}>Create/Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.buttonSignOut} onPress={() => FIREBASE_AUTH.signOut()}>
                        <Text style={styles.buttonText}>Sign Out</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>KIWIK</Text>
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
                    <Text style={styles.secondaryTitle}>Recently Edited!</Text>
                    <View style={styles.imageContainer}>
                        <View style={styles.imageBox}>
                            <Image 
                                source={require('../assets/images/kimchaewon.png')} 
                                style={styles.image} 
                                resizeMode="cover"
                            />
                        </View>
                    </View>
                    <View style={styles.tableContainer}>
                        <View style={styles.row}>
                            <View style={styles.cellWrapper}>
                                <Text style={styles.cellLabel}>Name</Text>
                                <Text style={styles.cellData}>Kim Chae Won</Text>
                            </View>
                        </View>
                        <View style={styles.row}>
                            <View style={styles.cellWrapper}>
                                <Text style={styles.cellLabel}>Birth</Text>
                                <Text style={styles.cellData}>August 1, 2000 (23)</Text>
                            </View>
                        </View>
                        <View style={styles.row}>
                            <View style={styles.cellWrapper}>
                                <Text style={styles.cellLabel}>Nationality</Text>
                                <Text style={styles.cellData}>South Korea&nbsp;🇰🇷</Text>
                            </View>
                        </View>
                        <View style={styles.row}>
                            <View style={styles.cellWrapper}>
                                <Text style={styles.cellLabel}>Group</Text>
                                <Text style={styles.cellData}>LE SSERAFIM</Text>
                            </View>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.buttonReadMore} onPress={handleReadMore}>
                        <Text style={styles.buttonText}>Read More</Text>
                    </TouchableOpacity>
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
        marginTop: 50,
        marginLeft: -10,
    },
    imageContainer: {
        width: 200,
        height: 200,
        alignItems: 'center',
        alignSelf: 'center', 
        justifyContent: 'center',
        overflow: 'hidden',
        backgroundColor: '#AFEEEE',
        borderRadius: 20,
        padding: 20,
    },
    tableContainer: {
        marginTop: 15,
    },
    row: {
        width: '80%',
        alignSelf: 'center',
        marginBottom: 5,
    },
    cellWrapper: {
        flexDirection: 'row',
        borderRadius: 10,
        overflow: 'hidden',
    },
    cellLabel: {
        flex: 1,
        color: '#17E69C',
        fontFamily: 'BubbleFont',
        fontWeight: 'bold',
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: 'white',
    },
    cellData: {
        flex: 1,
        color: 'gray',
        fontFamily: 'BubbleFont',
        fontWeight: 'bold',
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: '#AFEEEE',
    },
    imageBox: {
        width: 180,
        height: 180,
        alignItems: 'center',
        alignSelf: 'center', 
        justifyContent: 'center',
        overflow: 'hidden',
        borderRadius: 20,
    },
    title: {
        color: 'white',
        fontFamily: 'BubbleFont',
        fontSize: 30,   
        fontWeight: 'bold',
        position: 'absolute',
        top: 10,
        left: 10, 
    },
    secondaryTitle: {
        color: 'white',
        fontFamily: 'BubbleFont',
        fontSize: 30,   
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
    buttonCreateEdit: {
        width: 95,
        alignItems: 'center',  
        justifyContent: 'center',  
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 5,
        position: 'absolute',
        top: 10,
        left: 195,
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
    buttonReadMore: {
        width: 90,
        alignItems: 'center',  
        alignSelf: 'center', 
        justifyContent: 'center',  
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    image: {
        width: '150%',
        height: '150%',
    }
});