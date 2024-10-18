import React, { useRef, useEffect } from 'react';
import QRCode from 'react-qr-code';
import JsBarcode from 'jsbarcode';

const BookingReceipt = ({ booking, onClose }) => {
  const barcodeRef = useRef(null);

  useEffect(() => {
    if (barcodeRef.current && booking.id) {
      JsBarcode(barcodeRef.current, booking.id, {
        format: "CODE128",
        width: 1.5,  
        height: 60,  
        displayValue: true,
        fontSize: 10,  
        margin: 5 
      });
    }
  }, [booking.id]);

  const handlePrint = () => {
    window.print();
  };

  if (!booking) return null;

  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleString() : 'N/A';
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center p-4">
      <div className="bg-white p-4 sm:p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="print:block" id="printableArea">
          {/* Logo */}
          <div className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6">
            <span className="text-sky-400">Park</span>
            <span className="text-gray-800">Based</span>
          </div>
          
          <h2 className="text-lg sm:text-xl font-bold text-center mb-4 sm:mb-6">Parking Receipt</h2>
          <div className="mb-4 sm:mb-6 space-y-1 sm:space-y-2 text-sm sm:text-base">
            <p><strong>Booking ID:</strong> {booking.id || 'N/A'}</p>
            <p><strong>Date:</strong> {formatDate(booking.timestamp)}</p>
            <p><strong>Name:</strong> {`${booking.firstName || ''} ${booking.lastName || ''}`}</p>
            <p><strong>Vehicle Plate:</strong> {booking.plateNumber || 'N/A'}</p>
            <p><strong>Parking Area:</strong> {booking.parkingArea || 'N/A'}</p>
            <p><strong>Slot:</strong> {booking.selectedSlot ? `${booking.selectedSlot.rowName}-${booking.selectedSlot.slotNumber}` : 'N/A'}</p>
            <p><strong>Duration:</strong> {booking.hours || 'N/A'} hours</p>
            <p><strong>Check-in Time:</strong> {formatDate(booking.checkInTime)}</p>
            <p><strong>Total Amount:</strong> Php {booking.totalAmount ? booking.totalAmount.toFixed(2) : 'N/A'}</p>
          </div>
          <div className="flex flex-col items-center mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold mb-2">QR Code</h3>
            {booking.id && <QRCode value={booking.id} size={96} />}
          </div>
          <div className="flex flex-col items-center mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold mb-2">Barcode</h3>
            <svg ref={barcodeRef} className="w-full"></svg>
          </div>
          <p className="text-center text-xs sm:text-sm">Please present this receipt at the parking entrance.</p>
        </div>
        <div className="mt-4 sm:mt-6 flex justify-end space-x-2 sm:space-x-4">
          <button onClick={handlePrint} className="px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base bg-blue-500 text-white rounded hover:bg-blue-600">
            Print
          </button>
          <button onClick={onClose} className="px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base bg-gray-300 rounded hover:bg-gray-400">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingReceipt;
