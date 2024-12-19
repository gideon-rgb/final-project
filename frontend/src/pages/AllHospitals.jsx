import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import "/src/index.css";
import { assets } from "../assets/assets";

function Message({ content }) {
  return <p>{content}</p>;
}
Message.propTypes = { content: PropTypes.string.isRequired };

const Hospitals = () => {
  const { hospitals } = useContext(AppContext);
  const navigate = useNavigate();

  return (
    <div>
      <p className="pb-3 mt-12 font-medium border-b text-zinc-700">Hospitals</p>
      <div>
        {hospitals.length === 0 ? (
          <p>No hospitals found.</p>
        ) : (
          hospitals.map((item, index) => (
            <div
              className="grid grid-cols-[1fr_3fr] gap-4 sm:flex sm:gap-6 py-2 border-b"
              key={index}
            >
              <div>
                <img className="w-32 bg-indigo-50" src={item.image} alt="" />
              </div>
              <div className="flex-1 text-sm text-zinc-600">
                <p className="font-semibold text-neutral-800">{item.name}</p>
                <p className="mt-1 font-medium text-zinc-700">Email Address</p>
                <p>{item.email_address}</p>
                <p className="mt-1 font-medium text-zinc-700">Address</p>
                <div>
                  <p>Zip: {item.address.zip}</p>
                  <p>City: {item.address.city}</p>
                  <p>State: {item.address.state}</p>
                  <p>Street: {item.address.street}</p>
                </div>
                <p className="mt-1 text-xs">
                  <span className="text-sm font-medium text-neutral-700">
                    Phone & Emergency Department
                  </span>
                </p>
                <p className="text-xs text-green-700 font-semibold">
                  <img className="w-4 h-4" src={assets.phonecall_icon} alt="" />{" "}
                  Phone {item.phone_number}
                </p>{" "}
                <p className="text-xs text-red-600 font-semibold">
                  <img className="w-4 h-4" src={assets.phonecall_icon} alt="" />{" "}
                  Emergency Department {item.emergency_number}
                </p>
              </div>
              <div className="flex flex-col justify-end gap-2 text-white">
                {
                  <button
                    onClick={() => {
                      navigate(`/hospitals/${item.id}`);
                    }}
                    className="py-2 text-sm text-center transition-all duration-300 border text-blue-500 sm:min-w-48 hover:bg-primary hover:text-white"
                  >
                    View Hospital{" "}
                    <img
                      className="flex flex-col w-10 h-6 ml-24 mb-10 pb-2 hover:fill-white hover:-hue-rotate-180"
                      src={assets.headarrow_icon}
                      alt=""
                    />
                  </button>
                }
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Hospitals;
