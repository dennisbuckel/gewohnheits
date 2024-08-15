// Initialization of selected entry
let selectedEntry = null;

// Event Listener Initialization
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    displayHistory();
    updateSuccessRate();
});

// Initializes all event listeners
function initEventListeners() {
    document.querySelectorAll('.success-btn').forEach(button => {
        button.addEventListener('click', handleSuccessClick);
    });

    document.querySelectorAll('.fail-btn').forEach(button => {
        button.addEventListener('click', handleFailClick);
    });

    document.getElementById('date').addEventListener('input', validateDate);
    document.getElementById('footMassageInput').addEventListener('input', validateHabitText);

    document.getElementById('habitForm').addEventListener('submit', function (event) {
        const dateInput = document.getElementById('date').value;
        const habitInput = document.getElementById('footMassageInput').value.trim();

        if (!dateInput || habitInput.length < 3) {
            event.preventDefault();
            alert('Bitte überprüfe deine Eingaben.');
        }
    });
}

// Event handler for success button click
function handleSuccessClick() {
    const habitId = this.closest('.habit').getAttribute('data-habit-id');
    saveHabit(habitId, 'erledigt');
}

// Event handler for fail button click
function handleFailClick() {
    const habitId = this.closest('.habit').getAttribute('data-habit-id');
    saveHabit(habitId, 'nicht-erledigt');
}

// Function to save habit
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

// Function to display history
async function displayHistory() {
    try {
        const response = await fetch('/api/habits');
        const history = await response.json();

        const historyDiv = document.getElementById('history');
        historyDiv.innerHTML = '';

        const groupedByDate = groupBy(history, 'date');
        const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(b) - new Date(a));

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
                entryDiv.addEventListener('click', () => selectEntry(entryDiv, entry._id, entry.habit, entry.status, entry.date));

                entriesDiv.appendChild(entryDiv);
            });

            dateGroupDiv.appendChild(entriesDiv);

            const successRate = calculateSuccessRate(entries);
            const progressBar = createProgressBar(successRate);
            dateGroupDiv.appendChild(progressBar);

            historyDiv.appendChild(dateGroupDiv);
        }

        updateSuccessRate();
    } catch (error) {
        console.error('Error:', error);
    }
}

// Helper functions for better code reuse
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

function createProgressBar(successRate) {
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    const progressBarInner = document.createElement('div');
    progressBarInner.className = 'progress-bar-inner';
    progressBarInner.style.width = `${successRate}%`;
    progressBarInner.textContent = `${successRate}%`;
    progressBar.appendChild(progressBarInner);
    return progressBar;
}

// Validation functions
function validateDate() {
    const dateInput = this.value;
    const today = new Date().toISOString().split('T')[0];
    if (dateInput > today) {
        this.setCustomValidity('Das Datum kann nicht in der Zukunft liegen.');
    } else {
        this.setCustomValidity('');
    }
}

function validateHabitText() {
    const textInput = this.value.trim();
    if (textInput.length < 3) {
        this.setCustomValidity('Die Gewohnheit muss mindestens 3 Zeichen lang sein.');
    } else {
        this.setCustomValidity('');
    }
}

// Functions for handling selected entry
function selectEntry(entryDiv, id, habitText, status, date) {
    if (selectedEntry === entryDiv) {
        selectedEntry.classList.remove('selected');
        selectedEntry = null;
        document.getElementById('actionButtons').style.display = 'none';
    } else {
        if (selectedEntry) {
            selectedEntry.classList.remove('selected');
        }
        selectedEntry = entryDiv;
        selectedEntry.classList.add('selected');
        document.getElementById('actionButtons').style.display = 'flex';

        document.getElementById('editBtn').onclick = () => showEditForm(id, habitText, date);
        document.getElementById('deleteBtn').onclick = () => deleteHabit(id);
    }
}

function showEditForm(id, habitText, date) {
    document.getElementById('editFormContainer').style.display = 'block';
    document.getElementById('editDate').value = date.split('T')[0];
    document.getElementById('editHabit').value = habitText;

    document.getElementById('editForm').onsubmit = (e) => {
        e.preventDefault();
        editHabit(id);
    };

    document.getElementById('cancelEdit').onclick = () => {
        document.getElementById('editFormContainer').style.display = 'none';
    };
}

async function editHabit(id) {
    const newHabitText = document.getElementById('editHabit').value;
    const newDate = document.getElementById('editDate').value;

    try {
        const response = await fetch(`/api/habits/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ habit: newHabitText, date: newDate })
        });

        if (response.ok) {
            displayHistory();
            updateSuccessRate();
            document.getElementById('editFormContainer').style.display = 'none';
            selectedEntry.classList.remove('selected');
            selectedEntry = null;
        } else {
            const result = await response.json();
            alert(result.message);
        }
    } catch (error) {
        console.error('Error:', error);
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
                document.getElementById('actionButtons').style.display = 'none';
                selectedEntry.classList.remove('selected');
                selectedEntry = null;
            } else {
                const result = await response.text();
                alert(result);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
}
