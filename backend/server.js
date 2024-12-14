import express from 'express';
// import helmet from 'helmet'
import cors from 'cors';
import 'dotenv/config'
import connectToDatabase from './config/db.js'
import connectCloudinary from './config/cloudinary.js';
import adminRouter from './routes/adminRoute.js';
import doctorRouter from './routes/doctorRoute.js';
import userRouter from './routes/userRoutes.js';
//import paypalRouter from './routes/paypalRoute.js'; // Import the PayPal routes
import bodyParser from "body-parser";
import dotenv from 'dotenv';
import {
  ApiError,
  CheckoutPaymentIntent,
  Client,
  Environment,
  LogLevel,
  OrdersController,
} from "@paypal/paypal-server-sdk";
//import {updatePaymentCost} from './controllers/userController.js'

// app config
const app = express();
app.use(bodyParser.json());
app.use(cors());

const port = process.env.PORT || 4000
connectToDatabase()
connectCloudinary()
// import "dotenv/config";
dotenv.config();

// middleware
// app.use(express.json());
// // CORS middleware

// // Content Security Policy (CSP) middleware

// app.use(helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'"],
//       scriptSrc: ["'self'", "https://*.paypal.com", "https://*.paypalobjects.com"],
//       styleSrc: ["'self'", "https://*.paypal.com", "https://*.paypalobjects.com"],
//       connectSrc: ["'self'", "https://*.paypal.com", "https://*.paypalobjects.com"],
//       frameSrc: ["https://*.paypal.com", "https://*.paypalobjects.com"],
//       imgSrc: ["'self'", "https://*.paypal.com", "https://*.paypalobjects.com"],
//       // other directives...
//     },
//   }));

app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "frame-ancestors 'self' https://www.sandbox.paypal.com");
    next();
  });
  

app.use(bodyParser.urlencoded({ extended: true }));

//api endpoints
app.use('/api/admin', adminRouter)
app.use('/api/doctors', doctorRouter)
app.use('/api/user', userRouter)
//app.use('/api/paypal', paypalRouter); // Use the PayPal routes

app.get(' /',(req,res)=> {
    res.send(' API WORKING sussesifuly');
})

////***************paypal api***********************/////////





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

/**
 * Create an order to start the transaction.
 * @see https://developer.paypal.com/docs/api/orders/v2/#orders_create
 */
const createOrder = async (cart) => {
  const {cart1} = await calculateOrderAmount(cart);
  console.log(cart1)
  const collect = {
    body: {
      intent: CheckoutPaymentIntent.Capture,
      purchaseUnits: [
        {
          amount: {
            currencyCode: "USD",
            value: cart1.price ,
          },
        },
      ],
    },
    prefer: "return=minimal",
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
    if (error instanceof ApiError) {
      // const { statusCode, headers } = error;  
      throw new Error(error.message);
    }
  }
};

async function calculateOrderAmount(cart) { 
  console.log("calculateOrderAmount:",cart)
  let connection 
  try { connection = await connectToDatabase(); // Establish database connection

const appId = cart[0].id; 
console.log(appId);
const query = `SELECT amount FROM appointments WHERE id = ? `
const result = await connection.query(query, [appId]) 
//let cart1 = { price: result };
console.log("results:", result[0])
const amountsql = result[0];
let cart1 = { price: amountsql[0].amount }
console.log("cart1:", cart1)

return { cart1};
} catch (error) { console.error('Error fetching amount appointment:', error); // Log the error 
return res.status(500).json({ success: false, message: 'An error occurred fetching amount appointment' }); 
} finally { 
if (connection) { await connection.release(); // Close the database connection 
  } } }


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
    const { body, ...httpResponse } = await ordersController.ordersCapture(
      collect
    );
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


app.post("/api/user/orders", async (req, res) => {
  try {
    // use the cart information passed from the front-end to calculate the order amount detals
    const { cart } = req.body;
    const { jsonResponse, httpStatusCode } = await createOrder(cart);
    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error("Failed to create order:", error);
    res.status(500).json({ error: "Failed to create order." });
  }
});

app.post("/api/user/orders/:orderID/capture", async (req, res) => {
  try {
    const { orderID } = req.params;
    const { jsonResponse, httpStatusCode } = await captureOrder(orderID);
    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error("Failed to create order:", error);
    res.status(500).json({ error: "Failed to capture order." });
  }
});


//start server
app.listen(port, () => {
    console.log(`Server is running at: http://localhost:${port}`);
});
//th end..........................................















