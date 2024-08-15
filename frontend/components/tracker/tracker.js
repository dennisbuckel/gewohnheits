// Initialization of selected entry
let selectedEntry = null;

// Event Listener Initialization
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    displayHistory();
    updateSuccessRate();
    console.log("Event listeners initialized and history displayed.");
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
    console.log("All event listeners initialized.");
}

// Event handler for success button click
function handleSuccessClick() {
    const habitId = this.closest('.habit').getAttribute('data-habit-id');
    console.log(`Success button clicked for habit ID: ${habitId}`);
    saveHabit(habitId, 'erledigt');
}

// Event handler for fail button click
function handleFailClick() {
    const habitId = this.closest('.habit').getAttribute('data-habit-id');
    console.log(`Fail button clicked for habit ID: ${habitId}`);
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

    console.log(`Saving habit with ID: ${habitId}, status: ${status}, date: ${date}, text: ${habitText}`);

    try {
        const response = await fetch('/api/habits', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ date, habit: habitText, status })
        });

        if (response.ok) {
            console.log("Habit saved successfully.");
            await displayHistory();
            updateSuccessRate();
            habitInput.value = '';
        } else {
            const result = await response.json();
            console.error("Error saving habit:", result.message);
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

        console.log("Fetched history:", history);

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

// Function to update the overall success rate
async function updateSuccessRate() {
    try {
        const response = await fetch('/api/habits');
        const history = await response.json();

        const total = history.length;
        const successCount = history.filter(entry => entry.status === 'erledigt').length;
        const successRate = total === 0 ? 0 : Math.round((successCount / total) * 100);

        console.log(`Overall success rate: ${successRate}%`);
        document.getElementById('successRate').textContent = `Erfolgsquote: ${successRate}%`;
    } catch (error) {
        console.error('Error:', error);
    }
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
    console.log(`Date input validated: ${dateInput}`);
}

function validateHabitText() {
    const textInput = this.value.trim();
    if (textInput.length < 3) {
        this.setCustomValidity('Die Gewohnheit muss mindestens 3 Zeichen lang sein.');
    } else {
        this.setCustomValidity('');
    }
    console.log(`Habit text validated: ${textInput}`);
}

// Functions for handling selected entry
function selectEntry(entryDiv, id, habitText, status, date) {
    console.log(`Selecting entry with ID: ${id}`);
    if (selectedEntry === entryDiv) {
        selectedEntry.classList.remove('selected');
        selectedEntry = null;
        document.getElementById('actionButtons').style.display = 'none';
        console.log(`Deselected entry with ID: ${id}`);
    } else {
        if (selectedEntry) {
            selectedEntry.classList.remove('selected');
        }
        selectedEntry = entryDiv;
        selectedEntry.classList.add('selected');
        document.getElementById('actionButtons').style.display = 'flex';

        document.getElementById('editBtn').onclick = () => showEditForm(id, habitText, date);
        document.getElementById('deleteBtn').onclick = () => deleteHabit(id);

        console.log(`Entry with ID: ${id} selected.`);
    }
}

function showEditForm(id, habitText, date) {
    const editFormContainer = document.getElementById('editFormContainer');
    if (editFormContainer) {
        console.log(`Editing habit with ID: ${id}`);
        editFormContainer.style.display = 'block';
        document.getElementById('editDate').value = date.split('T')[0];
        document.getElementById('editHabit').value = habitText;

        document.getElementById('editForm').onsubmit = (e) => {
            e.preventDefault();
            editHabit(id);
        };

        document.getElementById('cancelEdit').onclick = () => {
            editFormContainer.style.display = 'none';
            console.log(`Edit canceled for habit with ID: ${id}`);
        };
    } else {
        console.error('Edit form container not found.');
    }
}

async function editHabit(id) {
    const newHabitText = document.getElementById('editHabit').value;
    const newDate = document.getElementById('editDate').value;

    console.log(`Submitting edit for habit with ID: ${id}, new text: ${newHabitText}, new date: ${newDate}`);

    try {
        const response = await fetch(`/api/habits/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ habit: newHabitText, date: newDate })
        });

        if (response.ok) {
            console.log("Habit updated successfully.");
            displayHistory();
            updateSuccessRate();
            document.getElementById('editFormContainer').style.display = 'none';
            selectedEntry.classList.remove('selected');
            selectedEntry = null;
        } else {
            const result = await response.json();
            console.error("Error updating habit:", result.message);
            alert(result.message);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Helper function to group items by a specific key
function groupBy(array, key) {
    return array.reduce((result, currentValue) => {
        const groupKey = currentValue[key];
        if (!result[groupKey]) {
            result[groupKey] = [];
        }
        result[groupKey].push(currentValue);
        return result;
    }, {});
}

async function deleteHabit(id) {
    console.log("Attempting to delete habit with ID:", id);  // Logge die ID
    if (confirm("Willst du diesen Habit wirklich löschen?")) {
        try {
            const response = await fetch(`/api/habits/${id}`, {
                method: 'DELETE'
            });

            console.log("Response status:", response.status);  // Logge den Response-Status

            if (response.ok) {
                console.log("Habit deleted successfully.");
                displayHistory();
                updateSuccessRate();
                document.getElementById('actionButtons').style.display = 'none';
                selectedEntry.classList.remove('selected');
                selectedEntry = null;
            } else {
                const result = await response.text();
                console.error("Error deleting habit:", result);
                alert(result);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
}
