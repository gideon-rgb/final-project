import connectToDatabase from '../config/db.js';
import moment from 'moment'

const insertHospital = async (hospitalData) => {
    // Validate input
    const requiredFields = ['name', 'email_address', 'about','address','phone_number','emergency_number', 'date','image','physical_address'];
    for (const field of requiredFields) {
        if (!hospitalData[field]) {
            throw new Error(`Missing required field: ${field}`);
        }
    }
    console.log("insertHospital:",hospitalData)
    const timestamp = hospitalData.date
    const date = new Date(timestamp);
    const formattedDate = date.toISOString().slice(0, 19).replace('T', ' ');

    const connection = await connectToDatabase();
    const insertQuery = `
        INSERT INTO hospitals (name, email_address, about, address, phone_number, emergency_number, date, image, physical_address)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    try {
        // Check if the email already exists
        const [existingHospital] = await connection.execute(`SELECT * FROM hospitals WHERE email_address = ?`, [hospitalData.email_address]);
        console.log("existingHospital:",existingHospital, "email_address:",hospitalData.email_address)
        if (existingHospital.length > 0) {
            throw new Error(`A doctor with the email ${hospitalData.email_address} already exists.`);
        }
    
        const [result] = await connection.execute(insertQuery, [
            hospitalData.name,
            hospitalData.email_address,
            hospitalData.about,
            hospitalData.address,
            hospitalData.phone_number,
            hospitalData.emergency_number,
            formattedDate,
            hospitalData.image,
            hospitalData.physical_address
        ]);
        console.log(result);

        // Check if the insert was successful and return the inserted record
        if (result.affectedRows > 0) {
            const [rows] = await connection.execute(`SELECT * FROM hospitals WHERE id = ?`, [result.insertId]);
            return rows[0]; // Return the newly created hospital record
        } else {
            throw new Error('Failed to insert hospital.');
        }
    } catch (error) {
        console.error('Error in insertHospitals:', );
        throw new Error('Database error: ' + error.message); // Provide a more informative error message
    } finally {
        // Ensure the connection is closed
        if (connection) {
            await connection.release();
        }
    }
};

export default insertHospital;