import { Navigate } from 'react-router-dom';

import FrontLayout from '../layouts/FrontLayout';
import AdminLayout from '../layouts/AdminLayout';
import Home from '../pages/Home';
import ProductsList from '../pages/ProductsList';
import ProductDetail from '../pages/ProductDetail';
import AdminProducts from '../pages/AdminProducts';
import Cart from '../pages/Cart';
import Form from '../pages/Form';
import Login from '../pages/Login';
import NotFound from '../pages/NotFound';
import AdminHome from '../pages/AdminHome';

const routes = [
    {
        path: '/',
        element: <FrontLayout />,
        children: [
            { index: true, element: <Home /> },
            { path: 'products', element: <ProductsList /> },
            { path: 'products/:id', element: <ProductDetail /> },
            { path: 'cart', element: <Cart /> },
            { path: 'form', element: <Form /> },
        ]
    },
    {
        path: '/admin',
        element: <AdminLayout />,
        children: [
            { index: true, element: <AdminHome /> },
            { path: 'products', element: <Navigate to="/admin/products/1" replace /> },  // 預設跳轉
            { path: 'products/:page', element: <AdminProducts /> },
        ]
    },
    {
        path: '/login',
        element: <Login />
    },
    {
        path: '*',
        element: <NotFound />
    },
];

export default routes;