import { View, SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, AntDesign, MaterialIcons } from '@expo/vector-icons';

const Taskbar = () => {
    const handlePressAlarm = () => {
        // Empty function for now
        console.log("Alarm triggered");
    }

    const handlePressEdit = () => {
        // Empty function for now
        console.log("Edit triggered");
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
                </TouchableOpacity>     
                <TouchableOpacity onPress={handlePressEdit}>
                    <AntDesign name="addfolder" size={28} color="black" />
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
});