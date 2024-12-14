import connectToDatabase from "../config/db.js"; // Import the database connection

const createAppointmentsTable = async () => {
    const client = await connectToDatabase(); // Connect to the database

    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS appointments (
            id SERIAL PRIMARY KEY,
            userid VARCHAR(255) NOT NULL,
            docId VARCHAR(255) NOT NULL,
            slotDate VARCHAR(255) NOT NULL,
            slotTime VARCHAR(255) NOT NULL,
            userData JSON NOT NULL,
            docData JSON NOT NULL,
            amount DECIMAL NOT NULL,
            date DATETIME NOT NULL,
            cancelled BOOLEAN DEFAULT FALSE,
            payment BOOLEAN DEFAULT FALSE,
            isCompleted BOOLEAN DEFAULT FALSE
        );
    `;

    try {
        await client.query(createTableQuery); // Execute the query to create the table
        console.log("Appointments table created successfully.");
    } catch (error) {
        console.error("Error creating appointments table:", error);
    } finally {
        client.release(); // Release the database connection
    }
};

// Call the function to create the table
createAppointmentsTable();

export default createAppointmentsTable; // Export the function for use elsewhere