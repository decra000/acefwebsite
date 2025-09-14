import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL, STATIC_URL } from "../config";
import { useNavigate } from "react-router-dom";

const LatestEvent = () => {
  const [latestEvent, setLatestEvent] = useState(null);
  const navigate = useNavigate();

  // Fetch latest event
  useEffect(() => {
    const fetchLatestEvent = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/events`);
        if (data.length > 0) {
          // sort by start_date (nearest upcoming first)
          const sorted = data.sort(
            (a, b) => new Date(a.start_date) - new Date(b.start_date)
          );
          setLatestEvent(sorted[0]);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    fetchLatestEvent();
  }, []);

  if (!latestEvent) {
    return (
      <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
        No events available at the moment.
      </div>
    );
  }

  // Navigate to event page with modal
  const handleEventClick = (event) => {
    navigate(`/events?eventId=${event.id}`);
  };

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "2rem auto",
        padding: "1.5rem",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        fontFamily: "sans-serif",
        backgroundColor: "#fff",
      }}
    >
      {/* Header */}
      <h2
        style={{
          fontSize: "1.75rem",
          fontWeight: "700",
          marginBottom: "1rem",
          color: "#1e293b",
          textAlign: "center",
        }}
      >
        Latest Event
      </h2>

      {/* Event Image */}
      {latestEvent.image_url && (
        <img
          src={`${STATIC_URL}${latestEvent.image_url}`}
          alt={latestEvent.title}
          style={{
            width: "100%",
            height: "auto",
            borderRadius: "10px",
            marginBottom: "1rem",
            cursor: "pointer",
          }}
          onClick={() => handleEventClick(latestEvent)}
        />
      )}

      {/* Event Info */}
      <h3
        style={{
          fontSize: "1.5rem",
          margin: "0.5rem 0",
          color: "#334155",
          cursor: "pointer",
        }}
        onClick={() => handleEventClick(latestEvent)}
      >
        {latestEvent.title}
      </h3>
      <p style={{ color: "#64748b", marginBottom: "1rem" }}>
        {latestEvent.description?.length > 150
          ? latestEvent.description.substring(0, 150) + "..."
          : latestEvent.description}
      </p>

      <p style={{ margin: "0.25rem 0", fontWeight: "500" }}>
        📍 {latestEvent.location || "TBA"}
      </p>
      <p style={{ margin: "0.25rem 0", fontWeight: "500" }}>
        🗓 {new Date(latestEvent.start_date).toLocaleString()}{" "}
        {latestEvent.end_date
          ? ` - ${new Date(latestEvent.end_date).toLocaleString()}`
          : ""}
      </p>
      <p style={{ margin: "0.25rem 0", fontWeight: "500" }}>
        💲{" "}
        {latestEvent.is_paid
          ? `${latestEvent.currency} ${latestEvent.price}`
          : "Free"}
      </p>

      {/* View & Apply Button */}
      <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
        <button
          onClick={() => handleEventClick(latestEvent)}
          style={{
            backgroundColor: "#2563eb",
            color: "#fff",
            border: "none",
            padding: "0.75rem 1.5rem",
            borderRadius: "8px",
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          View & Apply
        </button>
      </div>
    </div>
  );
};

export default LatestEvent;
