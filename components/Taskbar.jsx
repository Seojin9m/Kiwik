import { useEffect, useState } from 'react';
import { View, SafeAreaView, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons, AntDesign, MaterialIcons } from '@expo/vector-icons';
import { FIREBASE_AUTH, FIREBASE_DATABASE } from '../FirebaseConfig';
import { ref, onValue } from 'firebase/database';

const Taskbar = (props) => {
    const navigation = props.navigation;
    const [notificationCount, setNotificationCount] = useState(0);

    useEffect(() => {
        const notificationRef = ref(FIREBASE_DATABASE, `notifications/${FIREBASE_AUTH.currentUser.uid}`);

        const unsubscribe = onValue(notificationRef, (snapshot) => {
            let unreadCount = 0;
            snapshot.forEach((childSnapshot) => {
                if (!childSnapshot.val().read) {
                    unreadCount++;
                }
            });
            setNotificationCount(unreadCount);
        });

        return () => unsubscribe();
    }, []);

    const handlePressAlarm = () => {
        navigation.navigate('Notification');
    }

    const handlePressHome = () => {
        navigation.navigate('Front');
    }

    const handlePressProfile = () => {
        // Empty function for now
        console.log("Profile triggered");
    }

    return (
        <SafeAreaView style={styles.safeContainer}>
            <View style={styles.container}>
                <TouchableOpacity onPress={handlePressAlarm}>
                    <Ionicons name="ios-notifications-outline" size={28} color="black"/>
                    {notificationCount > 0 && (
                        <View style={styles.notificationBadge}>
                            <Text style={styles.notificationText}>{notificationCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>     
                <TouchableOpacity onPress={handlePressHome}>
                    <AntDesign name="home" size={28} color="black" />
                </TouchableOpacity>
                <TouchableOpacity onPress={handlePressProfile}>
                    <MaterialIcons name="person-outline" size={28} color="black" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

export default Taskbar;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: 10,
        paddingTop: 10, 
    },
    safeContainer: {
        backgroundColor: 'white',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    notificationBadge: {
        position: 'absolute',
        right: -4,
        top: -2,
        backgroundColor: 'red',
        borderRadius: 9,
        width: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
});