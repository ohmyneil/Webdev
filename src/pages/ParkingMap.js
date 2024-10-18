import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

const ParkingSpace = ({
  id,
  status,
  isPWD,
  isSelected,
  onClick,
  type = "car",
  slotNumber,
  rowName,
}) => {
  let bgColor = "bg-gray-200";
  if (status === "occupied") bgColor = "bg-red-500";
  if (status === "reserved") bgColor = "bg-green-500";
  if (isPWD) bgColor = "bg-blue-500";
  if (isSelected) bgColor = "bg-sky-400";

  const spaceSize = "h-20 w-40";
  const borderStyle = "border-white border-2";

  return (
    <div
      onClick={() => status !== "occupied" && onClick()}
      className={`${bgColor} ${spaceSize} ${borderStyle} relative cursor-pointer transition-colors hover:opacity-80 rounded-sm ${
        status === "occupied" ? "cursor-not-allowed" : ""
      }`}
    >

      <div className="absolute bottom-1 left-1 text-xs text-white font-bold">
        {`${rowName}-${slotNumber}`}
      </div>

      {isPWD && (
        <div className="absolute inset-0 flex items-center justify-center text-white text-sm font-bold">
          PWD
        </div>
      )}
    </div>
  );
};


const ParkingRow = ({
  rowName,
  startId,
  count,
  type,
  onSpaceClick,
  selectedSpace,
  parkingSlots,
  isAisle,
}) => {
  return (
    <div className={`flex justify-center mb-4 ${isAisle ? "h-8" : ""}`}>

      {!isAisle && (
        <div className="flex items-center justify-center w-12 mr-2 font-bold text-gray-700">
          {rowName}
        </div>
      )}
      {Array.from({ length: count }).map((_, index) => {
        const spaceId = `${startId}-${index}`;
        const spaceData = parkingSlots.find((slot) => slot.id === spaceId) || {
          status: "available",
          isPWD: false,
        };

        return (
          <ParkingSpace
            key={spaceId}
            id={spaceId}
            status={spaceData.status}
            isPWD={spaceData.isPWD}
            type={type}
            onClick={() => onSpaceClick({
              id: spaceId,
              rowName,
              slotNumber: index + 1
            })}
            isSelected={selectedSpace === spaceId}
            slotNumber={index + 1}
            rowName={rowName}
          />
        );
      })}
    </div>
  );
};

const ParkingMap = ({ selectedArea, onSpaceSelect, vehicleType = "car" }) => {
  const [parkingSlots, setParkingSlots] = useState([]);
  const [selectedSpace, setSelectedSpace] = useState(null);

  useEffect(() => {
    const fetchParkingSlots = async () => {
      const slotsCollection = collection(db, "parkingSlots");
      const snapshot = await getDocs(slotsCollection);
      setParkingSlots(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchParkingSlots();
  }, []);

  const handleSpaceClick = (spaceInfo) => {
    setSelectedSpace(spaceInfo.id);
    onSpaceSelect(spaceInfo);
  };

  const getTotalSlots = () => (vehicleType === "car" ? 142 : 90);
  const rowsNeeded = Math.ceil(getTotalSlots() / 10);
  const aisles = Math.floor(rowsNeeded / 2);


  const getRowName = (index) => String.fromCharCode(65 + index);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="overflow-auto max-h-[70vh] p-4">
        <div className="space-y-8">
 
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-500 rounded p-2 text-center text-white">ENTRANCE</div>
            <div className="bg-gray-300 rounded"></div>
            <div className="bg-red-500 rounded p-2 text-center text-white">EXIT</div>
          </div>


          <div className="space-y-6">
            {Array.from({ length: rowsNeeded + aisles }).map((_, rowIndex) => (
              <ParkingRow
                key={rowIndex}
                rowName={getRowName(Math.floor(rowIndex / 2))}
                startId={`${selectedArea}-ROW${Math.floor(rowIndex / 2)}`}
                count={rowIndex % 2 === 0 ? 10 : 0}
                type={vehicleType}
                onSpaceClick={handleSpaceClick}
                selectedSpace={selectedSpace}
                parkingSlots={parkingSlots}
                isAisle={rowIndex % 2 !== 0}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 justify-center border-t pt-4">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-200 mr-2"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-500 mr-2"></div>
          <span>Occupied</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-500 mr-2"></div>
          <span>Reserved</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-500 mr-2"></div>
          <span>PWD</span>
        </div>
      </div>
    </div>
  );
};

export default ParkingMap;