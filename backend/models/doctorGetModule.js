import connectToDatabase from '../config/db.js';

const getDoctors = async () => {
    const connection = await connectToDatabase();
    const selectQuery = `
        SELECT doctor_id, name, email, image, speciality, degree, experience, about, availability, fees, address, date, hospital
        FROM doctors
    `;

    try {
        const [doctors] = await connection.execute(selectQuery);
        return doctors; // Return the list of doctors without password and old image
    } catch (error) {
        console.error('Error in getDoctors:', error);
        throw new Error('Database error: ' + error.message); // Provide a more informative error message
    } finally {
        // Ensure the connection is closed
        if (connection) {
            await connection.release();
        }
    }
};

export default getDoctors;