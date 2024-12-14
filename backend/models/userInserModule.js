import connectToDatabase from '../config/db.js';

const insertUser = async (UsersData) => {
    // Validate input
    const requiredFields = ['name', 'email', 'password'];
    const defaultAddress = { line1: "", line2: "" };
    UsersData.address = UsersData.address || defaultAddress; // Set default address if not provided
    for (const field of requiredFields) {
        if (!UsersData[field]) {
            throw new Error(`Missing required field: ${field}`);
        }
    }

    const connection = await connectToDatabase();
    const insertQuery = `
        INSERT INTO users (name, email, password, address )
        VALUES (?, ?, ?, ?)
    `;

    try {
        // Check if the email already exists
        const [existingUser] = await connection.execute(`SELECT * FROM users WHERE email = ?`, [UsersData.email]);
        if (existingUser.length > 0) {
            throw new Error(`A user with the email ${UsersData.email} already exists.`);
        }


        const [result] = await connection.execute(insertQuery, [
            UsersData.name,
            UsersData.email,
            UsersData.password,
            JSON.stringify(UsersData.address)
        ]);

        // Check if the insert was successful and return the inserted record
        if (result.affectedRows > 0) {
            const [rows] = await connection.execute(`SELECT * FROM users WHERE user_id = ?`, [result.insertId]);
            return rows[0]; // Return the newly created doctor record
        } else {
            throw new Error('Failed to insert user.');
        }
    } catch (error) {
        console.error('Error in insertUser:', error);
        throw new Error('Error: ' + error.message); // Provide a more informative error message
    } finally {
        // Ensure the connection is closed
        if (connection) {
            await connection.release();
        }
    }
};

export default insertUser;