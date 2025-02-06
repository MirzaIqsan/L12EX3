import React, { useState, useEffect } from 'react';
import { StatusBar, Text, StyleSheet, View, ImageBackground } from 'react-native';
import { Audio } from 'expo-av';
import { Accelerometer } from 'expo-sensors';

export default function App() {
    const [mySound, setMySound] = useState();
    const [shakeDetected, setShakeDetected] = useState(false);
    const [isCooldown, setIsCooldown] = useState(false); // Cooldown state

    // Function to play sound without looping
    async function playSound() {
        if (isCooldown) return; // Prevent sound if in cooldown state

        try {
            const soundfile = require('./mar.wav'); // Your sound file
            const { sound } = await Audio.Sound.createAsync(soundfile, { shouldPlay: true });
            setMySound(sound);
            await sound.playAsync();  // Play sound once

            setIsCooldown(true);  // Start cooldown after playing sound

            // Set a cooldown of 500ms before the sound can play again
            setTimeout(() => {
                setIsCooldown(false);
            }, 500);
        } catch (error) {
            console.error('Error loading or playing sound:', error);
        }
    }

    useEffect(() => {
        const threshold = 1.5;

        const subscription = Accelerometer.addListener(({ x, y, z }) => {
            const totalMovement = Math.sqrt(x * x + y * y + z * z);
            if (totalMovement > threshold) {
                if (!shakeDetected) {
                    setShakeDetected(true);
                    playSound();  // Play sound once when shaking is detected
                }
            } else {
                setShakeDetected(false);  // Reset shakeDetected state when no shake
            }
        });

        return () => subscription.remove();
    }, [shakeDetected]);

    useEffect(() => {
        return mySound
            ? () => {
                mySound.unloadAsync();  // Clean up sound resources after playing
            }
            : undefined;
    }, [mySound]);

    return (
        <ImageBackground
            source={require('./maraca.jpg')}  // Replace with your image path
            style={styles.container}
        >
            <StatusBar />
            {shakeDetected && <Text style={styles.shakeText}>SHAKE</Text>}
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    shakeText: {
        fontSize: 50,
        fontWeight: 'bold',
        color: 'yellow',
    },
});
