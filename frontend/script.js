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
        const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(b) - new Date(a)); // Sortiere die Daten absteigend

        for (const date of sortedDates) {
            const entries = groupedByDate[date];
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

                const buttonContainer = document.createElement('div');
                buttonContainer.className = 'button-container';

                const editButton = document.createElement('button');
                editButton.className = 'edit-btn';
                editButton.setAttribute('data-tooltip', 'Bearbeiten');
                editButton.onclick = () => editHabit(entry._id, entry.habit, entry.status, entry.date);

                const deleteButton = document.createElement('button');
                deleteButton.className = 'delete-btn';
                deleteButton.setAttribute('data-tooltip', 'Löschen');
                deleteButton.onclick = () => deleteHabit(entry._id);

                buttonContainer.appendChild(editButton);
                buttonContainer.appendChild(deleteButton);

                entryDiv.appendChild(buttonContainer);
                entriesDiv.appendChild(entryDiv);
            });

            dateGroupDiv.appendChild(entriesDiv);

            const successRate = calculateSuccessRate(entries);
            const progressBar = document.createElement('div');
            progressBar.className = 'progress-bar';
            const progressBarInner = document.createElement('div');
            progressBarInner.className = 'progress-bar-inner';
            progressBarInner.style.width = `${successRate}%`;
            progressBarInner.textContent = `${successRate}%`;
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

async function editHabit(id, habitText, status, date) {
    const newHabitText = prompt("Bearbeite den Habit", habitText);
    const newDate = prompt("Bearbeite das Datum (YYYY-MM-DD)", date);
    if (newHabitText !== null && newDate !== null) {
        try {
            const response = await fetch(`/api/habits/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ habit: newHabitText, status, date: newDate })
            });

            if (response.ok) {
                displayHistory();
                updateSuccessRate();
            } else {
                const result = await response.json();
                alert(result.message);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

async function deleteHabit(id) {
    if (confirm("Willst du diesen Habit wirklich löschen?")) {
        try {
            const response = await fetch(`/api/habits/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                displayHistory();
                updateSuccessRate();
            } else {
                const result = await response.json();
                alert(result.message);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

document.getElementById('resetHistory').addEventListener('click', async function() {
    try {
        await fetch('/api/habits', {
            method: 'DELETE'
        });

        displayHistory();
        updateSuccessRate();
    } catch (error) {
        console.error('Error:', error);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    displayHistory();
    updateSuccessRate();
});
