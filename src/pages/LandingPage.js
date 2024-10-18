// LandingPage.js
import React, { useEffect, useState } from "react";
import backgroundImage from "../assets/landingpage-bg.jpg";
import { FaUsers, FaUserCheck, FaParking } from "react-icons/fa";
import { Link } from "react-router-dom";

const LandingPage = ({ registeredUsers, activeUsers }) => {
  return (
    <div className="bg-gray-900 text-white h-screen relative font-poppins">
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={backgroundImage}
          alt="Parking background"
          className="object-cover w-full h-full"
        />
        <div
          className="absolute inset-0"
          style={{ backgroundColor: "rgba(21, 26, 35, 0.78)" }}
        ></div>
      </div>

      <div className="relative z-10 h-full flex flex-col justify-between">
        <nav className="flex justify-between items-center py-6 px-10">
          <div className="text-3xl font-bold">
            <span className="text-customBlue">Park</span>Based
          </div>
          <div>
            <Link to="/auth">
              <button className="bg-transparent border border-white px-4 py-2 rounded-full hover:bg-gray-800">
                Login / Register
              </button>
            </Link>
          </div>
        </nav>

        <div className="flex-grow flex px-10 md:px-24">
          <div className="flex flex-col justify-center items-start w-full md:w-2/3">
            <h1 className="text-6xl md:text-6xl font-bold leading-tight mb-6">
              Find, reserve, <br />
              and <span className="text-customBlue">park with ease</span>
            </h1>
            <p className="max-w-3xl text-lg md:text-xl mb-10">
              Experience hassle-free parking with ParkBased. Our innovative
              platform allows you to find, reserve, and manage parking spots
              effortlessly. Say goodbye to parking stress and hello to
              convenience. Whether you're commuting, traveling, or attending an
              event, ParkBased has got you covered.
            </p>
            <Link to="/auth">
              <button className="bg-transparent border-2 border-white hover:bg-customBlue text-white text-lg px-6 py-3 rounded-full">
                Reserve Now!
              </button>
            </Link>
          </div>

          <div className="hidden md:flex flex-col md:flex-row items-center justify-center w-full space-x-6">
            <div className="bg-gray-800 text-center p-6 rounded-lg shadow-md w-64 h-64 flex flex-col justify-center items-center">
              <FaUsers className="text-customBlue text-6xl mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Registered Users</h2>
              <p className="text-4xl font-bold text-customBlue">
                {registeredUsers}
              </p>
            </div>

            <div className="bg-gray-800 text-center p-6 rounded-lg shadow-md w-64 h-64 flex flex-col justify-center items-center">
              <FaUserCheck className="text-customBlue text-6xl mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Active Users</h2>
              <p className="text-4xl font-bold text-customBlue">
                {activeUsers}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
