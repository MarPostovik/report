const { google } = require('googleapis');
const fs = require('fs');
const path = require('path'); // Import the path module
const id = process.env.SPREADSHEET_ID;
console.log(id);

// Define the path to credentials.json relative to this script
const credentialsPath = path.join(__dirname, 'credentials.json');

// Check if credentials.json exists
if (!fs.existsSync(credentialsPath)) {
    console.error('Error: credentials.json not found.');
    process.exit(1); // Exit the script with an error code
}

// Read and parse credentials from the JSON file
const credentials = require(credentialsPath);
console.log(credentials); // Print the loaded credentials

async function getSheetData() {
    const auth = new google.auth.GoogleAuth({
        credentials, // Use the credentials object directly
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: id,
            range: 'Sheet1', // Adjust the range as needed
        });

        const rows = response.data.values;
        if (rows.length) {
            const header = rows[0];
            const jsonData = [];

            for (let i = 1; i < rows.length; i++) {
                const obj = {};
                for (let j = 0; j < header.length; j++) {
                    obj[header[j]] = rows[i][j];
                }
                jsonData.push(obj);
            }

            const jsonStr = JSON.stringify(jsonData, null, 2);
            fs.writeFileSync('output.json', jsonStr);
            console.log('Data successfully saved to output.json');
        } else {
            console.log('No data found.');
        }
    } catch (err) {
        console.error('Error fetching data from Google Sheets:', err);
    }
}

getSheetData();
