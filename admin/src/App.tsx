import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import AdminLayout from './components/Layout/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Reviews from './pages/Reviews';
import Returns from './pages/Returns';
import Products from './pages/Products';
import Users from './pages/Users';
import Coupons from './pages/Coupons';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <AdminLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'orders', element: <Orders /> },
      { path: 'reviews', element: <Reviews /> },
      { path: 'returns', element: <Returns /> },
      { path: 'products', element: <Products /> },
      { path: 'users', element: <Users /> },
      { path: 'coupons', element: <Coupons /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
