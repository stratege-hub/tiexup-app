import React, { createContext, useCallback, useContext, useState } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const showNotification = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now() + Math.random();
        const notification = {
            id,
            message,
            type,
            duration,
            visible: true
        };

        setNotifications(prev => [...prev, notification]);

        // Auto-suppression après la durée spécifiée
        setTimeout(() => {
            hideNotification(id);
        }, duration);

        return id;
    }, []);

    const hideNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
    }, []);

    const clearAllNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    // Méthodes spécialisées pour différents types de notifications
    const showSuccess = useCallback((message, duration = 4000) => {
        return showNotification(message, 'success', duration);
    }, [showNotification]);

    const showError = useCallback((message, duration = 5000) => {
        return showNotification(message, 'error', duration);
    }, [showNotification]);

    const showWarning = useCallback((message, duration = 4000) => {
        return showNotification(message, 'warning', duration);
    }, [showNotification]);

    const showAlert = useCallback((message, duration = 6000) => {
        return showNotification(message, 'alert', duration);
    }, [showNotification]);

    const showInfo = useCallback((message, duration = 4000) => {
        return showNotification(message, 'info', duration);
    }, [showNotification]);

    const value = {
        notifications,
        showNotification,
        hideNotification,
        clearAllNotifications,
        showSuccess,
        showError,
        showWarning,
        showAlert,
        showInfo
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
