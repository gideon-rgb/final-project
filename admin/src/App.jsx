import React, { useContext } from 'react'
import Login from './pages/Login.jsx'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AdminContex } from './context/AdminContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { Route, Routes } from 'react-router-dom';
import AllAppointments from './pages/Admin/AllAppointments';
import Dashboard from './pages/Admin/Dashboard';
import AddDoctor from './pages/Admin/AddDoctor';
import DoctorsList from './pages/Admin/DoctorsList';
import { DoctorContex } from './context/DoctorContext.jsx';
import DoctorDashboard from './pages/Doctor/DoctorDashboard.jsx';
import DoctorAppointments from './pages/Doctor/DoctorAppointments.jsx';
import DoctorProfile from './pages/Doctor/DoctorProfile.jsx';
import AddHospital from './pages/Admin/AddHospital.jsx'

const App = () => {

  const {aToken} = useContext(AdminContex)
  const {dToken} = useContext(DoctorContex)

  return aToken || dToken ? (
    <div className='bg-[#f8f9fd]'>
      <ToastContainer />
      <Navbar/>
      <div className='flex items-start'>
        <Sidebar/>
        <Routes>
          {/* Admin Route */}
          <Route path='/' element={<></>} />
          <Route path='/admin-dashboard' element={<Dashboard />} />
          <Route path='/all-appointments' element={<AllAppointments />} />
          <Route path='/add-doctor' element={<AddDoctor />} />
          <Route path='/add-hospital' element={<AddHospital />} />
          <Route path='/doctor-list' element={<DoctorsList />} />

          {/* Doctor Route */}
          <Route path='/doctor-dashboard' element={<DoctorDashboard />} />
          <Route path='/doctor-appointments' element={<DoctorAppointments />} />
          <Route path='/doctor-profile' element={<DoctorProfile />} />
        </Routes>
      </div>

    </div>
  ) : (
    <>
    <Login />
    <ToastContainer />
    </>
  )
}

export default App
