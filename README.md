Project Description: Telemedicine Application
Project Title: TeleMed: A Comprehensive Telemedicine Platform
Overview: TeleMed is a robust telemedicine platform designed to connect patients with healthcare providers virtually. The platform aims to make healthcare more accessible by allowing users to register, search for nearby health centers, book appointments with doctors, and consult with healthcare professionals online. Built using HTML, CSS, and JavaScript for the frontend, with a Node.js and MySQL backend, TeleMed offers a seamless user experience while ensuring secure and efficient management of medical services.

Key Features:
User Authentication and Role Management:
Registration and Login: Secure user registration and login system, with role-based access control for patients and doctors. Profile Management: Users can manage their profiles, update personal information, and view their appointment history.

Appointment Booking:
Doctor Availability: Patients can view doctors' availability and book appointments directly through the platform. Appointment Management: Users can schedule, reschedule, or cancel appointments, and receive notifications about their bookings.

Location-Based Services:
Health Center Locator: Integration with Google Maps API to help users find and view nearby health centers based on their current location or a specified area.

Doctor Management:
Specialization and Availability: Doctors can manage their availability, specializations, and appointment slots, ensuring patients have up-to-date information when booking. Consultation Services: The platform allows for virtual consultations through a secure communication channel.

User-Friendly Interface:
Responsive Design: The application features a clean, responsive design that ensures a seamless experience across all devices. Intuitive Navigation: Easy-to-use interface with clear navigation paths for all users, whether they are booking an appointment or managing their doctor profile.

Security and Compliance:
Data Security: Implementation of HTTPS, JWT-based authentication, and data encryption to protect user information. Compliance: Adherence to healthcare standards and regulations, ensuring that user data is handled with the utmost confidentiality.

paypal payment option for the appointment

### HOW TO RUN
## backend
# Create .env or rename the .env.example file.
fill in all the required variables, paypal variables are not a must for the project to run.

## frontend
# Create .env file and create a variable called VITE_BACKEND_URL='' 
 You may add googles map api keys. not a must.
# Edite the vite.config.js file incase the import.meta.env.VITE_BACKEND_URL is not working to the server

## admin
# Create .env file and create a variable called VITE_BACKEND_URL='' 
