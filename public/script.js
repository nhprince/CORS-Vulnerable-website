// vulnerable-website/public/script.js
document.getElementById('fetchOwnDataBtn').addEventListener('click', () => {
    const dataDisplay = document.getElementById('data-display');
    dataDisplay.textContent = 'Fetching...';

    // Fetching data from its own API (same-origin request)
    // This will work regardless of CORS because it's same-origin.
    // 'credentials: 'include'' is important to send the session cookie.
    fetch('/api/secret-data', { credentials: 'include' })
        .then(response => {
            if (!response.ok) {
                // If API returns an error (like 401 if cookie isn't set right)
                return response.json().then(err => { throw new Error(`API Error: ${err.error || response.statusText}`) });
            }
            return response.json();
        })
        .then(data => {
            dataDisplay.textContent = JSON.stringify(data, null, 2);
        })
        .catch(error => {
            dataDisplay.textContent = `Error fetching data: ${error.message}`;
            console.error('Error:', error);
        });
});