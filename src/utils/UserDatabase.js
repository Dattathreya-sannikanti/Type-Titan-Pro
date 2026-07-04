const DB_USER_PROFILES = 'TypeTitan_V22_Users';

export const UserDatabase = {
    loginUser: function(username, password) {
        let database = JSON.parse(localStorage.getItem(DB_USER_PROFILES));

        if (!database) {
            database = {};
        }

        if (!database[username]) {
            return {
                success: false,
                message: "Agent not found."
            };
        }

        if (database[username].password !== password) {
            return {
                success: false,
                message: "Incorrect Access Code."
            };
        }

        // Backwards compatibility for older accounts
        if (!database[username].activityDates) {
            database[username].activityDates = {};
        }

        if (!database[username].lifetimeErrors) {
            database[username].lifetimeErrors = {};
        }

        if (!database[username].progress.syntax) {
            database[username].progress.syntax = {
                level: 0,
                sub: 0
            };
        }

        return {
            success: true,
            userData: database[username]
        };
    },

    registerUser: function(username, password) {
        let database = JSON.parse(localStorage.getItem(DB_USER_PROFILES));

        if (!database) {
            database = {};
        }

        if (database[username]) {
            return {
                success: false,
                message: "Agent ID already in use."
            };
        }

        database[username] = {
            password: password,
            progress: {
                beginner: {
                    level: 0,
                    sub: 0
                },
                intermediate: {
                    level: 0,
                    sub: 0
                },
                pro: {
                    level: 0,
                    sub: 0
                },
                syntax: {
                    level: 0,
                    sub: 0
                }
            },
            activityDates: {},
            lifetimeErrors: {}
        };

        localStorage.setItem(DB_USER_PROFILES, JSON.stringify(database));
        return {
            success: true,
            userData: database[username]
        };
    },

    saveFullProfile: function(username, fullUserData) {
        let database = JSON.parse(localStorage.getItem(DB_USER_PROFILES));

        if (!database) {
            database = {};
        }

        if (database[username]) {
            database[username] = fullUserData;
            localStorage.setItem(DB_USER_PROFILES, JSON.stringify(database));
        }
    }
};
