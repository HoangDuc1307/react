import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css'
import RegisterPage from './page/register.jsx';
import UserPage from './page/user.jsx';
import HomePage from './page/home.jsx';
import LoginPage from './page/login.jsx';
import ProductPage from './page/product.jsx';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { AuthWrapper } from './components/context/auth.context.jsx';
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: "user",
        element: <UserPage />
      },
      {
        path: "product",
        element: <ProductPage />
      },
    ]
  },
  {
    path: "register",
    element: <RegisterPage />
  },
  {
    path: "login",
    element: <LoginPage />
  },



]);


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthWrapper>
      <RouterProvider router={router} />
    </AuthWrapper>
  </React.StrictMode>,
)
