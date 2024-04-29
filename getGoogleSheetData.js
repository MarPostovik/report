// require('dotenv').config();
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const credentials = process.env.CREDENTIALS;
const id = process.env.SPREADSHEET_ID;
console.log(credentials);
console.log(id);

function saveCredentialsToFile(credentialsObj) {
    const credentialsPath = path.join(__dirname, 'credentials.json');
    fs.writeFileSync(credentialsPath, JSON.stringify(credentialsObj, null, 2));
    return credentialsPath;
}

// Зберігаємо об'єкт credentials у файл JSON
const credentialsFilePath = saveCredentialsToFile(credentials);

async function getSheetData() {
    const auth = new google.auth.GoogleAuth({
        keyFile: credentialsFilePath, // Змінна середовища для шляху до файлу з ключем
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: id, // Змінна середовища для ідентифікатора таблиці
            range: 'Аркуш1', // Назва аркуша або діапазон
        });

        const rows = response.data.values;
        if (rows.length) {
            const header = rows[0]; // Перший рядок як заголовки
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
            console.log('Дані успішно збережено у файлі output.json');
        } else {
            console.log('Не знайдено жодних даних.');
        }
    } catch (err) {
        console.error('Помилка отримання даних з Google Sheets:', err);
    }
}

getSheetData();
