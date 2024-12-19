import { createContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import PropTypes from "prop-types"; // Import PropTypes

export const AppContext = createContext();
const AppContextProvider = (props) => {
  const currencySymbol = "$";
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  let clientId =
    import.meta.env.PAYPAL_CLIENT_ID;
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [token, setToken] = useState(
    localStorage.getItem("token") ? localStorage.getItem("token") : false,
  );
  const [userData, setUserData] = useState(false);
  const [appointments, setAppointments] = useState([]);

  const getDoctorsData = async () => {
    try {
      const { data } = await axios.get(backendUrl + `/api/doctors/list`);
      //console.log(data)
      if (data.success) {
        setDoctors(data.doctors);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const loadUserProfileData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/get-profile", {
        headers: { token },
      });
      if (data.success) {
        setUserData(data.userData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const getUserHospitals = useCallback(async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/hospitals`, {
        headers: { token },
      });

      if (data.success) {
        const maindata = data.hospital;
        console.log(maindata);
        setHospitals(maindata);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  }, [token]);

  const loadAppointmentData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/appointments", {
        headers: { token },
      });
      if (data.success) {
        setAppointments(data.appointments);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const value = {
    doctors,
    getDoctorsData,
    currencySymbol,
    token,
    setToken,
    backendUrl,
    clientId,
    userData,
    setUserData,
    loadUserProfileData,
    loadAppointmentData,
    appointments,
    setAppointments,
    getUserHospitals,
    hospitals,
    setHospitals,
  };

  useEffect(() => {
    // Fetch data when the component mounts
    getDoctorsData();
    if (token) {
      loadUserProfileData();
      getUserHospitals(); // Fetch hospitals when the token is available
      loadAppointmentData(); // Optionally load appointments if needed
    }
  }, [token]); // Dependency on token to refetch when it changes

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

// Define prop types for the component
AppContextProvider.propTypes = {
  children: PropTypes.node.isRequired, // Validate that children is a required prop
};

export default AppContextProvider;
