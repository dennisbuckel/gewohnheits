document.addEventListener('DOMContentLoaded', function () {
    // Funktion zum Abrufen und Anzeigen des Binance-Gesamtwerts
    async function fetchTotalValue() {
        try {
            const response = await fetch('/api/binance/total-balance');
            const data = await response.json();
            
            if (response.ok) {
                document.getElementById('totalValue').textContent = `${data.totalBalance.toFixed(2)} USD`;

                // Weitere Details zu den Assets können hier hinzugefügt werden
                fetchAccountInfo();
            } else {
                console.error('Error fetching total balance:', data.message);
                document.getElementById('totalValue').textContent = 'Fehler beim Laden der Daten';
            }
        } catch (error) {
            console.error('Error fetching total balance:', error);
            document.getElementById('totalValue').textContent = 'Fehler beim Laden der Daten';
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
                            <td>${parseFloat(asset.free) + parseFloat(asset.locked)}</td>
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

    // Event-Listener für den Aktualisierungsbutton
    document.getElementById('refresh-binance').addEventListener('click', fetchTotalValue);

    // Initiales Laden der Daten
    fetchTotalValue();
});
