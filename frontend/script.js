async function deleteHabit(id) {
    if (confirm("Willst du diesen Habit wirklich löschen?")) {
        try {
            console.log(`Sending DELETE request for habit with id: ${id}`);  // Debugging-Ausgabe

            const response = await fetch(`/api/habits/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                console.log(`Habit with id ${id} deleted successfully`);  // Debugging-Ausgabe
                displayHistory();
                updateSuccessRate();
                document.getElementById('actionButtons').style.display = 'none';
                selectedEntry.classList.remove('selected');
                selectedEntry = null;
            } else {
                const result = await response.text();
                console.log(`Failed to delete habit with id ${id}: ${result}`);  // Debugging-Ausgabe
                alert(result);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
}
