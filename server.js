const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const connectDatabase = require('./db');
const fs = require('fs');
const fastCsv = require('fast-csv');
const path = require('path');

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true })); // Middleware to handle form data

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));  // Assuming your EJS files are inside a 'views' folder

// Simple email validation function
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

// Serve the 'uploads' folder to access the CSV file
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route to render the email validation form
app.get('/', (req, res) => {
    res.render('index', { validEmails: null }); // Pass null initially
});

app.post('/submit-emails', (req, res) => {
    // Check if emails are provided in the body
    if (!req.body.emails) {
        return res.status(400).send('No emails provided.');
    }

    // Debugging log for received emails
    console.log('Emails received:', req.body.emails);

    // Split emails by spaces, commas, or new lines
    const emails = req.body.emails.split(/[\s,]+/).map(email => email.trim());

    // Debug to check how the emails are processed
    console.log('Processed Emails:', emails);

    const validEmailsSet = new Set();

    // Validate each email and add to the set if valid
    emails.forEach((email) => {
        if (isValidEmail(email)) {
            validEmailsSet.add(email);
        }
    });

    const validEmailsArray = Array.from(validEmailsSet);

    // Write valid emails to a CSV file if there are valid emails
    if (validEmailsArray.length > 0) {
        const outputFilePath = path.join(__dirname, 'uploads', 'valid_emails.csv');
        const writableStream = fs.createWriteStream(outputFilePath);

        fastCsv
            .write(validEmailsArray.map(email => ({ email })), { headers: true })
            .pipe(writableStream)
            .on('finish', () => {
                res.render('index', { validEmails: validEmailsArray });
            })
            .on('error', (err) => {
                console.error('Error writing CSV:', err);
                res.status(500).send('Error writing the CSV file.');
            });
    } else {
        res.render('index', { validEmails: [] }); // No valid emails found
    }
});


connectDatabase(); // Call your database connection function

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
