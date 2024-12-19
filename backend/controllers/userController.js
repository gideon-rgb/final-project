import validator from 'validator'
import bcrypt from 'bcrypt'
import createUsersTable from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import insertUser from '../models/userInserModule.js'
import connectToDatabase from '../config/db.js'
import {v2 as cloudinary} from 'cloudinary'
import createAppointmentsTable from '../models/appointmentModel.js'
import dotenv from 'dotenv';
import paypal from '@paypal/checkout-server-sdk'
import {
    ApiError,
    OrdersController,
    CheckoutPaymentIntent,
    Client,
    Environment,
    LogLevel, 
} from "@paypal/paypal-server-sdk";
import fetch from 'node-fetch';
import bodyParser from "body-parser";
import express, { response } from "express";

const app = express();
app.use(bodyParser.json());

dotenv.config();




// API TO REGISTER USER
const registerUser = async (req, res) => {

    try {
        // Ensure the user table exist
        await createUsersTable();
        
        // VALIDATING THE USER INPUTS
        const {name, email, password} = req.body
        if (!name || !email || !password) {
            return res.json({success:false, message:"missing details"})
        }

        //VALIDATING A VALID EMAIL
        if (!validator.isEmail(email)) {
            return res.json({success:false, message:"enter a valid email address"})
        }

        //  VALIDATING A STRONG PASSWORD
        if (password.length < 8) {
            return res.json({success:false, message:'enter a strong password'})
        }

        // HASHING USER PASSWORD
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const userData = {
            name,
            email,
            password: hashedPassword
        }

        const newUser = await insertUser(userData)
        console.log('newUser:',newUser)
        const user = newUser

        const token = jwt.sign({id:user.user_id}, process.env.JWT_SECRET)

        res.json({success:true, token})

    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: error.message });
    }
}

// api for user login

const loginUser  = async (req, res) => {
    let connection;
    try {
        const { email, password } = req.body;

        connection = await connectToDatabase();

        // SQL query to find the user by email
        const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);

        if (rows.length === 0) {
            return res.json({ success: false, message: 'User  does not exist' });
        }

        const user = rows[0]; // Get the first user from the result

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET);
            return res.json({ success: true, token });
        } else {
            return res.json({ success: false, message: 'Invalid Credentials' });
        }

    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: error.message });
    } finally {
        if (connection) {
            connection.release(); // Ensure the connection is released back to the pool
        }
    }
};

// API TO GET USER PROFILE
const getProfile = async (req, res)=> {
    try {
        const connection = await connectToDatabase();
        
        const {userId} =  req.body
        
        const mainUserData = await connection.execute('SELECT user_id, name, email, image, address, gender, dob, phone FROM users WHERE user_id = ?', [userId]);
        // Get the first user from the result
        let userInfoArray = mainUserData[0]; // This gives you the first array

// Check if userInfoArray has data and is not empty
if (userInfoArray && userInfoArray.length > 0) {
  const userData = userInfoArray[0];
        res.json({success:true, userData});
    } else {
        console.log('No user information found.');
      }

    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: error.message });
    }
}

// API TO UPDATE USER PROFILE

const updateProfile = async (req, res) => {
  let connection;
  try {
    const { userId, name, phone, image, address, gender, dob } = req.body;
    const imageFile = req.file; // Get the uploaded file from the request

    const dobInput = dob;
    console.log(dob)
    const DOB = new Date(dobInput);
    const year = DOB.getFullYear();
    const currentYear = new Date().getFullYear();
    const minYear = currentYear - 18;
    const allowedYears = Array.from(
      { length: 2030 - 1900 + 1 },
      (v, i) => 1900 + i
    );

    let isValidYear = false;

    for (let i = 0; i < allowedYears.length; i++) {
      if (year === allowedYears[i]) {
        isValidYear = true;
        break;
      }
    }

    if (!isValidYear) {
      return res.json({
        success: false,
        message: `Date of birth must be valid and not greater than ${minYear}.`,
      });
    }
    // Other major verification logic here
    const today = new Date();
    const age1 = today.getFullYear() - DOB.getFullYear();

    if (age1 < 18) {
      return res.json({
        success: false,
        message: "You must be at least 18 years old.",
      });
    }

    const dobTo = new Date(dob); 
    const formattedDob = dobTo.toISOString().split('T')[0]; // This will give you '2000-12-11'

    connection = await connectToDatabase();

    // Start a transaction
    await connection.beginTransaction();

    // Prepare the update query for user details
    const updateUserQuery = `
            UPDATE users 
            SET name = ?, phone = ?, address = ?, dob = ?, gender = ?
            WHERE user_id = ?;
        `;
    const params = [name, phone, address, formattedDob, gender, userId];

    // Execute the update query
    const [result] = await connection.execute(updateUserQuery, params);

    // Check if the update was successful
    if (result.affectedRows === 0) {
      return res.json({
        success: false,
        message: "User  not found or no changes made",
      });
    }

    // Handle image upload if a file is provided
    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
      const imageURL = imageUpload.secure_url; // Get the secure URL of the uploaded image
      console.log("imageurl:", imageURL);
      // Prepare the update query for the image
      const updateImageQuery = `
                UPDATE users 
                SET image = ?
                WHERE user_id = ?;
            `;
      const imageParams = [imageURL, userId];

      // Execute the update query for the image
      await connection.execute(updateImageQuery, imageParams);
    }

    // Commit the transaction
    await connection.commit();

    return res.json({ success: true, message: "User  updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    if (connection) await connection.rollback(); // Rollback in case of error
    return res.json({ success: false, message: error.message });
  } finally {
    if (connection) {
      await connection.release();
    } // Close the connection
  }
};

// API TO BOOK APPOINTMENTS

const bookAppointment = async (req, res) => {
    const { userId, docId, slotDate, slotTime } = req.body;

    let connection;
    try {
        connection = await connectToDatabase(); // Establish the database connection

        // Step 1: Retrieve doctor information
        const [doctorResults] = await connection.execute('SELECT doctor_id, name, email, speciality, degree, experience, about, availability, slots_booked, fees, date, image, address, hospital FROM doctors WHERE doctor_id = ?', [docId]);

        if (!doctorResults || doctorResults.length === 0) {
            return res.json({ success: false, message: 'Doctor not found' });
        }

        
        const doctor = doctorResults[0];
        if (!doctor.availability) {
            return res.json({ success: false, message: 'Doctor not available' });
        }
        
        
        // Step 2: Initialize slotsBooked
        let slotsBooked = {};
        if (doctor.slots_booked) {
            try {
                slotsBooked = doctor.slots_booked // Parse only if it's a string
            } catch (error) {
                console.error("Failed to parse slots_booked JSON:", error);
                return res.json({ success: false, message: 'Invalid slots booked data' });
            }
        }

        // Step 3: Ensure slotsBooked is structured correctly
        if (!slotsBooked[slotDate]) {
            slotsBooked[slotDate] = []; // Initialize as an array if it doesn't exist
        }


        // Check if the slotTime is already booked
        if (slotsBooked[slotDate].includes(slotTime)) {
            return res.json({ success: false, message: 'Slot not available' });
        } else {
            slotsBooked[slotDate].push(slotTime); // Add the booked slot
        }

    

        // Step 4: Get user data
        const [userResults] = await connection.execute('SELECT user_id, name, email, image, address, gender, dob, phone FROM users WHERE user_id = ?', [userId]);
        if (!userResults || userResults.length === 0) {
            return res.json({ success: false, message: 'User  not found' });
        }
        
        const user = userResults[0];
        const userData1 = JSON.stringify({
            id: user.user_id,
            name: user.name,
            email: user.email,
            image: user.image,
            address: user.address,
            gender: user.gender,
            dob: user.dob,
            phone: user.phone,
          });
          const docData1 = JSON.stringify({
            doctor_id: docId,
            fees: doctor.fees,
            name: doctor.name,
            email: doctor.email,
            slots_booked: JSON.stringify(slotsBooked),
            speciality: doctor.speciality,
            degree: doctor.degree,
            experience: doctor.experience,
            about: doctor.about,
            availability: doctor.availability,
            image: doctor.image,
            date: doctor.date,
            address: doctor.address,
            hospital: doctor.hospital
        });

        // Step 5: Prepare appointment data
        const appointmentData = {
            userId,
            docId,
            userData: userData1, // Convert user data to JSON string
            docData: docData1, // Convert docData to JSON string
            amount: doctor.fees,
            slotTime,
            slotDate,
            date: new Date(),
        };
        console.log("all id:",appointmentData.docData)
        
        // Step 6: Insert appointment record

        await createAppointmentsTable(appointmentData);

        await connection.execute('INSERT INTO appointments (userid, docId, slotDate, slotTime, userData, docData, amount, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
            [appointmentData.userId, appointmentData.docId, appointmentData.slotDate, appointmentData.slotTime, appointmentData.userData, appointmentData.docData, appointmentData.amount, appointmentData.date]);

        // Step 7: Update doctor's booked slots
        await connection.execute('UPDATE doctors SET slots_booked = ? WHERE JSON_VALID(slots_booked) IS NULL OR doctor_id = ?', [JSON.stringify(slotsBooked), docId]);

        return res.json({ success: true, message: 'Appointment booked' });

    } catch (error) {
        console.error('Error booking appointment:', error);
        return res.status(500).json({ success: false, message: 'An error occurred while booking the appointment' });
    } finally {
        if (connection) {
            await connection.release(); // Ensure the connection is released back to the pool
        }
    }
};


//API TO GET USER APPOINTMENTS FOR TRONTEND MY-APPOINTMENTSS PAGE
const listAppointment = async (req, res) => {
    let connection; // Declare the connection variable
    

    try {
        connection = await connectToDatabase(); // Assign the connection

        const { userId } = req.body; // Destructure userId from request body
        const [appointments] = await connection.execute('SELECT * FROM appointments WHERE userid = ?', [userId]); // Destructure appointments from the result
        //console.log('Appointments:', appointments); // Log the appointments
        return res.json({ success: true, appointments }); // Send the response
    } catch (error) {
        console.error('Error booking appointment:', error); // Log the error
        return res.status(500).json({ success: false, message: 'An error occurred while booking the appointment' }); // Send error response
    } finally {
        if (connection) { 
            await connection.release(); // Release the connection
        }
    }
}


// api to cancel  appointment
let appointmentId;

const cancelAppointment = async (req, res) => {
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

        const { userId:userid, docId, slotDate, slotTime } = appointmentData[0];

        // Step 2: Verify appointment user
        if (userid === userId) {
            return res.json({ success: false, message: 'Unauthorized action' });
        }

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
        return res.status(500).json({ success: false, message: 'An error occurred while cancelling the appointment' });
    } finally {
        if (connection) {
            await connection.release(); // Close the database connection
        }
    }
};

// const PAYPAL_API = 'https://api.paypal.com';
// const PAYPAL_CLIENT = process.env.PAYPAL_CLIENT_ID;
// const PAYPAL_SECRET = process.env.PAYPAL_CLIENT_SECRET;


// const client = new Client({
//   clientCredentialsAuthCredentials: {
//     oAuthClientId: PAYPAL_CLIENT,
//     oAuthClientSecret: PAYPAL_SECRET,
//   },
//   timeout: 0,
//   environment: Environment.Sandbox,
//   logging: {
//     logLevel: LogLevel.Info,
//     logRequest: { logBody: true },
//     logResponse: { logHeaders: true },
//   },
// });

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;

const client = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: PAYPAL_CLIENT_ID,
    oAuthClientSecret: PAYPAL_CLIENT_SECRET,
  },
  timeout: 0,
  environment: Environment.Sandbox,
  logging: {
    logLevel: LogLevel.Info,
    logRequest: {
      logBody: true,
    },
    logResponse: {
      logHeaders: true,
    },
  },
});

const ordersController = new OrdersController(client);

const createOrder1 = async (req, res) => {
  let connection;
  

  
    connection = await connectToDatabase(); // Establish database connection
    

    // if (!req.body ) {
    //   return res.json({ success: false, message: "Missing appointmentId in request body" });
    // }

    const { appointmentId } = req.params;
    console.log(`AppointmentId: ${appointmentId}`);
    

    if (!appointmentId) {
      return res.status(400).json({ success: false, message: "appointmentId is required" });
    }

    const appointmentData = await connection.query(
      'SELECT * FROM appointments WHERE id = ?',
      [appointmentId]
    );

    if (!appointmentData[0] || appointmentData[0].length === 0) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    const appointmentArray = appointmentData[0];
    const appointmentAmount = appointmentArray[0]; // Access the amount correctly
    const appointmentFees = Number(appointmentAmount.amount)

    

    const taxRate = 0.10; // 10% tax rate 
    const item_total = appointmentFees; // Example item total 
    const tax_total = Number(item_total * taxRate);
    const shipping_discount = 0.00;
    const insurance = 0.00;
    const handling = 0.00; // Example shipping and handling total
    const shipping = 0.00; // Example shipping

    const discountRate = 0.15; // 15% discount rate 
    let discount = 0.00; 
    if (item_total > 120) {
       discount = Number(item_total * discountRate); 
      }


    const mainTotalValue = Number(item_total + tax_total + shipping + handling + insurance - shipping_discount - discount)
    const mainTotalValueString = mainTotalValue.toFixed(2)
    const discountString = discount.toFixed(2)
    const totalTaxString = tax_total.toFixed(2)
    const appointFess = appointmentFees.toFixed(2).toString()
    console.log('Main Total:', mainTotalValue);

    // Use OrdersController for PayPal API call
    const collect = {
      body: {
        intent: 'CAPTURE',
        purchaseUnits: [{
          amount: {
            currencyCode: 'USD',
            value: mainTotalValueString, // Ensure amount is a string
            breakdown: {
              item_total: {
                currencyCode: 'USD',
                value: appointFess,
              },
              shipping: { 
                currencyCode: 'USD', 
                value: '0.00' 
              },
              handling: {
                currencyCode: 'USD',
                value: '0.00'
              },
              tax_total: {
                currencyCode: 'USD',
                value: totalTaxString
              },
              insurance: 
              { 
                currencyCode: 'USD', 
                value: '0.00' 
              }, 
              shipping_discount: { 
                currencyCode: 'USD', 
                value: '0.00' 
              },
              discount: 
              { 
                currencyCode: 'USD', 
                value: discountString }
            }
          },
          invoice_id: appointmentArray.id,
        }],
        prefer: "return=minimal",
      }
    };
    try {
      const { body, ...httpResponse } = await ordersController.ordersCreate(
        collect
      );
      
      // Get more response info...
      // const { statusCode, headers } = httpResponse;
      return {
        jsonResponse: JSON.parse(body),
        httpStatusCode: httpResponse.statusCode,
      };
    
  } catch (error) {
    console.error('Error processing payment:', error);
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    return res.json({ success: false, message: error.message });
  } finally {
    if (connection) {
      await connection.release(); // Close the database connection
    }
  }
};




/**
 * Capture payment for the created order to complete the transaction.
 * @see https://developer.paypal.com/docs/api/orders/v2/#orders_capture
 */
const captureOrder = async (orderID) => {
    const collect = {
        id: orderID,
        prefer: "return=minimal",
    };

    try {
        const { body, ...httpResponse } = await ordersController.ordersCapture(collect);
        // Get more response info...
        // const { statusCode, headers } = httpResponse;
        return {
            jsonResponse: JSON.parse(body),
            httpStatusCode: httpResponse.statusCode,
        };
    } catch (error) {
        if (error instanceof ApiError) {
            // const { statusCode, headers } = error;
            throw new Error(error.message);
        }
    }
};



const verifyPayPalPayment = async (req, res) => {
  let connection;

  connection = await connectToDatabase(); // Establish database connection

  const { response } = req.body
  if (!response || !response.id) { 
      return res.status(400).json({ success: false, message: 'Invalid request body: response or response.id is missing' }); 
  } 
//  const orderID = response.id;
  console.log('paypal_order_id:', orderID);
  
  // Create a PayPal client
  const environment = new paypal.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);
  const client = new paypal.core.PayPalHttpClient(environment);
  
  try {
      // Create a request to get the order details
      const request = new paypal.orders.OrdersGetRequest(orderID);

      // Execute the request to get order details
      const orderInfo = await client.execute(request);
      console.log('order info:',orderInfo);

      // Check if the payment was successful
      if (orderInfo.result.status == 'APPROVED') {
          // Capture the order
          const captureResponse = await captureOrder(orderInfo.result.id); // Use orderInfo.result.id for capturing
          console.log('Capture Response:', captureResponse);

          // Update the appointment in the database
          const appointmentmId = orderInfo.result.purchase_units[0].reference_id; // Assuming invoice_id is used as the appointment ID
          if(appointmentmId === 'default') {
            const appointmentId = response.appointmentid
          
          console.log('appointmentId:',appointmentId)
          const query = 'UPDATE appointments SET payment = ? WHERE id = ?';
          await connection.query(query, [true, appointmentId]);
          res.json({ success: true, message: "Payment successful", captureResponse });
          }

          
      } else {
          res.json({ success: false, message: "Payment failed" });
      }

  } catch (error) {
      console.error('Error verifying payment:', error); // Log the error
      return res.status(500).json({ success: false, message: 'An error occurred while verifying the payment' });
  }
};

// API FOR CANCELLING PAYPAL PEMENTS
const refundCapturedPayment = async (capturedPaymentId) => {
  const collect = {
      captureId: capturedPaymentId,
      prefer: "return=minimal",
  };

  try {
      const { body, ...httpResponse } =
          await paymentsController.capturesRefund(collect);
      // Get more response info...
      const { statusCode, headers } = httpResponse;
      return {
          jsonResponse: JSON.parse(body),
          httpStatusCode: httpResponse.statusCode,
      };
  } catch (error) {
      if (error instanceof ApiError) {
          const { statusCode, headers } = error;
          throw new Error(error.message);
      }
  }
};

// API FOR Updating the payment Status

const updatePaymentStatus = async ( req, res) => {
  let connection;
  try {
    connection = await connectToDatabase(); // Establish database connection
    const { orderData, appointmentId, status} = req.body
  console.log(orderData)
  const query = 'UPDATE appointments SET payment = ? WHERE id = ?';
  await connection.query(query, [status, appointmentId]);
  } catch (error) {
    console.error('Error booking appointment:', error); // Log the error
    return res.status(500).json({ success: false, message: 'An error occurred while booking the appointment' }); // Send error response
} finally {
    if (connection) { 
        await connection.release(); // Release the connection
    }
}
};

// API for orders and processing
const updatePaymentCost = async ( req, res) => {
  try {
    // use the cart information passed from the front-end to calculate the order amount detals
    const { cart } = req.body;
    
    const amount = calculateOrderAmount(cart); // implement the calculateOrderAmount function
    const collect = {
      body: {
        intent: CheckoutPaymentIntent.Capture,
        purchaseUnits: [
          {
            amount: {
              currencyCode: "USD",
              value: amount.toString(),
            },
          },
        ],
      },
      prefer: "return=minimal",
    };

    const { body, ...httpResponse } = await ordersController.ordersCreate(collect);
    const jsonResponse = JSON.parse(body);
    const httpStatusCode = httpResponse.statusCode;

    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    if (error instanceof ApiError) {
      console.error("Failed to create order:", error);
      res.status(500).json({ error: error.message });
    } else {
      console.error("Failed to create order:", error);
      res.status(500).json({ error: "Failed to create order." });
    }
} finally {
    if (connection) { 
        await connection.release(); // Release the connection
    }
}
  
};
// implement the calculateOrderAmount function
async function calculateOrderAmount(cart) {
    let connection
  connection = await connectToDatabase(); // Establish database connection
  // calculate the order amount based on the cart information
  // for example:
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

// API for getting hospital data

const getHospitalData = async (req, res) => {
  let connection;
  try {
    connection = await connectToDatabase();
    // get hospital data from the database based on the provided id
    //const hospitalId = req.params.id;
    const query = 'SELECT * FROM hospitals';
    const [hospital] = await connection.query(query);

    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    res.json({ success: true, hospital });
  } catch (error) {
    console.error('Error getting hospital data:', error);
    res.status(500).json({ success: false, message: 'An error occurred while getting hospital data' });
  } finally {
    if (connection) {
      await connection.release();
    }
  }
};

export { registerUser, getHospitalData, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment, updatePaymentStatus, createOrder1, verifyPayPalPayment, refundCapturedPayment };


  