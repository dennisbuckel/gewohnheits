document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('fahrtenbuchForm');
    const fahrtenbuchEintraege = document.getElementById('fahrtenbuchEintraege');

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const formData = new FormData(form);
        const entry = {
            von: formData.get('von'),
            bis: formData.get('bis'),
            km: formData.get('km'),
            zeit: formData.get('zeit'),
            emissionsfrei: formData.get('emissionsfrei')
        };

        // Hier wird der neue Eintrag an das Backend gesendet
        fetch('/api/fahrtenbuch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(entry)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    addEntryToPage(data.entry);
                    form.reset();
                }
            })
            .catch(error => console.error('Fehler beim Hinzufügen des Eintrags:', error));
    });

    function addEntryToPage(entry) {
        const entryElement = document.createElement('div');
        entryElement.classList.add('fahrtenbuch-eintrag');
        entryElement.dataset.id = entry._id;

        entryElement.innerHTML = `
            <div>
                <strong>Von:</strong> ${entry.von} <br>
                <strong>Bis:</strong> ${entry.bis} <br>
                <strong>Kilometer:</strong> ${entry.km} km <br>
                <strong>Zeit:</strong> ${entry.zeit} <br>
                <strong>Emissionsfrei:</strong> ${entry.emissionsfrei}% <br>
            </div>
            <div>
                <button class="edit-btn">Bearbeiten</button>
                <button class="delete-btn">Löschen</button>
            </div>
        `;

        fahrtenbuchEintraege.appendChild(entryElement);

        // Event Listener für Bearbeiten und Löschen
        entryElement.querySelector('.edit-btn').addEventListener('click', () => editEntry(entry));
        entryElement.querySelector('.delete-btn').addEventListener('click', () => deleteEntry(entry._id));
    }

    function editEntry(entry) {
        // Implementiere die Bearbeitungsfunktion hier
        console.log('Bearbeiten:', entry);
    }

    function deleteEntry(id) {
        fetch(`/api/fahrtenbuch/${id}`, {
            method: 'DELETE'
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.querySelector(`.fahrtenbuch-eintrag[data-id="${id}"]`).remove();
                }
            })
            .catch(error => console.error('Fehler beim Löschen des Eintrags:', error));
    }

    // Lädt alle Einträge beim Laden der Seite
    fetch('/api/fahrtenbuch')
        .then(response => response.json())
        .then(data => {
            data.entries.forEach(addEntryToPage);
        })
        .catch(error => console.error('Fehler beim Laden der Einträge:', error));
});
