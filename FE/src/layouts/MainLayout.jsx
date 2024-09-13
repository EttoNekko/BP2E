import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from '../components/NavBar';
import UserContextProvider from '../context/UserContext';

const MainLayout = () => {
  return (
    <>
      <NavBar />
      <Outlet />
    </>
  );
};

export default MainLayout;
