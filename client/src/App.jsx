import React, { useContext } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import { AuthContext } from '../context/AuthContext'
import { Toaster } from 'react-hot-toast'
function App() {
  const {authUser}=useContext(AuthContext)
  return (
    <div className="bg-[url('/bgImage.svg')] bg-contain">
      <Toaster/>
      <Routes>
        <Route path='/' element={authUser? <HomePage/>:<Navigate to="/login"/>}/> {/* authUser checks if user is authenticated or not */}
        <Route path='/login' element={ !authUser? <LoginPage/> : <Navigate to="/"/> }/>
        <Route path='/profile' element={authUser ? <ProfilePage/> : <Navigate to="/login"/> }/>
      </Routes>
    </div>
  )
}

export default App
