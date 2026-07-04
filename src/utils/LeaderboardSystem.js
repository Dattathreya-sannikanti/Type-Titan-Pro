const DB_GLOBAL_SCORES = 'TypeTitan_V22_Scores';

export const LeaderboardSystem = {
    saveScore: function(mode, levelIndex, subIndex, username, finalWpm, finalAcc) {
        if (mode === 'custom') {
            return;
        }

        let database = JSON.parse(localStorage.getItem(DB_GLOBAL_SCORES));

        if (!database) {
            database = {};
        }

        let levelKey = `${mode}_${levelIndex}_${subIndex}`;

        if (!database[levelKey]) {
            database[levelKey] = [];
        }

        let existingEntryIndex = database[levelKey].findIndex(scoreObj => scoreObj.user === username);

        if (existingEntryIndex !== -1) {
            let oldWpm = database[levelKey][existingEntryIndex].wpm;
            let oldAcc = database[levelKey][existingEntryIndex].acc;
            let isNewScoreBetter = false;

            if (Number(finalWpm) > oldWpm) {
                isNewScoreBetter = true;
            } else if (Number(finalWpm) === oldWpm && Number(finalAcc) > oldAcc) {
                isNewScoreBetter = true;
            }

            if (isNewScoreBetter) {
                database[levelKey][existingEntryIndex].wpm = Number(finalWpm);
                database[levelKey][existingEntryIndex].acc = Number(finalAcc);
            }
        } else {
            database[levelKey].push({
                user: username,
                wpm: Number(finalWpm),
                acc: Number(finalAcc)
            });
        }

        database[levelKey].sort((a, b) => {
            if (b.wpm !== a.wpm) {
                return b.wpm - a.wpm;
            }
            return b.acc - a.acc;
        });

        database[levelKey] = database[levelKey].slice(0, 5);
        localStorage.setItem(DB_GLOBAL_SCORES, JSON.stringify(database));
    },

    getScores: function(mode, levelIndex, subIndex) {
        let database = JSON.parse(localStorage.getItem(DB_GLOBAL_SCORES));

        if (!database) {
            database = {};
        }

        let levelKey = `${mode}_${levelIndex}_${subIndex}`;

        if (database[levelKey]) {
            return database[levelKey];
        } else {
            return [];
        }
    }
};
