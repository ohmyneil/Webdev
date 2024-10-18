import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../firebase";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom"; 
import backgroundImage from "../assets/login-bg.jpg";
import "./AuthPage.css";
import { updateDoc } from "firebase/firestore"; 
import { signOut } from "firebase/auth";


const AuthPage = ({ onRegisterSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    vehicleType: "car",
    plateNumber: "",
    email: "",
    password: "",
    role: "regular",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6; // Validator for the length of the password
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "email") {
      setErrors({ ...errors, email: validateEmail(value) ? "" : "Invalid email format" });
    }
    if (name === "password") {
      setErrors({ ...errors, password: validatePassword(value) ? "" : "Password must be at least 6 characters" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { firstName, lastName, vehicleType, plateNumber, email, password, role } = formData;

    if (errors.email || errors.password) {
      console.error("Validation errors:", errors);
      return; 
    }

    if (isSignUp) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;


        await setDoc(doc(db, "users", user.uid), {
          firstName,
          lastName,
          vehicleType,
          plateNumber,
          email,
          role,  
          active: true,  
        });

        console.log("User signed up and data saved to Firestore");
        onRegisterSuccess();  
        navigate("/user-dashboard"); 
      } catch (error) {
        console.error("Error signing up:", error.message);
      }
    } else {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

    
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userRole = userDoc.data().role;  

        await updateDoc(doc(db, "users", user.uid), { active: true });

        console.log("User logged in");
        onRegisterSuccess();  
        // Redirect based on user role
        if (userRole === "admin") {
          navigate("/admin-dashboard");
        } else {
          navigate("/user-dashboard");
        }
      } catch (error) {
        console.error("Error logging in:", error.message);
      }
    }
  };
  const handleLogout = async () => {
    try {
      const user = auth.currentUser;
      if (user) {

        await updateDoc(doc(db, "users", user.uid), { active: false });
      }
  
      await signOut(auth);  
      console.log("User logged out");
      navigate("/auth");  
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-gray-100 relative font-poppins"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "rgba(21, 26, 35, 0.78)",
          zIndex: 1,
        }}
      />

      <nav className="absolute top-0 left-0 right-0 py-6 px-10 flex justify-between items-center z-20">
        <div className="text-3xl font-bold text-white">
          <span className="text-customBlue">Park</span>Based
        </div>
        <div style={{ zIndex: 30 }}>
          <Link to="/">
            <button className="bg-transparent border border-white px-4 py-2 rounded-full hover:bg-gray-800 text-white transition duration-300">
              Home
            </button>
          </Link>
        </div>
      </nav>

      <div className="relative z-10 flex-grow flex flex-col items-center justify-center px-4 md:px-0">
        <h1 className="text-4xl font-bold mb-6 text-white text-center">
          {isSignUp ? "Create an Account" : "Welcome Back!"}
        </h1>

        <div className="mb-6 flex flex-row">
          <div className="w-auto">
            <button
              onClick={() => setIsSignUp(true)}
              className={`px-4 py-2 transition duration-300 ${isSignUp ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}
            >
              Sign Up
            </button>
          </div>
          <div className="w-auto">
            <button
              onClick={() => setIsSignUp(false)}
              className={`px-4 py-2 transition duration-300 ${!isSignUp ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}
            >
              Login
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg transition-opacity duration-500 opacity-100">
          {isSignUp && (
            <>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First Name"
                required
                className="border border-gray-300 p-3 mb-4 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              />
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                required
                className="border border-gray-300 p-3 mb-4 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              />
              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                className="border border-gray-300 p-3 mb-4 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              >
                <option value="car">Car</option>
                <option value="motorcycle">Motorcycle</option>
              </select>
              <input
                type="text"
                name="plateNumber"
                value={formData.plateNumber}
                onChange={handleChange}
                placeholder="Plate Number"
                required
                className="border border-gray-300 p-3 mb-4 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              />
             
            </>
          )}

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            required
            className="border border-gray-300 p-3 mb-4 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          />
          {errors.email && <p className="text-red-500">{errors.email}</p>} 
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            required
            className="border border-gray-300 p-3 mb-4 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          />
          {errors.password && <p className="text-red-500">{errors.password}</p>} 
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-3 rounded-lg w-full transition duration-300 hover:bg-blue-600 shadow-md"
          >
            {isSignUp ? "Sign Up" : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
