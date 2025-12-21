export const syncService = {
    SERVER_URL: 'http://localhost:3000', // Change this to your PC's IP (e.g., http://192.168.1.5:3000) for mobile access

    async pushData(user) {
        if (!user) throw new Error('User not authenticated');

        // Gather all local storage data belonging to user
        const allData = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(user.username)) {
                allData[key] = localStorage.getItem(key);
            }
        }

        const payload = {
            username: user.username,
            data: allData,
            deviceId: navigator.userAgent,
            timestamp: new Date().toISOString()
        };

        try {
            const response = await fetch(`${this.SERVER_URL}/api/sync/push`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Sync failed');
            return await response.json();
        } catch (error) {
            console.error('Push failed:', error);
            throw error;
        }
    },

    async pullData(user) {
        if (!user) throw new Error('User not authenticated');

        try {
            const response = await fetch(`${this.SERVER_URL}/api/sync/pull/${user.username}`);
            if (!response.ok) {
                if (response.status === 404) return null; // No backup yet
                throw new Error('Restore failed');
            }

            const { backup } = await response.json();

            // Restore data
            if (backup && backup.data) {
                Object.entries(backup.data).forEach(([key, value]) => {
                    localStorage.setItem(key, value);
                });
                return backup;
            }
            return null;
        } catch (error) {
            console.error('Pull failed:', error);
            throw error;
        }
    }
};
