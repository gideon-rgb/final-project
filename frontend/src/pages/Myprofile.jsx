import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";

const Myprofile = () => {
  const { userData, setUserData, token, backendUrl, loadUserProfileData } =
    useContext(AppContext);



  const [isEdite, setIsEdite] = useState(false);
  const [image, setImage] = useState(false);

  const updateUserProfileData = async () => {
    try {
      const formData = new FormData();

      formData.append("name", userData.name);
      formData.append("phone", userData.phone);
      formData.append("address", JSON.stringify(userData.address));
      formData.append("gender", userData.gender);
      formData.append("dob", userData.dob);

      image && formData.append("image", image);

      const { data } = await axios.post(
        backendUrl + "/api/user/update-profile",
        formData,
        { headers: { token } },
      );

      if (data.success) {
        toast.success(data.message);
        await loadUserProfileData();
        setIsEdite(false);
        setImage(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  return (
    userData && (
      <div className="flex flex-col max-w-lg gap-2 text-sm">
        {isEdite ? (
          <label htmlFor="image">
            <div className="relative inline-block cursor-pointer">
              <img
                src={image ? URL.createObjectURL(image) : userData.image}
                alt="profile"
                className="rounded opacity-75 w-36"
              />
              <img
                src={image ? "" : assets.upload_icon}
                alt=""
                className="absolute w-10 bottom-12 right-12"
              />
            </div>
            <input
              onChange={(e) => setImage(e.target.files[0])}
              type="file"
              id="image"
              hidden
            />
          </label>
        ) : (
          <img className="rounded w-36" src={userData.image} alt="" />
        )}

        {isEdite ? (
          <input
            className="mt-4 text-3xl font-medium bg-gray-50 max-w-60"
            type="text"
            value={userData.name}
            onChange={(e) =>
              setUserData((prev) => ({ ...prev, name: e.target.value }))
            }
          />
        ) : (
          <p className="mt-4 text-3xl font-medium text-neutral-800">
            {userData.name}
          </p>
        )}

        <hr className="bg-zinc-400 h-[1px] border-none" />
        <div>
          <p className="mt-4 underline text-neutral-500">CONTACT INFORMATION</p>
          <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
            <p className="font-medium">Email id:</p>
            <p className="text-blue-500">{userData.email}</p>
            <p className="font-medium">Phone:</p>
            {isEdite ? (
              <input
                className="bg-gray-100 max-w-52"
                type="text"
                value={userData.phone}
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
            ) : (
              <p className="text-blue-400">{userData.phone}</p>
            )}
            <p className="font-medium">Address:</p>
            {isEdite ? (
              <p>
                <input
                  className="bg-gray-50"
                  type="text"
                  value={userData.address.line1}
                  onChange={(e) =>
                    setUserData((prev) => ({
                      ...prev,
                      address: { ...prev.address, line1: e.target.value },
                    }))
                  }
                />
                <br />
                <input
                  className="bg-gray-50"
                  type="text"
                  value={userData.address.line2}
                  onChange={(e) =>
                    setUserData((prev) => ({
                      ...prev,
                      address: { ...prev.address, line2: e.target.value },
                    }))
                  }
                />
              </p>
            ) : (
              <p className="text-gray-500">
                {userData.address.line1}
                <br />
                {userData.address.line2}
              </p>
            )}
          </div>
        </div>
        <div>
          <p className="mt-4 underline text-neutral-500">
            PERSONAL INFORMATION
          </p>
          <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
            <p className="font-medium">Gender:</p>
            {isEdite ? (
              <select
                className="bg-gray-100 max-w-20"
                value={userData.gender}
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, gender: e.target.value }))
                }
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            ) : (
              <p className="text-gray-400">{userData.gender}</p>
            )}
            <p className="font-medium">Date of Birth:</p>
            {isEdite ? (
              <input
                className="bg-gray-100 max-w-28"
                type="datetime-local"
                value={userData.dob}
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, dob: e.target.value }))
                }
              />
            ) : (
              <p className="text-gray-400">{userData.dob}</p>
            )}
          </div>
        </div>
        <div className="mt-10">
          {isEdite ? (
            <button
              className="px-8 py-2 transition-all border rounded-full border-primary hover:bg-primary hover:text-white"
              onClick={updateUserProfileData}
            >
              Save information
            </button>
          ) : (
            <button
              className="px-8 py-2 transition-all border rounded-full border-primary hover:bg-primary hover:text-white"
              onClick={() => setIsEdite(true)}
            >
              Edit
            </button>
          )}
        </div>
      </div>
    )
  );
};

export default Myprofile;
