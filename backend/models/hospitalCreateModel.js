import connectToDatabase from '../config/db.js';

// Function to create the doctors table
async function createHospitalsTable() {
    let connection;
    try {
        connection = await connectToDatabase();
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS hospitals (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(2083) NOT NULL,
            email_address VARCHAR(255),
            about TEXT NOT NULL,
            address JSON,
            phone_number VARCHAR(255) NOT NULL,
            emergency_number VARCHAR(255) NOT NULL,
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            image VARCHAR(2083) NOT NULL,
            physical_address JSON
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

export default createHospitalsTable;
// LONGBLOB sorts images as binary in url format