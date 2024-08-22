

const mysql = require('mysql2'); // Use 'mysql' if you're using mysql library



const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Use your admin username
    password: 'redhat' // Use your admin password
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }

    console.log('Connected to the database');

    // Update user authentication method
    const query = `
        ALTER USER 'user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'redhat';
    `;

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return;
        }

        console.log('User authentication method updated successfully');
        console.log(results);

        connection.end();
    });
});
