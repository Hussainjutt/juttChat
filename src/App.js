import React, { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/login";
import Register from "./pages/auth/register";
import Home from "./pages/home/Home";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "./context/AuthContext";
import Profile from "./pages/profile/Profile";
import ConfirmEmail from "./pages/auth/confirmEmail";
import ResetPassword from "./pages/auth/resetPassword";

const App = () => {
  const { currentUser } = useContext(AuthContext);
  const ProtectedRoute = ({ children }) => {
    if (!currentUser) {
      return <Navigate to="/" />;
    }
    return children;
  };
  return (
    <>
      <ToastContainer theme="dark" autoClose={1000} />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          {/* <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          /> */}
          <Route path="/confirmEmail" element={<ConfirmEmail />} />
          <Route path="/reserPassword" element={<ResetPassword />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
