import React from 'react';
import { StyleSheet, View } from 'react-native';
import NotificationToast from '../components/NotificationToast';
import { useNotifications } from '../contexts/NotificationContext';

export default function NotificationManager() {
    const { notifications, hideNotification } = useNotifications();

    return (
        <View style={styles.container} pointerEvents="box-none">
            {notifications.map((notification, index) => (
                <NotificationToast
                    key={notification.id}
                    visible={notification.visible}
                    message={notification.message}
                    type={notification.type}
                    duration={notification.duration}
                    onClose={() => hideNotification(notification.id)}
                    style={{
                        top: 50 + (index * 80), // Empiler les notifications
                    }}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
    },
});
