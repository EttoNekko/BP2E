import React from 'react';
import { Outlet, ScrollRestoration } from 'react-router-dom';
import NavBar from '../components/NavBar';

const MainLayout = () => {
  return (
    <>
      <NavBar />
      <Outlet />
      <ScrollRestoration
        getKey={(location, matches) => {
          return location.pathname;
        }}
      />
    </>
  );
};

export default MainLayout;
