import React, { useState, useEffect, useCallback } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  getDoc,
  setDoc,
  serverTimestamp,
  onSnapshot,
  writeBatch,
  increment,
} from "firebase/firestore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Calendar, Clock, DollarSign, Car } from "lucide-react";
import { signOut } from "firebase/auth"; 
import { useNavigate } from "react-router-dom"; 

const AdminDashboard = () => {
  const navigate = useNavigate(); 
  const [bookings, setBookings] = useState([]);
  const [profits, setProfits] = useState([]);
  const [selectedTab, setSelectedTab] = useState("bookings");
  const [paidUsers, setPaidUsers] = useState([]);
  const [unpaidUsers, setUnpaidUsers] = useState([]);
  const [parkingStats, setParkingStats] = useState({
    total: 540,
    occupied: 0,
    available: 540,
    carSlots: {
      parking3: 110,
      parking4: 110,
      roofDeck: 110,
    },
    motorSlots: {
      parking3: 70,
      parking4: 70,
      roofDeck: 70,
    },
  });
  const [slotUtilization, setSlotUtilization] = useState([
    { name: "Available", value: 540, color: "#10B981" },
    { name: "Occupied", value: 0, color: "#EF4444" },
  ]);
  const [parkingLocations, setParkingLocations] = useState({
    parking3: {
      name: "Parking 3",
      car: {
        total: 142,
        rows: 8,
        slotsPerRow: 10,
        pwdSlots: 10,
        occupied: 0,
        reserved: 0,
        available: 142,
      },
      motorcycle: {
        total: 59,
        rows: 4,
        slotsPerRow: 15,
        occupied: 0,
        reserved: 0,
        available: 59,
      },
    },
    parking4: {
      name: "Parking 4",
      car: {
        total: 142,
        rows: 8,
        slotsPerRow: 10,
        pwdSlots: 10,
        occupied: 0,
        reserved: 0,
        available: 142,
      },
      motorcycle: {
        total: 59,
        rows: 4,
        slotsPerRow: 15,
        occupied: 0,
        reserved: 0,
        available: 59,
      },
    },
    roofDeck: {
      name: "Roof Deck",
      car: {
        total: 142,
        rows: 8,
        slotsPerRow: 10,
        pwdSlots: 10,
        occupied: 0,
        reserved: 0,
        available: 142,
      },
      motorcycle: {
        total: 90,
        rows: 6,
        slotsPerRow: 15,
        occupied: 0,
        reserved: 0,
        available: 90,
      },
    },
  });
  const [parkingStatus, setParkingStatus] = useState({});

  const formatCheckInTime = useCallback((timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  }, []);

  const formatFirestoreTimestamp = useCallback((timestamp) => {
    if (!timestamp || !timestamp.toDate) {
      return "N/A";
    }
    return timestamp.toDate().toLocaleString();
  }, []);

  const fetchUserName = useCallback(async (userId) => {
    try {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return `${userData.firstName} ${userData.lastName}`;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
    return "Unknown User";
  }, []);

  const updateBookingStatus = useCallback(async (booking) => {
    const now = new Date();
    const checkInTime = new Date(booking.date);
    checkInTime.setHours(parseInt(booking.checkInTime.split(":")[0]));
    checkInTime.setMinutes(parseInt(booking.checkInTime.split(":")[1]));

    const endTime = new Date(
      checkInTime.getTime() + booking.hours * 60 * 60 * 1000
    );

    if (now >= endTime && booking.status === "approved") {
      try {
        const batch = writeBatch(db); 
        const bookingRef = doc(db, "bookings", booking.id);
        batch.update(bookingRef, { status: "completed" });

        console.log(`Booking ${booking.id} marked as completed`);
        await batch.commit(); 
        return true;
      } catch (error) {
        console.error("Error updating booking status:", error);
      }
    }
    return false;
  }, []);

  const fetchBookings = useCallback(() => {
    const bookingsRef = collection(db, "bookings");

    const q = query(bookingsRef);

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const bookingsData = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const bookingData = doc.data();
          const userName = await fetchUserName(bookingData.userId);
          return {
            id: doc.id,
            ...bookingData,
            userName,
            checkInTime: bookingData.checkInTime, 
          };
        })
      );
      setBookings(bookingsData);
    });

    return () => unsubscribe();
  }, [fetchUserName]);

  const fetchProfits = useCallback(async () => {
    try {
      const profitsRef = collection(db, "profits");
      const snapshot = await getDocs(profitsRef);
      const profitsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProfits(profitsData);
    } catch (error) {
      console.error("Error fetching profits:", error);
    }
  }, []);

  const fetchParkingData = useCallback(async () => {
    try {
      // Gonna remove logic related to parkingSlots collection because it's causing a bug
      // and we didn't manually input it in the database

      // const parkingSlotsRef = collection(db, "parkingSlots");
      // const querySnapshot = await getDocs(parkingSlotsRef);
      // let total = 0;
      // let occupied = 0;
      // let reserved = 0;
      // let available = 0;
      // let pwd = 0;
      // querySnapshot.forEach((doc) => {
      //   const slotData = doc.data();
      //   total++;
      //   switch (slotData.status) {
      //     case "occupied":
      //       occupied++;
      //       break;
      //     case "reserved":
      //       reserved++;
      //       break;
      //     case "available":
      //       available++;
      //       break;
      //   }
      //   if (slotData.isPWD) {
      //     pwd++;
      //   }
      // });
      // setParkingStats({
      //   total,
      //   occupied,
      //   reserved,
      //   available,
      //   pwd,
      // });
      // setSlotUtilization([
      //   { name: "Available", value: available, color: "#10B981" },
      //   { name: "Occupied", value: occupied, color: "#EF4444" },
      //   { name: "Reserved", value: reserved, color: "#F59E0B" },
      //   { name: "PWD", value: pwd, color: "#3B82F6" },
      // ]);
    } catch (error) {
      console.error("Error fetching parking data:", error);
    }
  }, []);

  useEffect(() => {
    const paid = bookings.filter((b) => b.status === "approved" && b.isPaid);
    const unpaid = bookings.filter((b) => b.status === "approved" && !b.isPaid);
    setPaidUsers(paid);
    setUnpaidUsers(unpaid);
  }, [bookings]);

  useEffect(() => {
    // Set up a single listener for all parking areas
    const parkingStatusRef = doc(db, "parkingStatus", "current");
    const unsubscribe = onSnapshot(parkingStatusRef, (doc) => {
      if (doc.exists()) {
        setParkingStatus(doc.data());
      }
    });

    return () => unsubscribe();
  }, []);

  const updateParkingStatus = useCallback(async (updates) => {
    const batch = writeBatch(db);
    const parkingStatusRef = doc(db, "parkingStatus", "current");

    // Again, we're gonna remove logic related to updating parking slots
    // Object.entries(updates.locations || {}).forEach(([locationKey, locationData]) => {
    //   Object.entries(locationData).forEach(([vehicleType, typeData]) => {
    //     const { occupied, reserved } = typeData;
    //     for (let i = 1; i <= typeData.total; i++) {
    //       const slotId = `${locationKey}_${vehicleType}_${i}`;
    //       const slotRef = doc(db, "parkingSlots", slotId);
    //       if (i <= occupied) {
    //         batch.set(slotRef, { status: "occupied" }, { merge: true });
    //       } else if (i <= occupied + reserved) {
    //         batch.set(slotRef, { status: "reserved" }, { merge: true });
    //       } else {
    //         batch.set(slotRef, { status: "available" }, { merge: true });
    //       }
    //     }
    //   });
    // });

    await batch.commit();
  }, []);

  const handleBookingAction = useCallback(
    async (bookingId, action, parkingArea, vehicleType) => {
      const batch = writeBatch(db);
      const bookingRef = doc(db, "bookings", bookingId);
      const parkingStatusRef = doc(db, "parkingStatus", "current");

      batch.update(bookingRef, {
        status: action,
        approvalTimestamp: serverTimestamp(),
      });

      batch.update(parkingStatusRef, {
        [`locations.${parkingArea}.${vehicleType}.${
          action === "approved" ? "occupied" : "available"
        }`]: increment(1),
        [`locations.${parkingArea}.${vehicleType}.${
          action === "approved" ? "available" : "occupied"
        }`]: increment(-1),
        lastUpdated: serverTimestamp(),
      });

      await batch.commit();
    },
    []
  );

  const handlePaymentApproval = async (bookingId, action) => {
    try {
      const bookingRef = doc(db, "bookings", bookingId);
      const bookingDoc = await getDoc(bookingRef);
      const bookingData = bookingDoc.data();

      const updateData = {
        paymentApproved: action === "approved",
        isPaid: action === "approved",
        paymentTimestamp: action === "approved" ? serverTimestamp() : null,
      };

      await updateDoc(bookingRef, updateData);

      if (action === "approved") {
        const totalAmount = bookingData.totalAmount || 0;
        const date = new Date().toISOString().split("T")[0];

        const profitRef = doc(db, "profits", date);
        const profitDoc = await getDoc(profitRef);

        if (profitDoc.exists()) {
          await updateDoc(profitRef, {
            amount: profitDoc.data().amount + totalAmount,
          });
        } else {
          await setDoc(profitRef, { date, amount: totalAmount });
        }

        await fetchProfits();
        console.log("Profits updated and fetched");
      }

      fetchBookings();
    } catch (error) {
      console.error("Error updating payment approval:", error);
    }
  };

  const handleCheckout = async (bookingId) => {
    try {
      const bookingRef = doc(db, "bookings", bookingId);
      const bookingDoc = await getDoc(bookingRef);
      const bookingData = bookingDoc.data();

      if (bookingData.selectedSlot) {
        const slotRef = doc(db, "parkingSlots", bookingData.selectedSlot.id);
        await updateDoc(slotRef, {
          status: "available",
          isPWD: false,
        });
      }

      await updateDoc(bookingRef, {
        status: "completed",
        checkOutTime: serverTimestamp(),
      });

      await fetchParkingData();
      await fetchBookings();

      console.log(`Booking ${bookingId} checked out successfully`);
    } catch (error) {
      console.error("Error checking out:", error);
    }
  };

  useEffect(() => {
    const unsubscribeBookings = fetchBookings();
    fetchProfits();

    // Set up a real-time listener for parking status to update the status in the database
    const parkingStatusRef = doc(db, "parkingStatus", "current");
    const unsubscribeParkingStatus = onSnapshot(parkingStatusRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setParkingStats({
          total: data.total || 0,
          occupied: data.occupied || 0,
          reserved: data.reserved || 0,
          available: data.available || 0,
          pwd: data.pwd || 0,
        });
        setSlotUtilization([
          { name: "Available", value: data.available || 0, color: "#10B981" },
          { name: "Occupied", value: data.occupied || 0, color: "#EF4444" },
          { name: "Reserved", value: data.reserved || 0, color: "#F59E0B" },
          { name: "PWD", value: data.pwd || 0, color: "#3B82F6" },
        ]);
        setParkingLocations(data.locations || {});
      }
    });

    return () => {
      unsubscribeBookings();
      unsubscribeParkingStatus();
    };
  }, [fetchBookings, fetchProfits]);

  useEffect(() => {
    fetchParkingData();

    // Set up an interval to fetch data every 5 minutes to prevent exceeding of quota in the database
    const intervalId = setInterval(fetchParkingData, 5 * 60 * 1000);

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [fetchParkingData]);

  const totalSlots = 540; // Set total slots as a constant

  // Update the parkingStats state based on fetched data
  const updateParkingStats = useCallback((bookings) => {
    const occupiedSlots = bookings.filter(
      (booking) => booking.status === "approved" && !booking.checkOutTime
    ).length;

    const availableSlots = totalSlots - occupiedSlots; // Calculate available slots

    setParkingStats((prevStats) => {
      const newStats = {
        ...prevStats,
        occupied: occupiedSlots,
        available: availableSlots,
        total: totalSlots, 
      };

      setSlotUtilization([
        { name: "Available", value: newStats.available, color: "#10B981" },
        { name: "Occupied", value: newStats.occupied, color: "#EF4444" },
      ]);

      return newStats;
    });
  }, []);

  useEffect(() => {
    const bookingsRef = collection(db, "bookings");
    const activeBookingsQuery = query(
      bookingsRef,
      where("status", "==", "approved")
    );

    const unsubscribe = onSnapshot(activeBookingsQuery, (snapshot) => {
      const activeBookings = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      updateParkingStats(activeBookings);
    });

    return () => unsubscribe();
  }, [updateParkingStats]);

  const renderAnalytics = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow p-4 md:p-6">
        <h2 className="text-xl md:text-2xl font-bold mb-4">Monthly Revenue</h2>
        <div className="h-60 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={profits}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 md:p-6">
        <h2 className="text-xl md:text-2xl font-bold mb-4">Slot Utilization</h2>
        <div className="h-60 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={slotUtilization} // Use updated slot utilization
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius="80%"
                label={({ name, value, percent }) =>
                  `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                }
              >
                {slotUtilization.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const StatCard = ({ icon: Icon, label, value, className }) => (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center">
        <Icon className={`h-6 w-6 md:h-8 md:w-8 ${className}`} />
        <div className="ml-4">
          <p className="text-sm md:text-base text-gray-500">{label}</p>
          <p className="text-lg md:text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );

  const handleLogout = async () => {
    try {
      await signOut(auth); 
      console.log("Admin logged out successfully");
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gray-900 text-white p-4">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
          <div className="text-xl md:text-2xl font-bold mb-4 sm:mb-0">
            <span className="text-sky-400">Park</span>Based Admin
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleLogout} 
              className="px-3 py-1 md:px-4 md:py-2 rounded-full text-sm md:text-base border border-white hover:bg-white hover:text-gray-900 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-4 md:p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <StatCard
            icon={Car}
            label="Total Slots"
            value={parkingStats.total} 
            className="text-sky-500"
          />
          <StatCard
            icon={Car}
            label="Available Slots"
            value={parkingStats.available} 
            className="text-green-500"
          />
          <StatCard
            icon={Clock}
            label="Occupied Slots"
            value={parkingStats.occupied} 
            className="text-red-500"
          />
          <StatCard
            icon={DollarSign}
            label="Today's Revenue"
            value={`₱${profits
              .filter((p) => p.date === new Date().toISOString().split("T")[0])
              .reduce((sum, p) => sum + p.amount, 0)
              .toFixed(2)}`}
            className="text-sky-500"
          />
        </div>

        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setSelectedTab("bookings")}
            className={`px-4 py-2 rounded-full text-sm md:text-base transition-colors duration-300 ease-in-out ${
              selectedTab === "bookings"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-gray-900 border border-blue-600 hover:bg-blue-600 hover:text-white"
            }`}
          >
            Bookings
          </button>
          <button
            onClick={() => setSelectedTab("analytics")}
            className={`px-4 py-2 rounded-full text-sm md:text-base transition-colors duration-300 ease-in-out ${
              selectedTab === "analytics"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-gray-900 border border-blue-600 hover:bg-blue-600 hover:text-white"
            }`}
          >
            Analytics
          </button>
        </div>

        {selectedTab === "bookings" ? (
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold mb-4">
                Recent Bookings
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Area
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Slot
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check-in Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                          {booking.userName}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                          {booking.parkingArea}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                          {booking.selectedSlot
                            ? `${booking.selectedSlot.rowName}-${booking.selectedSlot.slotNumber}`
                            : "Not selected"}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                          {booking.hours} hours
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                          ₱{booking.totalAmount}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              booking.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : booking.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {booking.status === "pending" && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() =>
                                  handleBookingAction(
                                    booking.id,
                                    "approved",
                                    booking.parkingArea,
                                    booking.vehicleType
                                  )
                                }
                                className="text-green-600 hover:text-green-900"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  handleBookingAction(
                                    booking.id,
                                    "declined",
                                    booking.parkingArea,
                                    booking.vehicleType
                                  )
                                }
                                className="text-red-600 hover:text-red-900"
                              >
                                Decline
                              </button>
                            </div>
                          )}
                          {booking.status === "approved" && booking.isPaid && (
                            <button
                              onClick={() => handleCheckout(booking.id)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Checkout
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {booking.status === "approved" && !booking.isPaid && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() =>
                                  handlePaymentApproval(booking.id, "approved")
                                }
                                className="text-green-600 hover:text-green-900"
                              >
                                Mark as Paid
                              </button>
                              <button
                                onClick={() =>
                                  handlePaymentApproval(booking.id, "declined")
                                }
                                className="text-red-600 hover:text-red-900"
                              >
                                Mark as Unpaid
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {formatCheckInTime(booking.checkInTime)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          renderAnalytics()
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;