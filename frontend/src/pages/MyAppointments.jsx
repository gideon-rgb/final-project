import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import "/src/index.css";

function Message({ content }) {
  return <p>{content}</p>;
}
Message.propTypes = { content: PropTypes.string.isRequired };

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData, clientId } =
    useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const [showPayPal, setShowPayPal] = useState(false);
  const [appointmentId, setAppointmentId] = useState(null);
  const months = [
    "",
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split("_");
    return `${dateArray[0]} ${months[Number(dateArray[1])]} ${dateArray[2]}`;
  };

  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/appointments`, {
        headers: { token },
      });
      if (data.success) {
        setAppointments(data.appointments.reverse());
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const cancelAppointments = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/cancel-appointment`,
        { appointmentId },
        { headers: { token } },
      );
      if (data.success) {
        setAppointments((prevAppointments) =>
          prevAppointments.filter((item) => item.id !== appointmentId),
        );
        toast.success(data.message);
        getDoctorsData(); // Refresh doctors data if needed
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (token) {
      getUserAppointments();
    }
  }, [token]);

  return (
    <div>
      <p className="pb-3 mt-12 font-medium border-b text-zinc-700">
        My appointments
      </p>
      <div>
        {appointments.length === 0 ? (
          <p>No appointments found.</p>
        ) : (
          appointments.map((item, index) => (
            <div
              className="grid grid-cols-[1fr_3fr] gap-4 sm:flex sm:gap-6 py-2 border-b"
              key={index}
            >
              <div>
                <img
                  className="w-32 bg-indigo-50"
                  src={item.docData.image}
                  alt=""
                />
              </div>
              <div className="flex-1 text-sm text-zinc-600">
                <p className="font-semibold text-neutral-800">
                  {item.docData.name}
                </p>
                <p>{item.docData.speciality}</p>
                <p className="mt-1 font-medium text-zinc-700">Address</p>
                <p className="text-xs">{item.docData.address.line1}</p>
                <p className="text-xs">{item.docData.address.line2}</p>
                <p className="mt-1 text-xs">
                  <span className="text-sm font-medium text-neutral-700">
                    Date & Time:
                  </span>
                  {slotDateFormat(item.slotDate)} | {item.slotTime}
                </p>
              </div>
              <div className="flex flex-col justify-end gap-2 text-white">
                {!item.cancelled && item.payment && (
                  <button className="w-48 py-2 border rounded sm:min text-stone-500">
                    Paid
                  </button>
                )}
                {!item.cancelled && !item.isCompleted && !item.payment && (
                  <button
                    onClick={() => {
                      navigate(`/payment/${item.id}`);
                      setAppointmentId(item.id);
                    }}
                    className="py-2 text-sm text-center transition-all duration-300 border text-stone-500 sm:min-w-48 hover:bg-primary hover:text-white"
                  >
                    Pay Online
                  </button>
                )}
                {!item.cancelled && !item.isCompleted && (
                  <button
                    onClick={() => cancelAppointments(item.id)}
                    className="py-2 text-sm text-center transition-all duration-300 border text-stone-500 sm:min-w-48 hover:bg-red-600 hover:text-white"
                  >
                    Cancel appointment
                  </button>
                )}
                {!item.isCompleted && JSON.parse(item.cancelled) && (
                  <button
                    onClick={() => {
                      navigate(`/appointment/${item.docData.doctor_id}`);
                      scrollTo(0, 0);
                    }}
                    className="py-2 text-red-500 border border-red-500 rounded sm:min-w-48"
                  >
                    Appointment cancelled
                  </button>
                )}
                {item.isCompleted && (
                  <button className="py-2 text-green-500 border border-green-500 rounded sm:min-w-48">
                    Completed
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyAppointments;
