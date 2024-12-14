import React, { useContext } from "react";
import { Route, Routes } from "react-router-dom";

import About from "./pages/About";
import Login from "./pages/Login";
import Myprofile from "./pages/Myprofile";
import MyAppointments from "./pages/MyAppointments";
import Appointment from "./pages/Appointment";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Contact from "./pages/Contact";
import Doctors from "./pages/doctors";
import Home from "./pages/home";
import PayMent from "./pages/payMent";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { AppContext } from "./context/AppContext";

const App = () => {
  const { clientId } = useContext(AppContext);

  return (
    <PayPalScriptProvider options={{ "client-id": clientId }}>
      <div className="mx-4 sm:mx-[10%]">
        <ToastContainer />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/doctors/:speciality" element={<Doctors />} />
          <Route path="/login" element={<Login />} />
          <Route path="/my-profile" element={<Myprofile />} />
          <Route path="/my-appointments" element={<MyAppointments />} />
          <Route path="/appointment/:docId" element={<Appointment />} />
          <Route path="/payment/:appointmentId" element={<PayMent />} />
        </Routes>
        <Footer />
      </div>
    </PayPalScriptProvider>
  );
};

export default App;
