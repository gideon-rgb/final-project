import React, { useContext, useEffect, useState } from 'react'
import { DoctorContex } from '../../context/DoctorContext'
import { AppContex } from '../../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const DoctorProfile = () => {

  const { dToken, profileData, setProfileData, getProfileData, backendUrl } = useContext(DoctorContex)
  const { currency } = useContext(AppContex)

  const [isEdit, setIsEdit] = useState(false)

  let mAdresses; if (profileData && profileData.address) {
    if (typeof profileData === 'string') {
      mAdresses = JSON.parse(profileData.address);
    } else {
      mAdresses = profileData.address
      //console.error('Data is not a valid JSON string:', profileData.address);
    }

  }

  const updateProfile = async () => {

    try {

      const updateData = {
        address: JSON.stringify(mAdresses),
        fees: profileData.fees,
        availability: profileData.availability
      }

      const { data } = await axios.post(backendUrl + '/api/doctors/update-profile', updateData, { headers: { dToken } })
      console.log(data)
      if (data.success) {
        toast.success(data.message)
        setIsEdit(false)
        getProfileData()
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.message)
      console.log(error)
    }

  }

  useEffect(() => {
    if (dToken) {
      getProfileData()

    }
  }, [dToken])

  return profileData && mAdresses && (
    <div>
      <div className='flex flex-col gap-4 m-5'>
        <div>
          <img className='bg-primary/80 w-full sm:max-w-64 rounded-lg' src={profileData.image} alt="" />
        </div>

        <div className='flex-1 border border-stone-100 rounded-lg p-8 py-7 bg-white'>
          {/* ----------doc info : name, degree, experience ------------ */}

          <p className='flex items-center gap-2 text-3xl font-medium text-gray-700'>{profileData.name}</p>
          <div className='flex items-center gap-2 mt-1 text-gray-600'>
            <p>{profileData.degree} - {profileData.speciality}</p>
            <button className='py-0.5 px-2 border text-xs rounded-full border-gray-400'>{profileData.experience} years</button>
          </div>
          {/* ----------doc info : about, fees, location ------------ */}
          <div>
            <p className='flex items-center gap-1 text-sm font-medium text-neutral-800 mt-3'>About:</p>
            <p className='text-sm text-gray-600 max-w-[700px] mt-1'>{profileData.about}</p>
          </div>

          <p className='text-gray-600     font-medium mt-4'>
            Appointment fee : <span className='text-gray-800'>{currency} {isEdit ? <input type="number" onChange={(e) => setProfileData(prev => ({ ...prev, fees: e.target.value }))} value={profileData.fees} /> : profileData.fees}</span>
          </p>

          <div className='flex gap-2 py-2'>
            <p>Address :</p>
            <p className='text-sm'>
              {isEdit ? <input type='text' onChange={(e) => setProfileData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))} value={profileData.address.line1} /> : mAdresses.line1}
              <br />
              {isEdit ? <input type='text' onChange={(e) => setProfileData(prev => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))} value={profileData.address.line2} /> : mAdresses.line2}</p>
          </div>

          <div className='flex gap-1 pt-2'>
            <input onChange={() => isEdit && setProfileData(prev => ({ ...prev, availability: !prev.availability }))} checked={profileData.availability} type="checkbox" />
            <label htmlFor="">Availability</label>
          </div>

          {
            isEdit
              ? <button onClick={updateProfile} className='px-4 py-1 border border-primary text-sm rounded-full mt-5 hover:bg-primary hover:text-white transition-all'>Save</button>
              : <button onClick={() => setIsEdit(true)} className='px-4 py-1 border border-primary text-sm rounded-full mt-5 hover:bg-primary hover:text-white transition-all'>Edit</button>
          }

        </div>
      </div>
    </div>
  )

}

export default DoctorProfile