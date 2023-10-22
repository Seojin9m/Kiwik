import { useEffect, useState } from 'react';
import { 
    View, 
    StyleSheet, 
    Text, 
    TextInput, 
    FlatList,
    Image,
    ActivityIndicator, 
    Button,
    ScrollView, 
    KeyboardAvoidingView, 
    TouchableOpacity,
    TouchableWithoutFeedback, 
    Keyboard,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import { LinearGradient }  from 'expo-linear-gradient';
import { AntDesign } from '@expo/vector-icons';
import Option from './Option';

// import firebase here

import Taskbar from './Taskbar';

const Group = ({ navigation, route }) => {
    const [group, setGroup] = useState(null);

    const groupImages = {
        'LE SSERAFIM': require('../assets/images/lesserafim-group.png'),
        'aespa': require('../assets/images/aespa-group.png'),
        'NewJeans': require('../assets/images/newjeans-group.png'),
        'IVE': require('../assets/images/ive-group.png'),
        'NMIXX': require('../assets/images/nmixx-group.png'),
        'STAYC': require('../assets/images/stayc-group.png'),
        // ... add more as needed
    }

    useEffect(() => {
        const group = route.params.group;
        setGroup(group);

        // Fetch group data from firebase here
    }, [route.params.group]);

    const getGroupImages = (group) => {
        return groupImages[group] || null;
    }

    return (
        <NavigationContainer independent={true}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                {group ? (
                    <View style={styles.container}>
                        <Image 
                            source={getGroupImages(group)} 
                            style={styles.imageWallpaper}
                        />
                        <LinearGradient
                            colors={['transparent', 'transparent', '#f5f5f5']}
                            locations={[0, 0.65, 1]}
                            style={styles.gradient}
                        />
                        <Text style={styles.title}>
                            {group}
                        </Text>
                        <TouchableOpacity style={styles.buttonGoBack} onPress={() => {
                            navigation.navigate('Front');
                        }}>
                            <AntDesign name="arrowleft" size={20} style={styles.buttonText}/>
                        </TouchableOpacity>
                        <Option group={group}/>
                        <Taskbar/>
                    </View>
                ) : (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#17E69C" />
                    </View>
                )}
            </TouchableWithoutFeedback>
        </NavigationContainer>
    );
}

export default Group;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        color: 'white',
        fontSize: 35,   
        fontWeight: '900',
        textAlign: 'center',
        marginTop: 320,
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
        color: 'white',
        textAlign: 'center',
        fontFamily: 'BubbleFont',
        fontWeight: 'bold',
    },
    buttonGoBack: {
        width: 50,
        alignItems: 'center',  
        justifyContent: 'center',  
        backgroundColor: '#17E69C',
        padding: 10,
        borderRadius: 5,
        position: 'absolute',
        top: 10,
        left: 330,
    },
    imageWallpaper: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '50%',
        width: '100%',
        resizeMode: 'cover',
    },
    gradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '50%', 
        width: '100%', 
    },
});