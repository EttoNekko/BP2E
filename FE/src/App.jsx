import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import BoxPage from './pages/BoxPage';

import UserContextProvider from './context/UserContext';
import Random from './pages/Random';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<MainLayout />}>
      <Route index element={<HomePage />} />,
      <Route path='box' element={<BoxPage />} />
      {/* <Route path='random' element={<Random />} /> */}
    </Route>,
  ),
);

function App() {
  return (
    <UserContextProvider>
      <RouterProvider router={router} />
      <ToastContainer limit={3} />
    </UserContextProvider>
  );
}

export default App;
