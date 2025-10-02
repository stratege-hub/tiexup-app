import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

export default function NotificationToast({ 
    visible, 
    message, 
    type = 'info', 
    duration = 4000, 
    onClose,
    onPress 
}) {
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(-100));

    useEffect(() => {
    if (visible) {
        // Animation d'entrée
        Animated.parallel([
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        })
        ]).start();

        // Auto-fermeture
        const timer = setTimeout(() => {
        handleClose();
        }, duration);

        return () => clearTimeout(timer);
    }
    }, [visible]);

    const handleClose = () => {
    Animated.parallel([
        Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
        })
    ]).start(() => {
        onClose?.();
    });
    };

    if (!visible) return null;

    const getIconAndColor = () => {
    switch (type) {
        case 'success':
        return { icon: 'checkmark-circle', color: '#4caf50' };
        case 'error':
        return { icon: 'close-circle', color: '#f44336' };
        case 'warning':
        return { icon: 'warning', color: '#ff9800' };
        case 'alert':
        return { icon: 'alert-circle', color: '#ff5722' };
        case 'info':
        default:
        return { icon: 'information-circle', color: '#2196f3' };
    }
    };

    const { icon, color } = getIconAndColor();

    return (
    <Animated.View 
        style={[
        styles.container,
        {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
        }
        ]}
    >
        <TouchableOpacity 
        style={[styles.toast, { borderLeftColor: color }]}
        onPress={onPress}
        activeOpacity={0.8}
        >
        <View style={styles.content}>
            <Ionicons name={icon} size={24} color={color} />
            <Text style={styles.message}>{message}</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={20} color="#666" />
            </TouchableOpacity>
        </View>
        </TouchableOpacity>
    </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
    position: 'absolute',
    top: 50,
    left: 15,
    right: 15,
    zIndex: 1000,
    },
    toast: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    },
    content: {
    flexDirection: 'row',
    alignItems: 'center',
    },
    message: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    },
    closeButton: {
    padding: 4,
    },
});
