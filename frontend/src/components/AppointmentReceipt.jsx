import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowDownTrayIcon, PrinterIcon } from "@heroicons/react/24/outline";
import { QRCodeSVG } from "qrcode.react";
import "./AppointmentReceipt.css";

const dateFormat = new Intl.DateTimeFormat("en-IN", {
  day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata",
});

function Receipt({ booking }) {
  const id = booking.booking_id ?? booking.bookingId;
  const dateValue = booking.selectedDate || booking.scheduled_date;
  const date = dateValue ? new Date(dateValue) : null;
  const time = booking.scheduled_time || booking.selectedTimeSlot?.time;
  const details = [
    ["Patient", booking.patientName],
    ["Patient ID", booking.patientCode || booking.patientId],
    ["Appointment date", date && Number.isFinite(date.getTime()) ? dateFormat.format(date) : null],
    ["Appointment time", time && `${time.slice(0, 5)} IST`],
    ["Doctor", booking.selectedDoctor?.name],
    ["Therapy", booking.therapy_type || booking.recommendedTreatment?.therapy?.name],
    ["Branch", booking.selectedCenter?.name],
    ["Duration", booking.duration_minutes ? `${booking.duration_minutes} minutes` : null],
  ];

  return (
    <article className="appointment-receipt-sheet" aria-label="Panchakarma appointment receipt">
      <header className="appointment-receipt-brand">
        <img src="/assets/logo.jpg" width="48" height="48" alt="" />
        <div>
          <strong>AyurSutra</strong>
          <p>Ayurvedic Wellness Platform</p>
        </div>
      </header>

      <div className="appointment-receipt-heading">
        <div>
          <p className="appointment-receipt-kicker">Panchakarma appointment</p>
          <h2>Booking receipt</h2>
        </div>
        <div className="appointment-receipt-reference">
          <span>Booking ID</span>
          <strong>{id ?? "Unavailable"}</strong>
        </div>
      </div>

      <p className="appointment-receipt-status">
        Status <strong>{(booking.status || "pending").replaceAll("_", " ")}</strong>
      </p>
      <dl className="appointment-receipt-details">
        {details.filter(([, value]) => value).map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
        {booking.selectedCenter?.address && (
          <div className="appointment-receipt-address">
            <dt>Address</dt>
            <dd>{booking.selectedCenter.address}</dd>
          </div>
        )}
      </dl>

      <footer className="appointment-receipt-check-in">
        <div>
          <h3>Check-in</h3>
          <p>Bring this receipt to the clinic. Staff can look up your appointment using the booking ID.</p>
        </div>
        {id != null && <QRCodeSVG value={`AyurSutra booking ${id}`} size={100} marginSize={4} title="Booking QR code" />}
      </footer>
    </article>
  );
}

export default function AppointmentReceipt({ bookingData }) {
  const preview = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  async function downloadPdf() {
    if (!preview.current) return;
    setDownloading(true);
    setError("");
    try {
      const [{ toCanvas }, { jsPDF }] = await Promise.all([import("html-to-image"), import("jspdf")]);
      const canvas = await toCanvas(preview.current, {
        width: 700,
        pixelRatio: 3,
        backgroundColor: "#ffffff",
      });
      const pdf = new jsPDF({ format: "a4", unit: "mm", compress: true });
      const scale = Math.min(182 / canvas.width, 269 / canvas.height);
      const width = canvas.width * scale;
      const id = bookingData.booking_id ?? bookingData.bookingId;
      pdf.setProperties({ title: id == null ? "AyurSutra booking receipt" : `AyurSutra booking receipt ${id}` });
      pdf.addImage(canvas, "PNG", (210 - width) / 2, 14, width, canvas.height * scale);
      const suffix = id == null ? "" : `-${String(id).replace(/[^a-z0-9_-]/gi, "_")}`;
      pdf.save(`AyurSutra-receipt${suffix}.pdf`);
    } catch (failure) {
      console.error("Receipt PDF export failed:", failure);
      setError("The receipt could not be downloaded. Try again or use Print Receipt.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="mx-auto max-w-[700px]">
      <div className="mb-5 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={() => window.print()} className="flex items-center gap-2 rounded-lg bg-green-700 px-4 py-3 font-semibold text-white hover:bg-green-800">
          <PrinterIcon className="h-5 w-5" /> Print Receipt
        </button>
        <button type="button" onClick={downloadPdf} disabled={downloading} className="flex items-center gap-2 rounded-lg border border-green-700 bg-white px-4 py-3 font-semibold text-green-800 hover:bg-green-50 disabled:opacity-50">
          <ArrowDownTrayIcon className="h-5 w-5" /> {downloading ? "Preparing PDF…" : "Download PDF"}
        </button>
      </div>
      {error && <p role="alert" className="mb-4 text-center text-red-700">{error}</p>}
      <div ref={preview}><Receipt booking={bookingData} /></div>
      {createPortal(<div className="appointment-receipt-print" aria-hidden="true"><Receipt booking={bookingData} /></div>, document.body)}
    </div>
  );
}
