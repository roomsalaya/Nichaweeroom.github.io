import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Component/Home';
import Login from './Component/Login';
import { AuthProvider } from './Component/Auth';
import Profile from './Component/Profile';
import AdminDashboard from './Component/AdminDashboard';
import Footer from './Component/Footer';
import './App.css';
import Parcel from './Component/Parcel';
import AdminParcelPage from './Component/AdminParcelPage';
import AdminUser from './Component/AdminUser';
import MaintenanceReport from './Component/MaintenanceReport';
import MaintenanceList from './Component/MaintenanceList';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <div className="app">
        <Router>
          <div className="content-wrap">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path='/Profile' element={<Profile/>}/>
              <Route path='/parcel' element={<Parcel/>}/>
              <Route path='/adminDashboard' element={<AdminDashboard/>}/>
              <Route path="/adminparcels" element={<AdminParcelPage />} />
              <Route path='/adminusers' element={<AdminUser/>} />
              <Route path='/MaintenanceReport' element={<MaintenanceReport/>}/>
              <Route path='/MaintenanceList' element={<MaintenanceList/>} />
            </Routes>
          </div>
          <Footer />
        </Router>
      </div>
    </AuthProvider>
  );
};

export default App;
