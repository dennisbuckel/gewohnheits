document.addEventListener('DOMContentLoaded', function () {
    // Funktion zum Abrufen und Anzeigen des Binance-Gesamtwerts
    async function fetchTotalValue() {
        try {
            const response = await fetch('/api/binance/totalvalue');
            const text = await response.text(); // Erstmal als Text lesen
            console.log('Server Response:', text); // Zum Debuggen
            const data = JSON.parse(text); // Dann versuchen zu parsen
            document.getElementById('totalValueDisplay').textContent = `${data.totalValue} USD`;
        } catch (error) {
            console.error('Error fetching total balance:', error);
            throw error;
        }
    }

    // Funktion zum Abrufen und Anzeigen der Binance-Asset-Details
    async function fetchAccountInfo() {
        try {
            const response = await fetch('/api/binance/account-info');
            const data = await response.json();

            if (response.ok) {
                const tbody = document.getElementById('assetsTable').querySelector('tbody');
                tbody.innerHTML = ''; // Vorherige Zeilen löschen

                data.balances.forEach(asset => {
                    if (parseFloat(asset.free) > 0 || parseFloat(asset.locked) > 0) {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${asset.asset}</td>
                            <td>${(parseFloat(asset.free) + parseFloat(asset.locked)).toFixed(8)}</td>
                            <td>${(parseFloat(asset.free) + parseFloat(asset.locked)).toFixed(2)} USD</td>
                        `;
                        tbody.appendChild(row);
                    }
                });
            } else {
                console.error('Error fetching account info:', data.message);
            }
        } catch (error) {
            console.error('Error fetching account info:', error);
        }
    }

    // Funktion zum Aktualisieren der Anzeige des Gesamtwerts und der Asset-Details
    async function updateDisplay() {
        try {
            await fetchTotalValue();
            await fetchAccountInfo();
        } catch (error) {
            console.error('Error updating display:', error);
        }
    }

    // Event-Listener für den Aktualisierungsbutton
    document.getElementById('refresh-binance').addEventListener('click', updateDisplay);

    // Initiales Laden der Daten
    updateDisplay();
});
