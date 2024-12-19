import React, { useContext, useEffect, useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import PropTypes from "prop-types";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

// Renders errors or successfull transactions on the screen.
function Message({ content }) {
  return <p>{content}</p>;
}
Message.propTypes = { content: PropTypes.string.isRequired };

function PayMent() {
  const { appointmentId } = useParams();
  const [appointmentInfo, setAppointmentInfo] = useState([]);
  const [userAppointmentsInfo, setUserAppointmentsInfo] = useState([]);
  const [message, setMessage] = useState("");
  const { backendUrl, currencySymbol, token, clientId } =
    useContext(AppContext);
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



  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split("_");
    return `${dateArray[0]} ${months[Number(dateArray[1])]} ${dateArray[2]}`;
  };

  const initialOptions = {
    "client-id": clientId,
    "enable-funding": "venmo",
    "buyer-country": "US",
    currency: "USD",
    components: "buttons",
  };

 
  const upDateServerDataBase = async (orderData) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/appointment/updatePayment/${appointmentId}`,
        { status: true, orderData, appointmentId },
        { headers: { token } },
      );
      if (data.success) {
        toast.success(data.message);
        navigate("/my-appointments");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/appointments`, {
        headers: { token },
      });
      if (data.success) {
        setAppointmentInfo(data.appointments.reverse());
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const fetchApptInfo = async (appointmentId) => {
    const appointmentIdNumber = Number(appointmentId); // Ensure docId is a number
    const userDataInfo = appointmentInfo.find(
      (app) => app.id == appointmentIdNumber,
    );
    console.log(userDataInfo);
    setUserAppointmentsInfo(userDataInfo);
  };



  useEffect(() => {
    getUserAppointments();
  }, []);
  useEffect(() => {
    if (appointmentInfo.length > 0) {
      fetchApptInfo(appointmentId);
    }
  }, [appointmentInfo, appointmentId]);
  return (
    userAppointmentsInfo &&
    appointmentInfo && (
      <div>
        {/*-----------  doctors details  ------------------*/}
        {userAppointmentsInfo.length === 0 ? (
          <p>No doctor found.</p>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row">
            <div>
              <img
                className="w-full rounded-lg bg-primary sm:max-w-72"
                src={userAppointmentsInfo.docData.image}
                alt=""
              />
            </div>

            <div className="flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0">
              {/* -------------  doc info : name, degree experience ----------------------------*/}
              <p className="flex items-center gap-2 text-2xl font-medium text-gray-900">
                {userAppointmentsInfo.docData.name}
                <img className="w-5" src={assets.verified_icon} alt="" />
              </p>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                <p>
                  {userAppointmentsInfo.docData.degree} -{" "}
                  {userAppointmentsInfo.docData.speciality}
                </p>
                <button className="py-0.5 px-2 border text-xs rounded-full">
                  {userAppointmentsInfo.docData.experience}
                </button>
              </div>

              {/* ------------------- Doctor About -------------------------------------- */}
              <div>
                <p className="flex items-center gap-1 mt-3 text-sm font-medium text-gray-900">
                  About <img src={assets.info_icon} alt="" />
                </p>
                <p className="text-sm text-gray-500 max-w-[700px] mt-1">
                  {userAppointmentsInfo.docData.about}
                </p>
              </div>
              <p className="text-gray-500 font-medium mt-4">
                Practices at:{" "}
                <span className="text-gray-600">
                  {userAppointmentsInfo.docData.hospital}
                </span>
              </p>
              <p className="mt-4 font-medium text-gray-500">
                Appointment fee:{" "}
                <span className="text-gray-600">
                  {currencySymbol}
                  {userAppointmentsInfo.docData.fees}
                </span>
              </p>
            </div>
          </div>
        )}
        {/**-----------------------appointments info--------------------------------------------- */}
        {userAppointmentsInfo.length === 0 ? (
          <p>No appointments found.</p>
        ) : (
          <div className="grid grid-cols-[1fr_3fr] gap-4 sm:flex sm:gap-6 py-2 border-b">
            <div>
              <img
                className="w-32 bg-indigo-50"
                src={userAppointmentsInfo.docData.image}
                alt=""
              />
            </div>
            <div className="flex-1 text-sm text-zinc-600">
              <p className="font-semibold text-neutral-800">
                {userAppointmentsInfo.docData.name}
              </p>
              <p>{userAppointmentsInfo.docData.speciality}</p>
              <p className="mt-1 font-medium text-zinc-700">Address</p>
              <p className="text-xs">
                {userAppointmentsInfo.docData.address.line1}
              </p>
              <p className="text-xs">
                {userAppointmentsInfo.docData.address.line2}
              </p>
              <p className="mt-1 text-xs">
                <span className="text-sm font-medium text-neutral-700">
                  Date & Time:
                </span>
                {slotDateFormat(userAppointmentsInfo.slotDate)} |{" "}
                {userAppointmentsInfo.slotTime}
              </p>
            </div>
            <div className="flex flex-col justify-end gap-2 text-white">
              {!userAppointmentsInfo.cancelled &&
                userAppointmentsInfo.payment && (
                  <button className="w-48 py-2 border rounded sm:min text-stone-500">
                    Paid
                  </button>
                )}
              {!userAppointmentsInfo.cancelled && (
                <button
                  onClick={() => {
                    navigate("/my-appointments");
                  }}
                  className="py-2 text-sm text-center transition-all duration-300 border text-stone-500 sm:min-w-48 hover:bg-primary hover:text-white"
                >
                  Other Appointments
                </button>
              )}
            </div>
          </div>
        )}

        {/*------------------------paypal payment-------------------------------------------*/}
        <div className="paypal-button-container">
          <PayPalScriptProvider options={initialOptions}>
            <PayPalButtons
              style={{
                shape: "rect",
                layout: "vertical",
                color: "gold",
                label: "paypal",
              }}
              createOrder={async () => {
                try {
                  const response = await fetch("/api/user/orders", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    // use the "body" param to optionally pass additional order information
                    // like product ids and quantities
                    body: JSON.stringify({
                      cart: [
                        {
                          id: appointmentId,
                          quantity: 1,
                          cost: userAppointmentsInfo.amount,
                        },
                      ],
                    }),
                  });

                  const orderData = await response.json();

                  if (orderData.id) {
                    return orderData.id;
                  } else {
                    const errorDetail = orderData?.details?.[0];
                    const errorMessage = errorDetail
                      ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
                      : JSON.stringify(orderData);

                    throw new Error(errorMessage);
                  }
                } catch (error) {
                  console.error(error);
                  setMessage(`Could not initiate PayPal Checkout...${error}`);
                }
              }}
              onApprove={async (data, actions) => {
                try {
                  const response = await fetch(
                    `/api/user/orders/${data.orderID}/capture`,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                    },
                  );

                  const orderData = await response.json();

                  // Three cases to handle:
                  //   (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
                  //   (2) Other non-recoverable errors -> Show a failure message
                  //   (3) Successful transaction -> Show confirmation or thank you message

                  const errorDetail = orderData?.details?.[0];

                  if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
                    // (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
                    // recoverable state, per https://developer.paypal.com/docs/checkout/standard/customize/handle-funding-failures/
                    return actions.restart();
                  } else if (errorDetail) {
                    // (2) Other non-recoverable errors -> Show a failure message
                    throw new Error(
                      `${errorDetail.description} (${orderData.debug_id})`,
                    );
                  } else {
                    // (3) Successful transaction -> Show confirmation or thank you message
                    // Or go to another URL:  actions.redirect('thank_you.html');
                    const transaction =
                      orderData.purchase_units[0].payments.captures[0];
                    setMessage(
                      `Transaction ${transaction.status}: ${transaction.id}. See console for all available details`,
                    );
                    if (transaction.status == "COMPLETED") {
                      upDateServerDataBase(orderData);
                    }
                    console.log(
                      "Capture result",
                      orderData,
                      JSON.stringify(orderData, null, 2),
                    );
                    navigate("/my-appointments");
                  }
                } catch (error) {
                  console.error(error);
                  setMessage(
                    `Sorry, your transaction could not be processed...${error}`,
                  );
                }
              }}
            />
          </PayPalScriptProvider>
          <Message content={message} />
        </div>
      </div>
    )
  );
}

export default PayMent;
