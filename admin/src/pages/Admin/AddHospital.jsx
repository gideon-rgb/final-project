/* eslint-disable no-unused-vars */
import React, { useContext, useState } from 'react'
import { assets } from '../../assets/assets'
import { AdminContex } from '../../context/AdminContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const AddHospital = () => {


    const [hosImg, setHosImg] = useState(false)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('1 Year')
    const [emergency, setEmergency] = useState('')
    const [about, setAbout] = useState('')
    const [address1, setAddress1] = useState('')
    const [address2, setAddress2] = useState('')
    const [address3, setAddress3] = useState('')
    const [address4, setAddress4] = useState('')
    const [addressA, setAddressA] = useState('')
    const [addressB, setAddressB] = useState('')
    const [addressC, setAddressC] = useState('')
    

    const { backendUrl, aToken } = useContext(AdminContex)


    const onSubmitHandler = async (event) => {
        event.preventDefault();
        try {
            if (!hosImg) {
                return toast.error('Image Not Selected')
            }

            const formData = new FormData()
            formData.append('image', hosImg)
            formData.append('name', name)
            formData.append('email_address', email)
            formData.append('phone_number', phone)
            formData.append('about', about)
            formData.append('emergency_number', emergency)
            formData.append('physical_address', JSON.stringify({ latitude: addressA, longitude: addressB, full_address: addressC }))
            formData.append('address', JSON.stringify({ city: address1, state: address2, street: address3, zip: address4 }))

            //console.log formdata
            formData.forEach((value, key) => {
                console.log(`${key} : ${value}`)
            })

            const { data } = await axios.post(backendUrl + '/api/admin/add-hospital', formData, { headers: { aToken } })
            if (data.success) {
                toast.success(data.message)
                setHosImg(false)
                setName('')
                setEmail('')
                setAbout('')
                setEmergency('')
                setPhone('')
                setAddress1('')
                setAddress2('')
                setAddress3('')
                setAddress4('')
                setAddressA('')
                setAddressB('')
                setAddressC('')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
            console.log(error)
        }
    }



    return (
        <form onSubmit={onSubmitHandler} className='m-5 w-full'>

            <p className='mb-3 text-lg font-medium'>Add Hospital</p>

            <div className='bg-white px-8 py-8 border rounded w-full max-w-4xl max-h-[80vh] overflow-scroll'>
                <div className='flex items-center gap-4 mb-8 text-gray-500'>
                    <label htmlFor="doc-img">
                        <img className='w-16 bg-gray-100 rounded-full cursor-pointer' src={hosImg ? URL.createObjectURL(hosImg) : assets.upload_area} alt="" />
                    </label>
                    <input onChange={(e) => setHosImg(e.target.files[0])} type="file" id="doc-img" hidden />
                    <p>Upload Hospital <br />picture</p>
                </div>
                <div className='flex flex-col lg:flex-row items-start gap-10 text-gray-600'>

                    <div className='w-full lg:flex-1 flex flex-col gap-4'>
                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Hospital name</p>
                            <input onChange={(e) => setName(e.target.value)} value={name} className='border rounded px-3 py-2' type="text" placeholder='Name' required />
                        </div>
                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Hospital email</p>
                            <input onChange={(e) => setEmail(e.target.value)} value={email} className='border rounded px-3 py-2' type="email" placeholder='Email' required />
                        </div>
                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Hospital phone number</p>
                            <input onChange={(e) => setPhone(e.target.value)} value={phone} className='border rounded px-3 py-2' type="number" placeholder='phone number' required />
                        </div>
                        
                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Hospital emergency number</p>
                            <input onChange={(e) => setEmergency(e.target.value)} value={emergency} className='border rounded px-3 py-2' type="number" placeholder='Emergency Number' required />
                        </div>

                    </div>
                    <div className='w-full lg:flex-1 flex flex-col gap-4'>
                        
                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Hospital physical_address</p>
                            <input onChange={(e) => setAddressA(e.target.value)} value={addressA} className='border rounded px-3 py-2' type="text" placeholder='latitude' required />
                            <input onChange={(e) => setAddressB(e.target.value)} value={addressB} className='border rounded px-3 py-2' type="text" placeholder='longitude' required />
                            <input onChange={(e) => setAddressC(e.target.value)} value={addressC} className='border rounded px-3 py-2'  type="text" placeholder='full_address' required/>
                        </div>
                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Address</p>
                            <input onChange={(e) => setAddress1(e.target.value)} value={address1} className='border rounded px-3 py-2' type="text" placeholder='city' required />
                            <input onChange={(e) => setAddress2(e.target.value)} value={address2} className='border rounded px-3 py-2' type="text" placeholder='state' required />
                            <input onChange={(e) => setAddress3(e.target.value)} value={address3} className='border rounded px-3 py-2' type="text" placeholder='street' required />
                            <input onChange={(e) => setAddress4(e.target.value)} value={address4} className='border rounded px-3 py-2' type="text" placeholder='zip' required />
                        </div>
                    </div>

                </div>
                <div>
                    <p className='mt-4 mb-2'>About Hospital</p>
                    <textarea onChange={(e) => setAbout(e.target.value)} value={about} className='w-full px-4 py-2 border rounded' placeholder='write about the hospital' rows={5} required />
                </div>
                <button type='submit' className='bg-primary px-10 py-3 mt-4 text-white rounded-full'>Add hospital</button>
            </div>
        </form>
    )
}

export default AddHospital