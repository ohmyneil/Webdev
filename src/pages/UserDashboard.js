import React, { useState, useEffect, useRef, useCallback } from "react";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  collection,
  where,
  getDocs,
  serverTimestamp,
  writeBatch
} from "firebase/firestore";
import ParkingMap from "./ParkingMap";
import { useNavigate } from "react-router-dom";
import JsBarcode from "jsbarcode";
import BookingReceipt from "../pages/BookingReceipt";
import { format, addHours } from 'date-fns'; 

const UserDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [selectedArea, setSelectedArea] = useState("Parking 3");
  const [bookingDetails, setBookingDetails] = useState({
    hours: 3,
    contactNo: "",
    isPWD: false,
    checkInTime: "",
  });
  const [totalAmount, setTotalAmount] = useState(150.0);
  const [bookingStatus, setBookingStatus] = useState("Pending for Approval");
  const [vehicleType, setVehicleType] = useState("car");
  const [isBookingLocked, setIsBookingLocked] = useState(false);
  const [activeBooking, setActiveBooking] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const barcodeRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const generateBarcode = useCallback(() => {
    if (isBookingLocked && barcodeRef.current && activeBooking) {
      const containerWidth = containerRef.current.offsetWidth;
      const barcodeWidth = Math.min(containerWidth, 300); 
      const barcodeHeight = Math.max(50, barcodeWidth / 3); 

      JsBarcode(barcodeRef.current, activeBooking.id, {
        format: "CODE128",
        width: 2,
        height: barcodeHeight,
        displayValue: true,
        fontSize: 12,
        margin: 10,
      });
    }
  }, [isBookingLocked, activeBooking]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      }
    };

    const checkUserBooking = async () => {
      if (auth.currentUser) {
        try {
          // This is for us to check for any active bookings for the current user
          const bookingsRef = collection(db, "bookings");
          const q = query(
            bookingsRef,
            where("userId", "==", auth.currentUser.uid),
            where("status", "in", ["pending", "approved"])
          );

          // Use getDocs instead of onSnapshot for less frequent reads because of the quota exceeding
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const bookingDoc = querySnapshot.docs[0];
            const booking = bookingDoc.data();

            // Calculate if the booking is still active
            const checkInTime = new Date(booking.checkInTime);
            const expirationTime = new Date(checkInTime);
            expirationTime.setHours(expirationTime.getHours() + booking.hours);

            const now = new Date();

            if (now < expirationTime) {
              setActiveBooking({
                ...booking,
                id: bookingDoc.id,
                firstName: userData?.firstName,
                lastName: userData?.lastName,
                plateNumber: userData?.plateNumber,
              });
              setIsBookingLocked(true);
            } else {
              const batch = writeBatch(db); 
              batch.update(doc(db, "bookings", bookingDoc.id), { status: "completed" });
              batch.update(doc(db, "users", auth.currentUser.uid), { hasActiveBooking: false });

              await batch.commit();
              setIsBookingLocked(false);
            }
          } else {
            setIsBookingLocked(false); 
          }
        } catch (error) {
          console.error("Error checking booking status:", error);
        }
      }
    };

    fetchUserData();
    checkUserBooking();
  }, [userData]);

  useEffect(() => {
    generateBarcode();
    window.addEventListener('resize', generateBarcode);
    return () => window.removeEventListener('resize', generateBarcode);
  }, [generateBarcode]);

  const handleSlotSelect = (slotInfo) => {
    setSelectedSlot(slotInfo);
  };

  const isValidCheckInTime = () => {
    if (!bookingDetails.checkInTime) return false;

    const now = new Date();
    const checkInTime = new Date();
    const [hours, minutes] = bookingDetails.checkInTime.split(":");
    checkInTime.setHours(hours, minutes, 0, 0);

    // Allow booking only if check-in time is within the next 24 hours
    const maxFutureTime = new Date();
    maxFutureTime.setHours(maxFutureTime.getHours() + 24);

    return checkInTime >= now && checkInTime <= maxFutureTime;
  };

  const calculateAmount = (hours) => {
    const baseRate = 50; 
    return baseRate * hours;
  };

  const handleHoursChange = (e) => {
    const hours = parseInt(e.target.value);
    setBookingDetails((prev) => ({ ...prev, hours }));
    setTotalAmount(calculateAmount(hours));
  };

  const handleReserveBooking = async () => {
    if (!auth.currentUser || isBookingLocked || !isValidCheckInTime()) {
      alert("Invalid booking request. Please check your check-in time.");
      return;
    }

    if (!selectedSlot) {
      alert("Please select a parking slot before booking.");
      return;
    }

    try {
      const bookingRef = doc(collection(db, "bookings"));
      const checkInTime = new Date();
      const [hours, minutes] = bookingDetails.checkInTime.split(":");
      checkInTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const expirationTime = new Date(checkInTime);
      expirationTime.setHours(expirationTime.getHours() + bookingDetails.hours);

      const bookingData = {
        userId: auth.currentUser.uid,
        parkingArea: selectedArea,
        selectedSlot,
        ...bookingDetails,
        totalAmount,
        status: "pending",
        timestamp: serverTimestamp(),
        checkInTime: checkInTime.toISOString(),
        expirationTime: expirationTime.toISOString(),
      };

      const batch = writeBatch(db); 
      batch.set(bookingRef, bookingData);

      // Check if the slot exists before updating
      const slotRef = doc(db, "parkingSlots", selectedSlot.id);
      const slotDoc = await getDoc(slotRef);
      if (slotDoc.exists()) {

        // Update the existing slot
        batch.update(slotRef, {
          status: "reserved",
          isPWD: bookingDetails.isPWD,
        });
      } else {
        // Create a new parking slot document if it doesn't exist
        const newSlotData = {
          status: "reserved",
          isPWD: bookingDetails.isPWD,
        };
        batch.set(slotRef, newSlotData);
        console.log(`Created new parking slot: ${selectedSlot.id}`);
      }

      batch.update(doc(db, "users", auth.currentUser.uid), {
        hasActiveBooking: true,
      });

      await batch.commit(); 

      setBookingStatus("Pending for Approval");
      setIsBookingLocked(true);
      setActiveBooking({
        ...bookingData,
        id: bookingRef.id,
      });

      alert("Booking request sent successfully!");
    } catch (error) {
      console.error("Error creating booking:", error);
      alert("Error creating booking. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Error logging out. Please try again.");
    }
  };

  const generateReceipt = () => {
    if (activeBooking) {
      setShowReceipt(true);
    } else {
      alert("No active booking found.");
    }
  };

  const formatBookingTime = useCallback(() => {
    if (activeBooking) {
      const checkInTime = new Date(activeBooking.checkInTime);
      const expirationTime = addHours(checkInTime, activeBooking.hours);
      
      return `${format(checkInTime, 'MMM d, h:mm a')} - ${format(expirationTime, 'h:mm a')}`;
    }
    return '';
  }, [activeBooking]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-gray-900 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-xl sm:text-2xl font-bold">
            <span className="text-sky-400">Park</span>Based
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base rounded-full border border-white hover:bg-white hover:text-gray-900 transition-colors"
          >
            Log out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          
          {/* Left Column - Parking Map */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Parking Map</h2>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4">
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full sm:w-48 p-2 bg-sky-100 rounded border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="Parking 3">Parking 3</option>
                <option value="Parking 4">Parking 4</option>
                <option value="Roof Deck">Roof Deck</option>
              </select>

              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full sm:w-48 p-2 bg-sky-100 rounded border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="car">Car Parking</option>
                <option value="motorcycle">Motorcycle Parking</option>
              </select>
            </div>

            <ParkingMap
              selectedArea={selectedArea}
              vehicleType={vehicleType}
              onSpaceSelect={handleSlotSelect}
            />
          </div>

          {/* Right Column - Booking Details */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Booking Details</h2>
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-4 sm:p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={userData?.firstName || ""}
                      disabled
                      className="w-full p-2 bg-gray-100 rounded border border-gray-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={userData?.lastName || ""}
                      disabled
                      className="w-full p-2 bg-gray-100 rounded border border-gray-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Plate No.
                    </label>
                    <input
                      type="text"
                      value={userData?.plateNumber || ""}
                      disabled
                      className="w-full p-2 bg-gray-100 rounded border border-gray-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Contact No.
                    </label>
                    <input
                      type="text"
                      value={bookingDetails.contactNo}
                      onChange={(e) =>
                        setBookingDetails((prev) => ({
                          ...prev,
                          contactNo: e.target.value,
                        }))
                      }
                      className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      How many hours?
                    </label>
                    <select
                      value={bookingDetails.hours}
                      onChange={handleHoursChange}
                      className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((hour) => (
                        <option key={hour} value={hour}>
                          {hour}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      PWD
                    </label>
                    <select
                      value={bookingDetails.isPWD ? "Yes" : "No"}
                      onChange={(e) =>
                        setBookingDetails((prev) => ({
                          ...prev,
                          isPWD: e.target.value === "Yes",
                        }))
                      }
                      className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Check-in Time
                    </label>
                    <input
                      type="time"
                      value={bookingDetails.checkInTime}
                      onChange={(e) =>
                        setBookingDetails((prev) => ({
                          ...prev,
                          checkInTime: e.target.value,
                        }))
                      }
                      className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  {selectedSlot && (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold">Selected Slot:</h3>
                      <p className="text-xl">{`${selectedArea} ${selectedSlot.rowName}-${selectedSlot.slotNumber}`}</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 sm:mt-6">
                  <h3 className="text-lg font-semibold">Total Amount:</h3>
                  <p className="text-3xl sm:text-4xl font-bold">
                    Php {totalAmount.toFixed(2)}
                  </p>
                </div>

                <button
                  onClick={handleReserveBooking}
                  className={`w-full py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base ${
                    isBookingLocked
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-sky-400 text-white hover:bg-sky-500"
                  }`}
                  disabled={isBookingLocked || !isValidCheckInTime()}
                >
                  {isBookingLocked
                    ? `Booking Locked (${formatBookingTime()})`
                    : "Reserve Booking"}
                </button>

                {/* Generate Receipt button */}
                {isBookingLocked && (
                  <button
                    onClick={generateReceipt}
                    className="w-full py-2 sm:py-3 mt-4 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors text-sm sm:text-base"
                  >
                    Generate Receipt
                  </button>
                )}

                {/* Barcode display */}
                {isBookingLocked && (
                  <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-4" ref={containerRef}>
                    <h3 className="text-base sm:text-lg font-semibold">Barcode:</h3>
                    <svg ref={barcodeRef} className="w-full"></svg>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Show this barcode at the mall counter for payment.
                    </p>
                  </div>
                )}

                {/* Show warning for invalid check-in time */}
                {bookingDetails.checkInTime && !isValidCheckInTime() && (
                  <p className="text-red-500 text-sm mt-2">
                    Please select a valid check-in time within the next 24
                    hours.
                  </p>
                )}

          
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Booking Receipt Modal */}
      {showReceipt && activeBooking && (
        <BookingReceipt
          booking={activeBooking}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  );
};

export default UserDashboard;