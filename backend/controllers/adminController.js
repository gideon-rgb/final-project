import createDoctorsTable from '../models/doctorCreateModel.js'; 
import insertDoctor from '../models/doctorInsertModule.js'; 
import bcrypt from 'bcrypt'; 
import cloudinary from 'cloudinary'; 
import validator from 'validator'; 
import jwt from 'jsonwebtoken'; 
import getDoctors from '../models/doctorGetModule.js';
import connectToDatabase from '../config/db.js';


const addDoctor = async (req, res) => {
    try {
        // Ensure the doctors table exists
        await createDoctorsTable();

        const { name, email, password, speciality, degree, experience, about, fees, address } = req.body;
        const imageFile = req.file;

        // Check for missing details
        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !imageFile ) {
            return res.json({ success: false, message: "Missing required details" });
        }

        // Validate email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }

        // Validate strong password
        if (!validator.isStrongPassword(password, { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })) {
            return res.json({ success: false, message: "Password should be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character" });
        }

        // Hash the doctor's password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Upload image to Cloudinary
        let imageUrl = '';
        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
            imageUrl = imageUpload.secure_url;
            console.log('imageUrl:', imageUrl);
        }


        const doctorData = {
            name,
            email,
            image: imageUrl,
            password: hashedPassword,
            speciality,
            degree,
            experience,
            about,
            fees,
            address,
            date: Date.now()
        };
        

        // Insert the new doctor
        const newDoctor = await insertDoctor(doctorData);

        console.log('newDoctor:', newDoctor);

        // Check if newDoctor is defined and send appropriate response
        if (newDoctor) {
            return res.json({ success: true, message: "Doctor added successfully", doctor: newDoctor });
        } else {
            return res.json({ success: false, message: "Failed to create doctor record" });
        }
    } catch (error) {
        console.error('Error in addDoctor:', error);
        return res.json({ success: false, message: "Internal server error" });
    }
};

// API FOR THE ADMIN LIGIN
const loginAdmin = async (req, res) => {
    try {

        const { email, password } = req.body;
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            
            const token = jwt.sign(email+password, process.env.JWT_SECRET)
            res.json({ success: true, token });

        } else {
            return res.json({ success: false, message: "Invalid credentials" });
        }
        
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message:error.message });
    }
}

// API to get all doctors list for admin panel
const allDoctors = async (req, res) => {
    try {
        const doctors = await getDoctors();
        res.status(200).json({ success: true, doctors });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const appointmentAdmin = async (req, res) => {
    let connection;

    try {
        // Create a connection
        connection = await connectToDatabase();
        
        // Query to get all appointments
        const [appointments] = await connection.execute('SELECT * FROM appointments');
        res.json({ success: true, appointments });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    } finally {
        if (connection) {
            await connection.release(); // Close the connection
        }
    }
}

// api for appointment cancellation
const appointmentCancel = async (req, res) => {
    let connection;
     connection = await connectToDatabase(); // Establish database connection
    try {
       
        const { userId, appointmentId } = req.body; // Destructure userId and appointmentId from request body

        // Step 1: Get appointment data by appointmentId
        const [appointmentData] = await connection.query(
            'SELECT userid, docId, slotDate, slotTime FROM appointments WHERE id = ?',
            [appointmentId]
        );

        // Check if appointment exists
        if (appointmentData.length === 0) {
            return res.json({ success: false, message: 'Appointment not found' });
        }
        

        const {  docId, slotDate, slotTime } = appointmentData[0];

       

        // Step 3: Update the appointment to set it as cancelled
        await connection.query(
            'UPDATE appointments SET cancelled = TRUE WHERE id = ?',
            [appointmentId]
        );

        // Step 4: Get the current doctor's booked slots
        const [doctorData] = await connection.query(
            'SELECT slots_booked FROM doctors WHERE doctor_id = ?',
            [docId]
        );

        if (doctorData.length === 0) {
            return res.json({ success: false, message: 'Doctor not found' });
        }

        let slots_booked = doctorData[0].slots_booked;

        // Remove cancelled slot
        slots_booked[slotDate] = slots_booked[slotDate].filter(time => time !== slotTime);

        // Step 5: Update the doctor's booked slots
        await connection.query(
            'UPDATE doctors SET slots_booked = ? WHERE doctor_id = ?',
            [JSON.stringify(slots_booked), docId]
        );

        res.json({ success: true, message: 'Appointment Cancelled' });

    } catch (error) {
        console.error('Error cancelling appointment:', error); // Log the error
        return res.status(500).json({ success: false, message: error.message });
    } finally {
        if (connection) {
            await connection.release(); // Close the database connection
        }
    }
};

// api to get dashboard data for admin pannel
const adminDashboard = async (req, res) =>{

    let connection;
    connection = await connectToDatabase(); // Establish database connection

    try {

        const [doctors] = await connection.query('SELECT * FROM doctors');
        const [users] = await connection.query('SELECT * FROM users');
        const [appointments] = await connection.query('SELECT * FROM appointments');
        
        const dashData = {
            doctors: doctors.length,
            appointments: appointments.length,
            patients: users.length,
            latestAppointments: appointments.reverse().slice(0, 5) // Assuming you want the latest 5 appointments
        };
        
        // You can now use dashData as needed

        res.json({ success: true, dashData });
        
    } catch (error) {
        console.error('Error cancelling appointment:', error); // Log the error
        return res.status(500).json({ success: false, message: error.message });
    }

}

export { addDoctor, loginAdmin, allDoctors, appointmentAdmin, appointmentCancel, adminDashboard};