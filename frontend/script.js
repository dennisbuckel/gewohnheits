const correctPassword = "meinGeheimnis"; // Ändere das Passwort nach Bedarf

function checkPassword() {
    const inputPassword = document.getElementById('passwordInput').value;
    const passwordError = document.getElementById('passwordError');

    if (inputPassword === correctPassword) {
        document.getElementById('passwordPrompt').style.display = 'none';
        document.getElementById('mainContent').style.display = 'block';
    } else {
        passwordError.textContent = 'Falsches Passwort, bitte erneut versuchen.';
    }
}

document.getElementById('passwordInput').addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        checkPassword();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    displayHistory();
    displayPastLists();
    updateSuccessRate();

    // Überprüfen, ob der Passwortschutz angezeigt wird
    const passwordPrompt = document.getElementById('passwordPrompt');
    const mainContent = document.getElementById('mainContent');

    // Falls mainContent fälschlicherweise sichtbar ist, wird es ausgeblendet
    if (mainContent.style.display !== 'none') {
        mainContent.style.display = 'none';
    }

    passwordPrompt.style.display = 'block';
});

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

async function displayHistory() {
    try {
        const response = await fetch('/api/habits');
        const history = await response.json();

        const historyDiv = document.getElementById('history');
        historyDiv.innerHTML = '';

        const groupedByDate = groupBy(history, 'date');
        for (const [date, entries] of Object.entries(groupedByDate)) {
            const dateGroupDiv = document.createElement('div');
            dateGroupDiv.className = 'history-date-group';
            const dateHeader = document.createElement('h3');
            dateHeader.textContent = formatDate(date);
            dateGroupDiv.appendChild(dateHeader);

            const entriesDiv = document.createElement('div');
            entriesDiv.className = 'history-entries';

            entries.forEach(entry => {
                const entryDiv = document.createElement('div');
                entryDiv.className = 'history-entry ' + entry.status;
                entryDiv.setAttribute('data-tooltip', `${entry.date} - ${entry.habit}`);
                entriesDiv.appendChild(entryDiv);
            });

            dateGroupDiv.appendChild(entriesDiv);

            const successRate = calculateSuccessRate(entries);
            const progressBar = document.createElement('div');
            progressBar.className = 'progress-bar';
            const progressBarInner = document.createElement('div');
            progressBarInner.className = 'progress-bar-inner';
            progressBarInner.style.width = `${successRate}%`;
            progressBar.appendChild(progressBarInner);
            dateGroupDiv.appendChild(progressBar);

            historyDiv.appendChild(dateGroupDiv);
        }

        updateSuccessRate();
    } catch (error) {
        console.error('Error:', error);
    }
}

function groupBy(array, key) {
    return array.reduce((result, currentValue) => {
        (result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue);
        return result;
    }, {});
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('de-DE', options);
}

function calculateSuccessRate(entries) {
    const total = entries.length;
    const successCount = entries.filter(entry => entry.status === 'erledigt').length;
    return total === 0 ? 0 : Math.round((successCount / total) * 100);
}

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

document.addEventListener('DOMContentLoaded', () => {
    displayHistory();
    displayPastLists();
    updateSuccessRate();
});
