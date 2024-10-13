const mongoose = require('mongoose');

const connectDatabase = () => {
    mongoose
        .connect(process.env.MONGO_URI, {
        })
        .then((data) => {
            console.log(`Shopkart servers is connected with server: ${data.connection.host}`);
        })
        .catch((error) => {
            console.error('Error connecting to database:', error.message);
        });
};

module.exports = connectDatabase;