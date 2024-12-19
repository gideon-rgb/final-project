import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";

const HospitalsInfo = () => {
  const { id } = useParams();
  console.log(id);
  const { doctors, hospitals } = useContext(AppContext);
  const navigate = useNavigate();
  const [doctors1, setDoctors1] = useState([]);
  const { speciality } = useParams();
  const [filterDoc, setFilterDoc] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [hosInfo, setHosInfo] = useState(null); // Initialize as null
  const [loading, setLoading] = useState(true);

  // Fetch hospital info based on the ID
  useEffect(() => {
    const fetchHosInfo = () => {
      const HosIdNumber = Number(id);
      const hospital = hospitals.filter((e) => e.id === HosIdNumber);
      setHosInfo(hospital || null); // Set to null if not found
    };

    if (hospitals.length > 0) {
      fetchHosInfo();
    }
  }, [hospitals, id]); // Only run when hospitals or id changes

 

  // Fetch doctors based on the hospital info
  useEffect(() => {
    if (hosInfo) {
      const hospitalName = hosInfo[0].name;
      const filteredDoctors = doctors.filter(
        (e) => e.hospital === hospitalName,
      );
      setDoctors1(filteredDoctors);
    }
  }, [hosInfo, doctors]); // Run when hosInfo or doctors change

  // Apply filter based on speciality
  useEffect(() => {
    if (speciality) {
      setFilterDoc(doctors1.filter((doc) => doc.speciality === speciality));
    } else {
      setFilterDoc(doctors1);
    }
  }, [speciality, doctors1]); // Run when speciality or doctors1 change

  // Loading state
  useEffect(() => {
    setLoading(hospitals.length === 0 || doctors.length === 0);
  }, [hospitals, doctors]); // Set loading based on hospitals and doctors

  if (loading) {
    return <div>Loading...</div>; // Show loading indicator while fetching data
  }

  if (!hosInfo) {
    return <div>No hospital information available.</div>; // Handle case where hospital info is not found
  }
  
  const latitude = hosInfo[0].physical_address.latitude;
  const longitude = hosInfo[0].physical_address.longitude;

  const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
  return (
    doctors1 && (
      <div>
        {/*-----------  doctors details  ------------------*/}
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <img
              className="bg-primary w-full sm:max-w-72 rounded-lg"
              src={hosInfo[0].image}
              alt=""
            />
          </div>
          <div>
            {hosInfo.length === 0 ? (
              <p>No hospitals found.</p>
            ) : (
              hosInfo.map((item, index) => (
                <div key={index}>
                  <div className="flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0">
                    <p className="flex items-center gap-2 text-2xl font-medium text-gray-900">
                      {item.name}
                      <img className="w-5" src={assets.verified_icon} alt="" />
                    </p>
                    <p className="text-xl mt-1 font-medium text-zinc-700">
                      Email Address
                    </p>
                    <p>{item.email_address}</p>
                    <p className="text-xl mt-1 font-medium text-zinc-700">
                      Address
                    </p>
                    <div>
                      <p>Zip: {item.address.zip}</p>
                      <p>City: {item.address.city}</p>
                      <p>State: {item.address.state}</p>
                      <p>Street: {item.address.street}</p>
                    </div>
                    <p className="mt-1 text-xs">
                      <span className="text-xl text-neutral-700 font-bold">
                        Phone & Emergency Department
                      </span>
                    </p>
                    <p className="text-xs text-green-700 font-semibold">
                      <img
                        className="w-4 h-4"
                        src={assets.phonecall_icon}
                        alt=""
                      />{" "}
                      Phone {hosInfo[0].phone_number}
                    </p>
                    <p className="text-xs text-red-600 font-semibold">
                      <img
                        className="w-4 h-4"
                        src={assets.phonecall_icon}
                        alt=""
                      />{" "}
                      Emergency Department {hosInfo[0].emergency_number}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="flex justify-end">
            <div className="flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-5px] sm:mt-0 text-xl font-bold">
              <p>Physical Address: </p>
              <p className="text-sm font-medium mt-2">
                {hosInfo[0].physical_address.full_address}
              </p>
              <p className="flex items-center gap-1 text-xl font-bold text-gray-900 mt-2">
                About: <img src={assets.info_icon} alt="" />
              </p>
              <p className="text-sm font-medium mt-2">{hosInfo[0].about}</p>
              <div>
                {" "}
                <button className="py-2 mt-2 text-xl text-center transition-all duration-300 border text-blue-500 sm:min-w-48 hover:bg-primary hover:text-white">
                  <a
                    href={googleMapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {" "}
                    View on Google Maps{" "}
                  </a>{" "}
                </button>{" "}
              </div>
            </div>
          </div>
        </div>

        {/* ------------------  hospitals ? doctors ------------------------- */}
        <div>
          <p className="text-gray-600">Browse through the doctors speciality</p>
          <div className="flex flex-col sm:flex-row items-start gap-5 mt-5">
            <button
              className={`py-1 px-3 border rounded text-sm transition-all sm:hidden ${showFilter ? "bg-primary text-white" : ""}`}
              onClick={() => setShowFilter((prev) => !prev)}
            >
              Filters
            </button>
            <div
              className={` flex-col gap-4 text-sm text-gray-600 ${showFilter ? "flex" : "hidden sm:flex"}`}
            >
              <p
                onClick={() =>
                  speciality === "General physician"
                    ? navigate(`/hospitals/${id}`)
                    : navigate(`/hospitals/${id}/General physician`)
                }
                className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "General physician" ? "bg-indigo-100 text-black" : ""}`}
              >
                General physician
              </p>
              <p
                onClick={() =>
                  speciality === "Gynecologist"
                    ? navigate(`/hospitals/${id}`)
                    : navigate(`/hospitals/${id}/Gynecologist`)
                }
                className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "Gynecologist" ? "bg-indigo-100 text-black" : ""}`}
              >
                Gynecologist
              </p>
              <p
                onClick={() =>
                  speciality === "Dermatologist"
                    ? navigate(`/hospitals/${id}`)
                    : navigate(`/hospitals/${id}/Dermatologist`)
                }
                className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "Dermatologist" ? "bg-indigo-100 text-black" : ""}`}
              >
                Dermatologist
              </p>
              <p
                onClick={() =>
                  speciality === "Pediatricians"
                    ? navigate(`/hospitals/${id}`)
                    : navigate(`/hospitals/${id}/Pediatricians`)
                }
                className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "Pediatricians" ? "bg-indigo-100 text-black" : ""}`}
              >
                Pediatricians
              </p>
              <p
                onClick={() =>
                  speciality === "Neurologist"
                    ? navigate(`/hospitals/${id}`)
                    : navigate(`/hospitals/${id}/Neurologist`)
                }
                className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "Neurologist" ? "bg-indigo-100 text-black" : ""}`}
              >
                Neurologist
              </p>
              <p
                onClick={() =>
                  speciality === "Gastroenterologist"
                    ? navigate(`/hospitals/${id}`)
                    : navigate(`/hospitals/${id}/Gastroenterologist`)
                }
                className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "Gastroenterologist" ? "bg-indigo-100 text-black" : ""}`}
              >
                Gastroenterologist
              </p>
            </div>
            <div className="w-full grid grid-cols-auto gap-4 gap-y-6">
              {filterDoc.map((item, index) => (
                <div
                  onClick={() => navigate(`/appointment/${item.doctor_id}`)}
                  className="border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500"
                  key={index}
                >
                  <img className="bg-blue-50 " src={item.image} alt="" />
                  <div className="p-4">
                    <div
                      className={`flex items-center gap-2 text-sm text-center ${item.availability ? "text-green-500" : "text-gray-500"}`}
                    >
                      <p
                        className={`w-2 h-2 ${item.availability ? "bg-green-500" : "bg-gray-500"} rounded-full`}
                      ></p>
                      <p>{item.availability ? "Available" : "Not Available"}</p>
                    </div>
                    <p className="text-gray-900 text-lg font-medium">
                      {item.name}
                    </p>
                    <p className="text-gray-600 text-sm">{item.speciality}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default HospitalsInfo;
