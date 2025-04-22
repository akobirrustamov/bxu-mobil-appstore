import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Button,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import RNPickerSelect from 'react-native-picker-select';

const TestInputs = () => {
    const [textInput, setTextInput] = useState('');
    const [password, setPassword] = useState('');
    const [imageUri, setImageUri] = useState('');
    const [audioUri, setAudioUri] = useState('');
    const [selectedValue, setSelectedValue] = useState('');

    // Image Picker
    const handleImagePick = async () => {
        console.log("hihihihihi")
        const options = { mediaType: 'photo' };
        console.log(options)
        await launchImageLibrary(options, response => {
            console.log("ssss")
            if (response.didCancel) {
                Alert.alert('Cancelled', 'Image selection was cancelled.');
            } else if (response.errorMessage) {
                Alert.alert('Error', response.errorMessage);
            } else {
                setImageUri(response.assets[0].uri);
                console.log('Image picked:', response.assets[0].uri);
            }
        });
    };

    // Audio Picker
    const handleAudioPick = async () => {
        const options = { mediaType: 'audio' };
        await launchImageLibrary(options, response => {
            if (response.didCancel) {
                Alert.alert('Cancelled', 'Audio selection was cancelled.');
            } else if (response.errorMessage) {
                Alert.alert('Error', response.errorMessage);
            } else {
                setAudioUri(response.assets[0].uri);
                console.log('Audio picked:', response.assets[0].uri);
            }
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Test Inputs</Text>

            {/* Text Input */}
            <Text style={styles.label}>Text Input:</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter text"
                value={textInput}
                onChangeText={setTextInput}
            />

            {/* Password Input */}
            <Text style={styles.label}>Password Input:</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            {/* Image Picker */}
            <TouchableOpacity style={styles.button} onPress={handleImagePick}>
                <Text style={styles.buttonText}>Pick an Image</Text>
            </TouchableOpacity>
            {imageUri ? <Image source={{ uri: imageUri }} style={styles.image} /> : null}

            {/* Audio Picker */}
            <TouchableOpacity style={styles.button} onPress={handleAudioPick}>
                <Text style={styles.buttonText}>Pick Audio</Text>
            </TouchableOpacity>
            {audioUri ? <Text style={styles.fileText}>Audio Selected</Text> : null}

            {/* Select Dropdown */}
            <Text style={styles.label}>Select Option:</Text>
            <RNPickerSelect
                onValueChange={value => setSelectedValue(value)}
                items={[
                    { label: 'Option 1', value: 'option1' },
                    { label: 'Option 2', value: 'option2' },
                    { label: 'Option 3', value: 'option3' },
                ]}
                style={pickerSelectStyles}
                placeholder={{ label: 'Select an option...', value: null }}
            />
            <Text style={styles.fileText}>Selected: {selectedValue}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginTop: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
    },
    button: {
        backgroundColor: '#4CAF50',
        padding: 10,
        borderRadius: 5,
        marginVertical: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
    fileText: {
        marginVertical: 5,
        fontSize: 14,
        color: '#555',
    },
    image: {
        width: 100,
        height: 100,
        resizeMode: 'contain',
        marginVertical: 10,
    },
});

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        fontSize: 16,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        color: 'black',
        paddingRight: 30,
    },
    inputAndroid: {
        fontSize: 16,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 0.5,
        borderColor: '#ccc',
        borderRadius: 8,
        color: 'black',
        paddingRight: 30,
    },
});

export default TestInputs;
