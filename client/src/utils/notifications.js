import { LocalNotifications } from '@capacitor/local-notifications';

// Check if we're running in Capacitor (mobile) or browser
const isCapacitor = () => {
    return window.Capacitor !== undefined;
};

// Request notification permissions
export const requestNotificationPermission = async () => {
    if (isCapacitor()) {
        try {
            const result = await LocalNotifications.requestPermissions();
            if (result.display === 'granted') {
                // Create High Priority Channel for Android
                await LocalNotifications.createChannel({
                    id: 'urgent',
                    name: 'Urgent Notifications',
                    description: 'High priority notifications for timers and reminders',
                    importance: 5, // High
                    visibility: 1, // Public
                    sound: 'default_ringtone.mp3', // or default
                    vibration: true
                });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return false;
        }
    } else {
        // Browser fallback - use Web Notifications API
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }
        return false;
    }
};

// Check if notifications are enabled
export const checkNotificationPermission = async () => {
    if (isCapacitor()) {
        try {
            const result = await LocalNotifications.checkPermissions();
            return result.display === 'granted';
        } catch (error) {
            return false;
        }
    } else {
        if ('Notification' in window) {
            return Notification.permission === 'granted';
        }
        return false;
    }
};

// Send immediate notification
export const sendNotification = async (title, body, options = {}) => {
    const hasPermission = await checkNotificationPermission();

    if (!hasPermission) {
        const granted = await requestNotificationPermission();
        if (!granted) {
            console.warn('Notification permission not granted');
            return false;
        }
    }

    if (isCapacitor()) {
        try {
            await LocalNotifications.schedule({
                notifications: [
                    {
                        title,
                        body,
                        id: Date.now(),
                        channelId: 'urgent', // Use High Priority Channel
                        sound: options.sound || 'default',
                        smallIcon: options.smallIcon || 'ic_stat_icon_config_sample',
                        largeIcon: options.largeIcon || 'ic_launcher',
                        vibrate: options.vibrate !== false,
                        extra: options.extra || {}
                    }
                ]
            });
            return true;
        } catch (error) {
            console.error('Error sending notification:', error);
            return false;
        }
    } else {
        // Browser fallback
        try {
            const notification = new Notification(title, {
                body,
                icon: '/vite.svg',
                vibrate: [200, 100, 200],
                tag: options.tag || 'default',
                requireInteraction: options.requireInteraction || false
            });

            // Play sound if we're in browser
            if (options.playSound) {
                playNotificationSound();
            }

            return true;
        } catch (error) {
            console.error('Error sending browser notification:', error);
            return false;
        }
    }
};

// Schedule a notification for a specific time
export const scheduleNotification = async (title, body, scheduledAt, options = {}) => {
    const hasPermission = await checkNotificationPermission();

    if (!hasPermission) {
        const granted = await requestNotificationPermission();
        if (!granted) return false;
    }

    // Ensure the date is valid and in the future
    const scheduleDate = new Date(scheduledAt);
    if (isNaN(scheduleDate.getTime())) {
        console.error('Invalid date provided to scheduleNotification');
        return false;
    }

    if (scheduleDate.getTime() <= Date.now()) {
        console.warn('Cannot schedule notification in the past');
        return false;
    }

    if (isCapacitor()) {
        try {
            // Android IDs must be 32-bit integers
            const notificationId = typeof options.id === 'number'
                ? options.id % 2147483647
                : Math.floor(Math.random() * 2147483647);

            await LocalNotifications.schedule({
                notifications: [
                    {
                        title,
                        body,
                        id: notificationId,
                        schedule: { at: scheduleDate },
                        channelId: 'urgent', // Use High Priority Channel
                        sound: options.sound || 'default',
                        actionTypeId: '',
                        extra: options.extra || {}
                    }
                ]
            });
            console.log(`Scheduled native notification: "${title}" at ${scheduleDate.toLocaleString()}`);
            return true;
        } catch (error) {
            console.error('Error scheduling native notification:', error);
            return false;
        }
    } else {
        // Browser fallback
        const scheduledNotifications = JSON.parse(localStorage.getItem('scheduled_notifications') || '[]');
        scheduledNotifications.push({
            id: options.id || Date.now(),
            title,
            body,
            scheduledAt: scheduleDate.getTime(),
            options
        });
        localStorage.setItem('scheduled_notifications', JSON.stringify(scheduledNotifications));
        console.log(`Scheduled browser fallback notification: "${title}" at ${scheduleDate.toLocaleString()}`);
        return true;
    }
};

// Cancel a scheduled notification
export const cancelNotification = async (notificationId) => {
    if (isCapacitor()) {
        try {
            await LocalNotifications.cancel({ notifications: [{ id: notificationId }] });
            return true;
        } catch (error) {
            console.error('Error canceling notification:', error);
            return false;
        }
    } else {
        // Remove from localStorage
        const scheduledNotifications = JSON.parse(localStorage.getItem('scheduled_notifications') || '[]');
        const filtered = scheduledNotifications.filter(n => n.id !== notificationId);
        localStorage.setItem('scheduled_notifications', JSON.stringify(filtered));
        return true;
    }
};

// Play notification sound (for browser/web)
export const playNotificationSound = (type = 'default') => {
    try {
        // Create audio context for more reliable sound playback
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Create a pleasant notification tone
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        if (type === 'pomodoro') {
            // Pomodoro complete - uplifting melody
            playPomodoroMelody(audioContext);
        } else if (type === 'reminder') {
            // Reminder - gentle ping
            playReminderSound(audioContext);
        } else {
            // Default notification sound
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.4);
        }

        return true;
    } catch (error) {
        console.error('Error playing notification sound:', error);
        return false;
    }
};

// Play Pomodoro completion melody - celebratory tune
const playPomodoroMelody = (audioContext) => {
    const notes = [
        { freq: 523.25, start: 0, duration: 0.15 },     // C5
        { freq: 659.25, start: 0.15, duration: 0.15 },  // E5
        { freq: 783.99, start: 0.3, duration: 0.15 },   // G5
        { freq: 1046.50, start: 0.45, duration: 0.3 },  // C6 (hold)
        { freq: 783.99, start: 0.8, duration: 0.1 },    // G5
        { freq: 1046.50, start: 0.95, duration: 0.4 },  // C6 (final)
    ];

    notes.forEach(note => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(note.freq, audioContext.currentTime + note.start);

        osc.connect(gain);
        gain.connect(audioContext.destination);

        gain.gain.setValueAtTime(0, audioContext.currentTime + note.start);
        gain.gain.linearRampToValueAtTime(0.25, audioContext.currentTime + note.start + 0.02);
        gain.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + note.start + note.duration * 0.7);
        gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + note.start + note.duration);

        osc.start(audioContext.currentTime + note.start);
        osc.stop(audioContext.currentTime + note.start + note.duration);
    });
};

// Play reminder sound - gentle double ping
const playReminderSound = (audioContext) => {
    const playPing = (startTime) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioContext.currentTime + startTime);

        osc.connect(gain);
        gain.connect(audioContext.destination);

        gain.gain.setValueAtTime(0, audioContext.currentTime + startTime);
        gain.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + startTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + startTime + 0.2);

        osc.start(audioContext.currentTime + startTime);
        osc.stop(audioContext.currentTime + startTime + 0.2);
    };

    playPing(0);
    playPing(0.25);
};

// Send Pomodoro completion notification
export const sendPomodoroNotification = async (sessionType = 'work') => {
    const title = sessionType === 'work'
        ? '🍅 Pomodoro Complete!'
        : '☕ Break Time Over!';

    const body = sessionType === 'work'
        ? 'Great work! Time for a well-deserved break.'
        : 'Break is over. Ready to focus again?';

    // Play the melody
    playNotificationSound('pomodoro');

    // Send the notification
    return sendNotification(title, body, {
        playSound: true,
        vibrate: true,
        tag: 'pomodoro',
        extra: { type: 'pomodoro', sessionType }
    });
};

// Send task/event reminder notification
export const sendReminderNotification = async (title, body, eventId) => {
    playNotificationSound('reminder');

    return sendNotification(`📌 ${title}`, body, {
        playSound: true,
        vibrate: true,
        tag: `reminder-${eventId}`,
        extra: { type: 'reminder', eventId }
    });
};

// Check for pending browser notifications (for scheduled reminders in browser)
export const checkPendingNotifications = async () => {
    if (isCapacitor()) return; // Capacitor handles this automatically

    const now = Date.now();
    const scheduledNotifications = JSON.parse(localStorage.getItem('scheduled_notifications') || '[]');
    const pending = [];
    const toSend = [];

    scheduledNotifications.forEach(notification => {
        if (notification.scheduledAt <= now) {
            toSend.push(notification);
        } else {
            pending.push(notification);
        }
    });

    // Send due notifications
    for (const notification of toSend) {
        await sendNotification(notification.title, notification.body, notification.options);
    }

    // Update storage with remaining pending notifications
    if (toSend.length > 0) {
        localStorage.setItem('scheduled_notifications', JSON.stringify(pending));
    }
};

// Initialize notification checker for browser
export const initNotificationChecker = () => {
    // Check every minute for pending notifications
    setInterval(checkPendingNotifications, 60000);
    // Also check immediately
    checkPendingNotifications();
};

export default {
    requestNotificationPermission,
    checkNotificationPermission,
    sendNotification,
    scheduleNotification,
    cancelNotification,
    playNotificationSound,
    sendPomodoroNotification,
    sendReminderNotification,
    initNotificationChecker
};
