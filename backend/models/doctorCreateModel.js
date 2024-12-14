import connectToDatabase from '../config/db.js';

// Function to create the doctors table
async function createDoctorsTable() {
    let connection;
    try {
        connection = await connectToDatabase();
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS doctors (
                doctor_id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                image VARCHAR(2083) NOT NULL,  
                speciality VARCHAR(255) NOT NULL,
                degree VARCHAR(255) NOT NULL,
                experience VARCHAR(255) NOT NULL,
                about TEXT NOT NULL,
                availability BOOLEAN NOT NULL,
                fees DECIMAL(10, 2) NOT NULL,
                address JSON NOT NULL,
                date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                slots_booked JSON 
            );
        `;

        await connection.execute(createTableQuery);
        console.log('Doctors table created');
    } catch (error) {
        console.error('Error creating doctors table:', error);
    } finally {
        if (connection) {
            connection.release(); // Ensure the connection is released back to the pool
        }
    }
}

export default createDoctorsTable;
// LONGBLOB sorts images as binary in url format