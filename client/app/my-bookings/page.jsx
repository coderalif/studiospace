"use client";

import Link from "next/link";
import { ArrowDownToLine, ArrowRight, CalendarDays, Check, Clock3, MapPin, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RequireAuth } from "../../components/RequireAuth";
import { api, apiFile, imageUrl, money, studioId } from "../../lib/api";

function prettyDate(value) {
  return new Date(value).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

function BookingsContent() {
  const [bookings, setBookings] = useState([]);
  const [hostBookings, setHostBookings] = useState([]);
  const [tab, setTab] = useState("guest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingInvoice, setDownloadingInvoice] = useState(null);

  async function loadBookings() {
    setLoading(true);
    setError("");
    try {
      // The dashboard has separate guest and host tabs, so fetch both views together.
      const results = await Promise.all([api("/bookings/mine"), api("/bookings/host")]);
      setBookings(results[0].bookings);
      setHostBookings(results[1].bookings);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadBookings(); }, []);

  async function cancelBooking(id) {
    try {
      const result = await api(`/bookings/${id}/cancel`, { method: "PATCH", body: JSON.stringify({}) });
      toast.success(result.message || "Booking cancelled.");
      setBookings((current) => current.map((booking) => booking._id === id ? { ...booking, status: "Cancelled" } : booking));
    } catch (requestError) {
      toast.error(requestError.message);
    }
  }

  async function changeStatus(id, status) {
    try {
      const result = await api(`/bookings/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
      toast.success(result.message || "Booking updated.");
      setHostBookings((current) => current.map((booking) => booking._id === id ? { ...booking, status } : booking));
    } catch (requestError) {
      toast.error(requestError.message);
    }
  }

  async function downloadInvoice(booking) {
    setDownloadingInvoice(booking._id);
    try {
      const file = await apiFile(`/bookings/${booking._id}/invoice`);
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = `studiospace-invoice-${booking._id}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Your booking invoice is ready.");
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setDownloadingInvoice(null);
    }
  }

  const activeBookings = tab === "guest" ? bookings : hostBookings;

  return <div className="dashboard-page page-container">
    <div className="dashboard-heading"><div><span className="eyebrow">Time well spent</span><h1>Your <em>bookings.</em></h1><p>Your upcoming plans and the creative spaces you’re looking after.</p></div><Link className="button button-dark" href="/studios">Find a space <ArrowRight size={16} /></Link></div>
    <div className="booking-tabs"><button className={tab === "guest" ? "active" : ""} onClick={() => setTab("guest")}>My reservations <span>{bookings.length}</span></button><button className={tab === "host" ? "active" : ""} onClick={() => setTab("host")}>Host requests <span>{hostBookings.length}</span></button></div>
    {error ? <div className="empty-state"><h2>Bookings are having a moment.</h2><p>{error}</p><button className="button button-dark" onClick={loadBookings}>Try again</button></div> :
      loading ? <div className="page-loading"><span className="spinner" /> Gathering your plans…</div> :
        activeBookings.length ? <div className="booking-list">{activeBookings.map((booking) => {
          const studio = booking.studio || {};
          const id = studioId(studio) || booking.studio;
          return <article className="booking-row" key={booking._id}>
            <Link href={`/studios/${id}`} className="booking-thumb"><img src={imageUrl(studio)} alt={booking.studioTitle} /></Link>
            <div className="booking-row-main"><div className="booking-row-title"><Link href={`/studios/${id}`}>{booking.studioTitle}</Link><span className={`status-pill status-${booking.status?.toLowerCase()}`}>{booking.status}</span></div><p><CalendarDays size={14} /> {prettyDate(booking.startAt)} – {prettyDate(booking.endAt)}</p><p><MapPin size={14} /> {studio.location || "StudioSpace"}</p>{tab === "host" && booking.renter && <p>Guest: {booking.renter.name} · {booking.renter.email}</p>}</div>
            <div className="booking-row-end"><strong>${money(booking.totalPrice)}</strong><small><Clock3 size={13} /> {booking.guestCount} {booking.guestCount === 1 ? "guest" : "guests"}</small>{tab === "guest" && booking.status === "Confirmed" && <button className="button button-outline button-small" onClick={() => downloadInvoice(booking)} disabled={downloadingInvoice === booking._id}><ArrowDownToLine size={14} /> {downloadingInvoice === booking._id ? "Preparing…" : "Invoice PDF"}</button>}{tab === "guest" && booking.status === "Pending" && <button className="booking-cancel-link" onClick={() => cancelBooking(booking._id)}><X size={14} /> Cancel request</button>}{tab === "host" && booking.status === "Pending" && <div className="host-booking-actions"><button className="button button-dark button-small" onClick={() => changeStatus(booking._id, "Confirmed")}><Check size={14} /> Confirm</button><button className="button button-outline button-small" onClick={() => changeStatus(booking._id, "Cancelled")}>Decline</button></div>}{tab === "host" && booking.status === "Confirmed" && <button className="button button-outline button-small" onClick={() => changeStatus(booking._id, "Completed")}>Mark completed</button>}</div>
          </article>;
        })}</div> :
          <div className="empty-state"><div className="empty-icon"><CalendarDays size={24} /></div><h2>{tab === "guest" ? "A good space is out there." : "No requests just yet."}</h2><p>{tab === "guest" ? "When you find your next creative home base, your reservation will show up here." : "When someone requests one of your spaces, you can review it right here."}</p>{tab === "guest" && <Link className="button button-dark" href="/studios">Explore studios <ArrowRight size={16} /></Link>}</div>}
  </div>;
}

export default function MyBookingsPage() {
  return <RequireAuth><BookingsContent /></RequireAuth>;
}
