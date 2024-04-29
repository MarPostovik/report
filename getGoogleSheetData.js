require('dotenv').config(); // Якщо ви використовуєте dotenv, розкоментуйте цей рядок
const { google } = require('googleapis');
const fs = require('fs');

const credentials = {
    type: process.env.TYPE,
    project_id: process.env.PROJECT_ID,
    private_key_id: process.env.PRIVATE_KEY_ID,
    private_key: process.env.PRIVATE_KEY, // виправлення для ключа
    client_email: process.env.CLIENT_EMAIL,
    client_id: process.env.CLIENT_ID,
    auth_uri: process.env.AUTH_URI,
    token_uri: process.env.TOKEN_URI,
    auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.CLIENT_X509_CERT_URL
};
const id = process.env.SPREADSHEET_ID;
console.log(credentials);
console.log(id);

// Збереження credentials в файл credentials.json
fs.writeFileSync('credentials.json', JSON.stringify(credentials));

console.log("Credentials:" + credentials);
console.log("id" + id);

async function getSheetData() {
    const auth = new google.auth.GoogleAuth({
        credentials, // Використовуємо об'єкт credentials замість шляху до файлу
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
