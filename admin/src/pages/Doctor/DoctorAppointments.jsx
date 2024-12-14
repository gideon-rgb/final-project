/* eslint-disable no-unused-vars */
import React, { useContext, useEffect } from 'react'
import { DoctorContex } from '../../context/DoctorContext'
import { AppContex } from '../../context/AppContext'
import { assets } from '../../assets/assets'

const DoctorAppointments = () => {

  const { dToken, appointments, getAppointments, completeAppointment, cancelAppointment } = useContext(DoctorContex)

  const { calculateAge, slotDateFormat, currency } = useContext(AppContex)

  useEffect(() => {
    if (dToken, appointments) {
      getAppointments()
    }
  }, [dToken, appointments])

  return (
    <div className='w-full max-w-6xl m-5'>
      <p className='mb-3 text-lg font-medium'>All Appointments</p>

      <div className='bg-white border rounded text-sm max-h-[80vh] min-h-[50] overflow-y-scroll'>
        <div className='max-sm:hidden grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-1 py-3 px-6 border-b'>
          <p>#</p>
          <p>Patient</p>
          <p>Payment</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Fees</p>
          <p>Action</p>
        </div>

        {
          appointments.reverse().map((item, index) => (
            <div className='flex flex-wrap justify-between max-sm:gap-5 max-sm:text-base sm:grid sm:grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-200' key={index}>
              <p className='max-sm:hidden'>{index + 1}</p>
              <div className='flex items-center gap-2'>
                <img className='w-8 rounded-full' src={item.userData.image} alt="" /> <p>{item.userData.name}</p>
              </div>
              <div>
                <p className='text-xs inline border border-primary px-2 rounded-full'>{item.payment ? 'Online' : 'Cash'}</p>
              </div>
              <p className='max-sm:hidden'>{calculateAge(item.userData.dob)}</p>
              <p>{slotDateFormat(item.slotDate)}, {item.slotTime}</p>
              <p>{currency}{item.amount}</p>
              {
                item.cancelled
                  ? <p className='text-red-400 text-xs font-medium'>Cancelled </p>
                  : item.isCompleted
                    ? <p className='text-green-400 text-xs font-medium'>Completed</p>
                    : <div className='flex'>
                      <img onClick={() => cancelAppointment(item.id)} className='w-10 cursor-pointer' src={assets.cancel_icon} alt="" />
                      <img onClick={() => completeAppointment(item.id)} className='w-10 cursor-pointer' src={assets.tick_icon} alt="" />
                    </div>
              }
              <div className='text-transparent'>
                {item.cancelled && item.payment &&
                  <p className='text-red-400 text-xs font-medium'>Not Refunded</p>}
                {item.cancelled && !item.payment && <p className='text-green-400 text-xs font-medium'></p>}
              </div>

            </div>))
        }

      </div>


    </div>
  )
}

export default DoctorAppointments