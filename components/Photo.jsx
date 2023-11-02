import { useState } from 'react';
import { 
    View, 
    StyleSheet, 
    Text,
    ActivityIndicator, 
    TouchableOpacity,
    TouchableWithoutFeedback, 
    Keyboard,
    Image,
    Platform,
} from 'react-native';

import { useNavigation, useFocusEffect, NavigationContainer } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

import { FIREBASE_AUTH, FIREBASE_DATABASE, FIREBASE_STORAGE } from '../FirebaseConfig';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ref as databaseRef, update } from 'firebase/database';

const Photo = () => {
    const navigation = useNavigation();
    const user = FIREBASE_AUTH.currentUser;

    const [photo, setPhoto] = useState(null);
    const [selectedPhoto, setSelectedPhoto] = useState('default');
    const [uploading, setUploading] = useState(false);

    // handle selection of image
    const handleSelectPhoto = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            alert('Permission to access camera roll is required.');
            return;
        }

        const pickerResult = await ImagePicker.launchImageLibraryAsync();
        if (pickerResult.canceled === true) {
            return;
        }

        setPhoto(pickerResult.assets[0].uri);
        setSelectedPhoto('upload')
    };

    // handlle upload of image
    const handleUploadPhoto = async () => {
        if (!photo) {
            alert('Please select a photo first.');
            return;
        }

        const filename = photo.substring(photo.lastIndexOf('/') + 1);
        const uploadUri = Platform.OS === 'ios' ? photo.replace('file://', '') : photo;
        const imageRef = storageRef(FIREBASE_STORAGE, `profile_pictures/${filename}`);
        setUploading(true);

        try {
            const response = await fetch(uploadUri);
            const blob = await response.blob();

            const snapshot = await uploadBytes(imageRef, blob);
            const downloadURL = await getDownloadURL(snapshot.ref);

            if (user) {
                const userImageRef = databaseRef(FIREBASE_DATABASE, `profile_pictures/${user.uid}`);
                await update(userImageRef, { photoURL: downloadURL });
    
                setPhoto(downloadURL);
                alert('Image uploaded successfully.');
            } else {
                alert('User not found. Please sign in.');
            }
        } catch (error) {
            console.log(error);
            alert('Image upload failed. Please try again.');
        } finally {
            setUploading(false);
            navigation.navigate('Front');
        }
    };

    // handle upload of default photo (this fucntion might not be needed, wil be updated soon)
    const handleUploadDefaultPhoto = async () => {
        if (user) {
            const userImageRef = databaseRef(FIREBASE_DATABASE, `users/${user.uid}`);
            await update(userImageRef, { photoURL: null });

            setPhoto(null);
            alert('Image uploaded successfully.');

            navigation.navigate('Front');
        } else {
            alert('User not found. Please sign in.');
        }
    };

    return (
        <NavigationContainer independent={true}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <Text style={styles.title}>Select or Upload Picture</Text>
                    <View style={styles.photoContainer}>
                        <TouchableOpacity onPress={() => setSelectedPhoto('default')}>
                            <Image 
                                source={require('../assets/images/default-profile.png')} 
                                style={[
                                    styles.profileImage, 
                                    selectedPhoto === 'default' && styles.profileBorder
                                ]}
                            />
                        </TouchableOpacity>
                        {photo && 
                            <TouchableOpacity onPress={() => setSelectedPhoto('upload')}>
                                <Image 
                                    source={{ uri: photo }} 
                                    style={[
                                        styles.profileImage, 
                                        selectedPhoto === 'upload' && styles.profileBorder
                                    ]}
                                />
                            </TouchableOpacity>
                        }
                        <TouchableOpacity 
                            style={styles.buttonAddPhoto} 
                            onPress={handleSelectPhoto}
                        >
                            <Text style={styles.buttonAddPhotoText}>+</Text>
                        </TouchableOpacity>      
                    </View>
                    {uploading ? (
                        <ActivityIndicator size="large" color="#17E69C" style={styles.activityIndicator}/>
                    ) : (
                        <TouchableOpacity 
                            style={styles.buttonSave} 
                            onPress={selectedPhoto === 'default' ? handleUploadDefaultPhoto : handleUploadPhoto}
                        >
                            <Text style={styles.buttonText}>Save</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </TouchableWithoutFeedback>
        </NavigationContainer>
    );
}

export default Photo;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    photoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    title: {
        color: '#17E69C',
        fontFamily: 'BubbleFont',
        fontSize: 30,   
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    button: {
        width: 130,
        alignItems: 'center',  
        justifyContent: 'center',  
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 5,
        alignSelf: 'center',  
        marginBottom: 10,    
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontFamily: 'BubbleFont',
        fontSize: 15,
        fontWeight: 'bold',
    },
    buttonAddPhotoText: {
        fontSize: 30,
        color: '#17E69C',
        textAlign: 'center',
        fontFamily: 'BubbleFont',
        fontWeight: 'bold',
    },
    buttonAddPhoto: {
        width: 70,
        height: 70,
        margin: 5,
        borderRadius: 40,
        backgroundColor: 'white', 
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10, 
    },
    buttonSave: {
        width: 80,
        marginTop: 40,
        alignItems: 'center',  
        justifyContent: 'center',  
        backgroundColor: '#17E69C',
        padding: 10,
        borderRadius: 5,
    },
    profileImage: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderColor: '#f3f2f1',
        borderWidth: 1,
        marginRight: 10, 
    },
    profileBorder: {
        borderRadius: 40,
        borderColor: '#17E69C',
        borderWidth: 2,
    },
    activityIndicator: {
        marginTop: 20
    },
});