import connectToDatabase from '../config/db.js';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const changeAvailability = async (req, res) => {
    const { docId } = req.body;

    const connection = await connectToDatabase();

    try {
        // Step 1: Retrieve the doctor's current availability
        const [doctorData] = await connection.execute('SELECT availability FROM doctors WHERE doctor_id = ?', [docId]);

        // Check if the doctor exists
        if (doctorData.length === 0) {
            return res.status(404).json({ success: false, message: 'Doctor not found' });
        }

        // Step 2: Change the availability
        const newAvailability = !doctorData[0].availability; // Toggle availability
        await connection.execute('UPDATE doctors SET availability = ? WHERE doctor_id = ?', [newAvailability, docId]);

        // Step 3: Respond with success
        res.json({ success: true, message: 'Availability changed successfully' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    } finally {
        // Ensure the connection is closed
        if (connection) {
            await connection.release();
        }
    }
};

const doctorsList = async (req, res) => {
    const connection = await connectToDatabase();

    try {
        // SQL query to select doctors excluding password and email
        const [doctors] = await connection.execute(`
            SELECT doctor_id, name, image, speciality, degree, experience, about, availability, fees, address, date, slots_booked
            FROM doctors
        `);

        // Send the response with the list of doctors
        res.json({ success: true, doctors });

    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: error.message });
    } finally {
        // Ensure the connection is closed
        if (connection) {
            await connection.release();
        }
    }
};

// API for doctors login
const loginDoctor = async (req, res) => {
    const connection = await connectToDatabase();
    try {
        const { email, password } = req.body;

        // Step 1: Check if the doctor exists
        const [doctors] = await connection.execute('SELECT * FROM doctors WHERE email = ?', [email]);

        // if not
        if (doctors.length === 0) {
            return res.json({ success: false, message: 'Doctor does not exist' });
        }

        const doctor = doctors[0]; // Get the first doctor from the result

        // Compare the provided password with the stored hashed password

        const isMatch = await bcrypt.compare(password, doctor.password);

        if (isMatch) {
            
            const token = jwt.sign({ id: doctor.doctor_id }, process.env.JWT_SECRET);
            res.json({ success: true, token})

        } else {
            return res.json({ success: false, message: 'Invalid credentials' })
        }
        
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: error.message });
    } finally {
        // Ensure the connection is closed
        if (connection) {
            await connection.release();
        }
    }

}

// API to get doctor appointments for doctor panel
const appointmentsDoctor = async (req, res) => {
    const connection = await connectToDatabase();
    try {

        const {docId} = req.body
        

        // Step 1: Check if the doctor exists
        const [appointmentss] = await connection.execute('SELECT * FROM appointments WHERE docId = ?', [docId]);

        const appointments = appointmentss; // Get the first doctor from the result
        res.json({ success: true, appointments })
        
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: error.message });
    } finally {
        // Ensure the connection is closed
        if (connection) {
            await connection.release();
        }
    }
}

// API to mark the appointment completed
const appointmentComplete = async (req, res) => {
    const connection = await connectToDatabase();
    try {
        
        const {docId, appointmentId} = req.body
        // step 1: get the appointment details
        const appointmentDatas = await connection.execute('SELECT * FROM appointments WHERE id =?', [appointmentId]);
        

        const appointmentDatam = appointmentDatas[0];
        const appointmentData = appointmentDatam[0];
        
        if (appointmentData && appointmentData.docId == docId) {
           // Step 2: Update appointment status
        await connection.query('UPDATE appointments SET isCompleted = TRUE WHERE docId =? AND id =?', [docId, appointmentId]);
        return res.json({ success: true, message: 'Appointment completed' }); 
        } else {
            return res.json({ success: false, message: 'Mark Failed' });
        }

        

    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: error.message });
    } finally {
        // Ensure the connection is closed
        if (connection) {
            await connection.release();
        }
    }
}

// API to cancel the appointment for doctor panel
const appointmentCancel = async (req, res) => {
    const connection = await connectToDatabase();
    try {
        
        const {docId, appointmentId} = req.body
        // step 1: get the appointment details
        const appointmentDatas = await connection.execute('SELECT * FROM appointments WHERE id =?', [appointmentId]);
        const appointmentDatam = appointmentDatas[0];
        const appointmentData = appointmentDatam[0];

        if (appointmentData && appointmentData.docId == docId) {
           // Step 2: Update appointment status
        await connection.execute('UPDATE appointments SET cancelled = TRUE WHERE docId =? AND id =?', [docId, appointmentId]);
        return res.json({ success: true, message: 'Appointment cancelled' }); 
        } else {
            return res.json({ success: false, message: 'cancellation Failed' });
        }

        

    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: error.message });
    } finally {
        // Ensure the connection is closed
        if (connection) {
            await connection.release();
        }
    }
}

// API to get dashboard information/data for doctor panel

const doctorDashboard = async (req, res) => {
    const connection = await connectToDatabase();
    try {
        const { docId } = req.body

        // Step 1: Get appointments
        const [appointments] = await connection.execute('SELECT * FROM appointments WHERE docId =?', [docId]);

        let earnings = 0

        appointments.map((item)=>{
            if (item.isCompleted || item.payment) {
                earnings += JSON.parse(item.amount)
            }
        })

        let patients = [];
        appointments.map((item)=>{
            if (!patients.includes(item.userid)) {
                patients.push(item.userid)
            }
        })

        const dashData = {
            earnings,
            appointments: appointments.length,
            patients: patients.length,
            latestAppointments: appointments.reverse().slice(0,5)
        }

        res.json({success: true, dashData})

        // Step 2: Get upcoming appointments
        //const [upcomingAppointments] = await connection.execute('SELECT COUNT(*) as totalAppointments, SUM(isCompleted) as completedAppointments, SUM(cancelled) as cancelledAppointments FROM appointments WHERE docId =? AND appointment_date >= CURDATE()', [docId]);

        // Step 3: Get recent appointments
        //const [recentAppointments] = await connection.execute('SELECT * FROM appointments WHERE docId =? ORDER BY appointments DESC LIMIT 1', [docId])
        } catch (error) {
            console.error(error);
            return res.json({ success: false, message: error.message });
        } finally {
            // Ensure the connection is closed
            if (connection) {
                await connection.release();
            }
}
}

// API to get doctor profile for doctor panel
const doctorProfile = async (req, res) => {
    const connection = await connectToDatabase();
    try {
        const { docId } = req.body
        const [doctorProfile] = await connection.execute('SELECT doctor_id, name, speciality, degree, experience, about, availability, fees, address, date, image,slots_booked FROM doctors WHERE doctor_id = ?',[docId])
        const profileData = doctorProfile[0]
        res.json({success: true, profileData})
        
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: error.message });
    } finally {
        // Ensure the connection is closed
        if (connection) {
            await connection.release();
        }
    }
}

// API to update doctor profile for doctor panel
const updateDoctorProfile = async (req, res) => {
    const connection = await connectToDatabase();
    try {

        const { docId, availability, fees, address } = req.body

        await connection.query('UPDATE doctors SET availability =?, fees =?, address =? WHERE doctor_id =?', [availability, fees, address, docId]);
        
        res.json({success:true, message:'Profile Updated'})
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: error.message });
    } finally {
        // Ensure the connection is closed
        if (connection) {
            await connection.release();
        }
    }
}

export default changeAvailability
export { changeAvailability, doctorsList, loginDoctor, appointmentsDoctor, appointmentCancel,
         appointmentComplete, doctorDashboard, doctorProfile, updateDoctorProfile };