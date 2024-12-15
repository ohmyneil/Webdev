import React, { useState } from "react";
import backgroundImage from "../assets/landingpage-bg.jpg";
import {
  FaUsers,
  FaUserCheck,
  FaParking,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaFacebookF,
  FaTwitter,
  FaGoogle,
  FaInstagram,
  FaLinkedin,
  FaGithub,
  FaHome,
  FaInfoCircle,
  FaConciergeBell,
  FaRobot,
  FaPaperPlane,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const LandingPage = ({ registeredUsers, activeUsers }) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSendMessage = () => {
    if (input.trim()) {
      setMessages([...messages, { user: true, text: input }]);
      setInput("");
      // Placeholder for chatbot response
      setTimeout(() => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { user: false, text: "Thank you for reaching out! How can I assist?" },
        ]);
      }, 500);
    }
  };

  return (
    <div className="bg-gray-900 text-white h-screen relative font-poppins">
      {/* Background */}
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

      {/* Main content */}
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

        {/* Content */}
        <div className="flex-grow flex px-10 md:px-24">
          <div className="flex flex-col justify-center items-start w-full md:w-2/3">
            <h1 className="text-6xl md:text-6xl font-bold leading-tight mb-6">
              Find, reserve, <br />
              and <span className="text-customBlue">park with ease</span>
            </h1>
            <p className="max-w-3xl text-lg md:text-xl mb-10">
              Experience hassle-free parking with ParkBased. Our innovative
              platform allows you to find, reserve, and manage parking spots
              effortlessly. Whether you're commuting, traveling, or attending an
              event, ParkBased has you covered.
            </p>
            <Link to="/auth">
              <button className="bg-transparent border-2 border-white hover:bg-customBlue text-white text-lg px-6 py-3 rounded-full mb-20">
                Reserve Now!
              </button>
            </Link>
          </div>

          {/* Stats Section */}
          <div className="hidden md:flex flex-col md:flex-row items-center justify-center w-full space-x-6">
            <div className="bg-gray-800 text-center p-6 rounded-lg shadow-md w-64 h-64 flex flex-col justify-center items-center">
              <FaUsers className="text-customBlue text-6xl mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Registered Users</h2>
              <p className="text-4xl font-bold text-customBlue">{registeredUsers}</p>
            </div>

            <div className="bg-gray-800 text-center p-6 rounded-lg shadow-md w-64 h-64 flex flex-col justify-center items-center">
              <FaUserCheck className="text-customBlue text-6xl mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Active Users</h2>
              <p className="text-4xl font-bold text-customBlue">{activeUsers}</p>
            </div>
          </div>
        </div>

       {/* Footer */}
<footer className="bg-gray-800 text-white py-12">
  <div className="container mx-auto px-6">
    {/* Top Section */}
    <div className="flex flex-col md:flex-row justify-between items-start mb-8 space-y-8 md:space-y-0">
      {/* Quick Links */}
      <div>
        <h1 className="text-2xl font-semibold mb-4">Quick Links</h1>
        <ul className="space-y-4">
          <li>
            <Link to="/" className="flex items-center hover:text-customBlue">
              <FaHome className="mr-2" />
              Home
            </Link>
          </li>
          <li>
            <Link to="/about" className="flex items-center hover:text-customBlue">
              <FaInfoCircle className="mr-2" />
              About Us
            </Link>
          </li>
          <li>
            <Link to="/services" className="flex items-center hover:text-customBlue">
              <FaConciergeBell className="mr-2" />
              Services
            </Link>
          </li>
        </ul>
      </div>

      {/* Contact Us */}
      <div>
        <h1 className="text-2xl font-semibold mb-4">Contact Us</h1>
        <p className="flex items-center mb-2">
          <FaPhone className="mr-2" />
          (043) 784 0368
        </p>
        <p className="flex items-center">
          <FaEnvelope className="mr-2" />
          contact@Parkbased.site
        </p>
      </div>

      {/* Map Location */}
      <div>
        <h1 className="text-2xl font-semibold mb-4">Our Map Location</h1>
        <ul className="space-y-2">
          <li>
            <a
              href="https://www.google.com/maps/place/SM+City+Lipa/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center hover:text-customBlue"
            >
              <FaMapMarkerAlt className="mr-2" />
              SM Lipa City, Batangas
            </a>
          </li>
        </ul>
      </div>
    </div>

    {/* Social Media Links */}
    <div className="flex justify-center space-x-6 mb-6">
      <a href="#" className="hover:text-customBlue">
        <FaFacebookF size={24} />
      </a>
      <a href="#" className="hover:text-customBlue">
        <FaTwitter size={24} />
      </a>
      <a href="#" className="hover:text-customBlue">
        <FaGoogle size={24} />
      </a>
      <a href="#" className="hover:text-customBlue">
        <FaInstagram size={24} />
      </a>
      <a href="#" className="hover:text-customBlue">
        <FaLinkedin size={24} />
      </a>
      <a href="#" className="hover:text-customBlue">
        <FaGithub size={24} />
      </a>
    </div>

    {/* Bottom Section */}
    <div className="text-center text-sm">
      <p>
        © 2024 Copyright:{" "}
        <Link to="/" className="text-light hover:text-customBlue">
          ParkBased.site
        </Link>
      </p>
    </div>
  </div>
</footer>


        {/* Chatbot */}
        <div>
          {chatOpen && (
            <div className="fixed bottom-24 right-6 bg-gray-800 p-4 w-80 rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Chat with us!</h2>
                <button
                  onClick={() => setChatOpen(false)}
                  className="text-white hover:text-red-500"
                >
                  ✕
                </button>
              </div>
              <div className="flex flex-col h-64 overflow-y-auto bg-gray-700 rounded-lg p-3">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`mb-2 ${msg.user ? "text-right" : "text-left"}`}
                  >
                    <p
                      className={`inline-block px-3 py-2 rounded-lg ${
                        msg.user
                          ? "bg-customBlue text-white"
                          : "bg-gray-600 text-white"
                      }`}
                    >
                      {msg.text}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex items-center mt-3">
                <input
                  type="text"
                  className="flex-grow bg-gray-600 text-white rounded-lg px-3 py-2 outline-none"
                  placeholder="Type a message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-customBlue text-white rounded-lg px-3 py-2 ml-2 hover:bg-blue-700"
                >
                  <FaPaperPlane />
                </button>
              </div>
            </div>
          )}
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="fixed bottom-6 right-6 bg-customBlue text-white p-4 rounded-full shadow-lg hover:bg-blue-700"
          >
            <FaRobot size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
