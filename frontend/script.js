// Event Listener für die Success- und Fail-Buttons
document.querySelectorAll('.success-btn').forEach(button => {
    button.addEventListener('click', function() {
        const habitId = this.closest('.habit').getAttribute('data-habit-id');
        saveHabit(habitId, 'erledigt');
    });
});

document.querySelectorAll('.fail-btn').forEach(button => {
    button.addEventListener('click', function() {
        const habitId = this.closest('.habit').getAttribute('data-habit-id');
        saveHabit(habitId, 'nicht-erledigt');
    });
});

// Funktion zum Speichern einer Gewohnheit
async function saveHabit(habitId, status) {
    const date = document.getElementById('date').value;
    if (!date) {
        alert('Bitte wähle ein Datum aus.');
        return;
    }

    const habitInput = document.getElementById('footMassageInput');
    const habitText = habitInput.value.trim();
    if (!habitText) {
        alert('Bitte gib eine Gewohnheit ein.');
        return;
    }

    try {
        const response = await fetch('/api/habits', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ date, habit: habitText, status })
        });

        if (response.ok) {
            await displayHistory();
            updateSuccessRate();
            habitInput.value = '';
        } else {
            const result = await response.json();
            alert(result.message);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Funktion zum Anzeigen der Historie
async function displayHistory() {
    try {
        const response = await fetch('/api/habits');
        const history = await response.json();

        const historyDiv = document.getElementById('history');
        historyDiv.innerHTML = '';

        history.forEach(entry => {
            const entryDiv = document.createElement('div');
            entryDiv.className = 'history-entry ' + entry.status;
            entryDiv.setAttribute('data-tooltip', `${entry.date} - ${entry.habit}`);
            historyDiv.appendChild(entryDiv);
        });

        updateSuccessRate();
    } catch (error) {
        console.error('Error:', error);
    }
}

// Funktion zur Aktualisierung der Erfolgsquote
async function updateSuccessRate() {
    try {
        const response = await fetch('/api/habits');
        const history = await response.json();

        const total = history.length;
        const successCount = history.filter(entry => entry.status === 'erledigt').length;
        const successRate = total === 0 ? 0 : Math.round((successCount / total) * 100);
        document.getElementById('successRate').textContent = `Erfolgsquote: ${successRate}%`;
    } catch (error) {
        console.error('Error:', error);
    }
}

// Event Listener für den Archivieren-Button
document.getElementById('resetHistory').addEventListener('click', async function() {
    const listName = document.getElementById('listName').value.trim();
    if (!listName) {
        alert('Bitte gib der Liste einen Namen.');
        return;
    }

    try {
        const response = await fetch('/api/habits');
        const history = await response.json();

        if (history.length > 0) {
            const pastListResponse = await fetch('/api/pastLists', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: listName, entries: history })
            });

            if (pastListResponse.ok) {
                await fetch('/api/habits', {
                    method: 'DELETE'
                });

                displayHistory();
                displayPastLists();
                updateSuccessRate();
            } else {
                const result = await pastListResponse.json();
                alert(result.message);
            }
        } else {
            alert('Es gibt keine Einträge, die gespeichert werden können.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

// Funktion zum Anzeigen der vergangenen Listen
async function displayPastLists() {
    try {
        const response = await fetch('/api/pastLists');
        const pastLists = await response.json();

        const pastListsDiv = document.getElementById('pastLists');
        pastListsDiv.innerHTML = '';

        pastLists.forEach((list, index) => {
            const listDiv = document.createElement('div');
            listDiv.className = 'past-list';
            listDiv.textContent = list.name;
            listDiv.addEventListener('click', function() {
                displayPastListEntries(list);
            });
            pastListsDiv.appendChild(listDiv);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

// Funktion zum Anzeigen der Einträge vergangener Listen
function displayPastListEntries(list) {
    const historyDiv = document.getElementById('history');
    historyDiv.innerHTML = '';

    list.entries.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'history-entry ' + entry.status;
        entryDiv.setAttribute('data-tooltip', `${entry.date} - ${entry.habit}`);
        historyDiv.appendChild(entryDiv);
    });
}

// Historie und vergangene Listen beim Laden der Seite anzeigen
document.addEventListener('DOMContentLoaded', () => {
    displayHistory();
    displayPastLists();
    updateSuccessRate();
});
