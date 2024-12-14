import connectToDatabase from '../config/db.js';
import moment from 'moment'

const insertDoctor = async (doctorData) => {
    // Validate input
    const requiredFields = ['name', 'email', 'image', 'password', 'speciality', 'degree', 'experience', 'about', 'fees', 'date'];
    for (const field of requiredFields) {
        if (!doctorData[field]) {
            throw new Error(`Missing required field: ${field}`);
        }
    }

    const connection = await connectToDatabase();
    const insertQuery = `
        INSERT INTO doctors (name, email, image, password, speciality, degree, experience, about, availability, fees, address, date, slots_booked)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    // Define the default slots booked
    const defaultSlotsBooked = JSON.stringify({ 
        "01-04-2023": ["10:00:00"], 
        "02-04-2023": ["14:00:00"], 
        "15_11_2023": ["08:30 PM"] 
    });
    // Convert the timestamp to DATETIME format 
    if (doctorData.date) {
         const datetime = moment(doctorData.date).format('YYYY-MM-DD HH:mm:ss'); 
         doctorData.date = datetime; 
        }
    
    try {
        // Check if the email already exists
        const [existingDoctor] = await connection.execute(`SELECT * FROM doctors WHERE email = ?`, [doctorData.email]);
        if (existingDoctor.length > 0) {
            throw new Error(`A doctor with the email ${doctorData.email} already exists.`);
        }
    
        const [result] = await connection.execute(insertQuery, [
            doctorData.name,
            doctorData.email,
            doctorData.image,
            doctorData.password,
            doctorData.speciality,
            doctorData.degree,
            doctorData.experience,
            doctorData.about,
            true, // Assuming availability is true by default
            doctorData.fees,
            JSON.stringify(doctorData.address),
            doctorData.date,
            defaultSlotsBooked // Use the default slots booked here
        ]);

        // Check if the insert was successful and return the inserted record
        if (result.affectedRows > 0) {
            const [rows] = await connection.execute(`SELECT * FROM doctors WHERE doctor_id = ?`, [result.insertId]);
            return rows[0]; // Return the newly created doctor record
        } else {
            throw new Error('Failed to insert doctor.');
        }
    } catch (error) {
        console.error('Error in insertDoctor:', error);
        throw new Error('Database error: ' + error.message); // Provide a more informative error message
    } finally {
        // Ensure the connection is closed
        if (connection) {
            await connection.release();
        }
    }
};

export default insertDoctor;