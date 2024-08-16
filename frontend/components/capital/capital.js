document.addEventListener('DOMContentLoaded', function () {
    // Funktion zum Abrufen und Anzeigen des Binance-Gesamtwerts
    async function fetchTotalValue() {
        try {
            const response = await fetch('/api/binance/totalbalance');
            if (!response.ok) {
                throw new Error('Fehler beim Abrufen des Gesamtwerts');
            }
            const data = await response.json();
            document.getElementById('totalValueDisplay').textContent = `${data.totalBalance} USD`;
        } catch (error) {
            console.error('Error fetching total balance:', error);
        }
    }

    // Funktion zum Abrufen und Anzeigen der Binance-Asset-Details
    async function fetchAccountInfo() {
        try {
            const response = await fetch('/api/binance/account-info');
            if (!response.ok) {
                throw new Error('Fehler beim Abrufen der Konto-Informationen');
            }
            const data = await response.json();

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
        } catch (error) {
            console.error('Error fetching account info:', error);
        }
    }

    // Funktion zum Pingen der Binance API
    async function pingBinance() {
        try {
            const response = await fetch('/api/binance/ping');
            if (response.ok) {
                console.log('Ping erfolgreich!');
            } else {
                console.error('Ping fehlgeschlagen:', response.statusText);
            }
        } catch (error) {
            console.error('Fehler beim Pingen der Binance API:', error);
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

    // Event-Listener für den Ping-Button
    document.getElementById('ping-binance').addEventListener('click', pingBinance);

    // Initiales Laden der Daten
    updateDisplay();
});
