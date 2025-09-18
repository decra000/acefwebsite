


import React, { useState, useEffect } from "react";
import { Download, Share2, Calendar, MapPin, DollarSign } from "lucide-react";
import axios from "axios";
import { API_URL, STATIC_URL } from '../../config';


const LatestEvent = () => {
  const [latestEvent, setLatestEvent] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  
  
  // Mock navigate function - replace with actual useNavigate() hook
  const navigate = (path) => {
    console.log("Would navigate to:", path);
    // In your actual project: const navigate = useNavigate();
  };

  // Fetch latest event - restore your original logic
  useEffect(() => {
    const fetchLatestEvent = async () => {
      try {
        // Mock fetch for demo - replace with actual axios call
        const { data } = await axios.get(`${API_URL}/events`);
        

        
        if (data.length > 0) {
          // Sort by start_date (nearest upcoming first) - your original logic
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

  // Navigate to event page with modal - your original logic
  const handleEventClick = (event) => {
    navigate(`/events?eventId=${event.id}`);
  };

const handleDownload = (e) => {
  e.stopPropagation();

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = 400;
  canvas.height = 600;

  const img = new Image();
  img.crossOrigin = "anonymous"; 
  img.src = `${STATIC_URL}${latestEvent.image_url}`;

  img.onload = () => {
    // Get aspect ratios
    const imgAspect = img.width / img.height;
    const canvasAspect = canvas.width / canvas.height;

    let renderWidth, renderHeight, offsetX, offsetY;

    if (imgAspect > canvasAspect) {
      // Image is wider than canvas → fit height
      renderHeight = canvas.height;
      renderWidth = img.width * (canvas.height / img.height);
      offsetX = (canvas.width - renderWidth) / 2;
      offsetY = 0;
    } else {
      // Image is taller than canvas → fit width
      renderWidth = canvas.width;
      renderHeight = img.height * (canvas.width / img.width);
      offsetX = 0;
      offsetY = (canvas.height - renderHeight) / 2;
    }

    // Draw the image preserving aspect ratio
    ctx.drawImage(img, offsetX, offsetY, renderWidth, renderHeight);

    // Overlay a gradient at the bottom for text readability
    const gradient = ctx.createLinearGradient(0, canvas.height - 150, 0, canvas.height);
    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(1, "rgba(0,0,0,0.6)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, canvas.height - 150, canvas.width, 150);

    // Add text on top
    ctx.fillStyle = "white";
    ctx.font = "bold 20px sans-serif";
    ctx.fillText(latestEvent.title, 20, canvas.height - 110);

    ctx.font = "14px sans-serif";
    ctx.fillText(
      new Date(latestEvent.start_date).toLocaleDateString(),
      20,
      canvas.height - 80
    );

    ctx.fillText(latestEvent.location || "Venue TBA", 20, canvas.height - 50);

    // Save poster
    const link = document.createElement("a");
    link.download = `${latestEvent.title.replace(/\s+/g, "-")}-poster.png`;
    canvas.toBlob((blob) => {
      link.href = URL.createObjectURL(blob);
      link.click();
    });
  };

  img.onerror = () => {
    console.error("Failed to load event image for poster");
  };
};




  const handleShare = (e) => {
    e.stopPropagation();
    // Implement share logic
    if (navigator.share) {
      navigator.share({
        title: latestEvent?.title,
        text: latestEvent?.one_liner,
        url: window.location.href,
      });
    } else {
      // Fallback share logic
      console.log("Share event");
    }
  };

if (!latestEvent) {
  return null;
}


  const posterStyle = {
    position: "relative",
    width: "400px",
    height: "600px",
    margin: "0 auto",
    borderRadius: "24px",
    overflow: "hidden",
    cursor: "pointer",
    background: latestEvent.image_url && STATIC_URL
      ? `linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.8) 100%), url(${STATIC_URL}${latestEvent.image_url})`
      : "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
    backgroundSize: "cover",
    backgroundPosition: "center",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255,255,255,0.1)",
    transform: isHovered ? "scale(1.02)" : "scale(1)",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  };

  const overlayStyle = {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.9) 100%)",
    zIndex: 1,
  };

  const contentStyle = {
    position: "absolute",
    inset: 0,
    zIndex: 2,
    padding: "32px 24px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    color: "white",
  };

  const titleStyle = {
    fontSize: "28px",
    fontWeight: "800",
    lineHeight: "1.2",
    marginBottom: "8px",
    textShadow: "0 2px 4px rgba(0,0,0,0.5)",
    background: "linear-gradient(45deg, #fff, #e2e8f0)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  };

  const detailStyle = {
    fontSize: "11px",
    fontWeight: "500",
    opacity: "0.9",
    marginBottom: "4px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    textShadow: "0 1px 2px rgba(0,0,0,0.5)",
  };

  const one_linerStyle = {
    fontSize: "11px",
    lineHeight: "1.4",
    opacity: "0.8",
    marginBottom: "16px",
    textShadow: "0 1px 2px rgba(0,0,0,0.5)",
  };

  const buttonContainerStyle = {
    display: "flex",
    gap: "12px",
    opacity: isHovered ? 1 : 0,
    transform: isHovered ? "translateY(0)" : "translateY(10px)",
    transition: "all 0.3s ease",
  };

  const buttonStyle = {
    flex: 1,
    padding: "12px 16px",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "12px",
    backgroundColor: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(10px)",
    color: "white",
    fontSize: "10px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    textAlign: "center",
  };

  const utilityButtonsStyle = {
    position: "absolute",
    top: "20px",
    right: "20px",
    display: "flex",
    gap: "8px",
    zIndex: 3,
  };

  const utilityButtonStyle = {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
    color: "white",
  };

  // Placeholder image component
  const PlaceholderImage = () => (
    <div style={{
      position: "absolute",
      inset: 0,
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "48px",
      opacity: "0.3",
    }}>
      🎯
    </div>
  );

  return (
    <div
      style={posterStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => handleEventClick(latestEvent)}
    >
      {!latestEvent.image_url && <PlaceholderImage />}
      
      <div style={overlayStyle} />
      
      {/* Utility buttons */}
      <div style={utilityButtonsStyle}>
        <button
          style={utilityButtonStyle}
          onClick={handleDownload}
          onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(255,255,255,0.2)"}
          onMouseLeave={(e) => e.target.style.backgroundColor = "rgba(255,255,255,0.1)"}
        >
          <Download size={16} />
        </button>
        <button
          style={utilityButtonStyle}
          onClick={handleShare}
          onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(255,255,255,0.2)"}
          onMouseLeave={(e) => e.target.style.backgroundColor = "rgba(255,255,255,0.1)"}
        >
          <Share2 size={16} />
        </button>
      </div>

      <div style={contentStyle}>
        <div>
          <h1 style={titleStyle}>{latestEvent.title}</h1>
          <p style={one_linerStyle}>
            {latestEvent.one_liner?.length > 120
              ? latestEvent.one_liner.substring(0, 120) + "..."
              : latestEvent.one_liner || "Join us for an amazing event experience"}
          </p>
        </div>

        <div>
          <div style={detailStyle}>
            <MapPin size={14} />
            {latestEvent.location || "Venue TBA"}
          </div>
          <div style={detailStyle}>
            <Calendar size={14} />
            {new Date(latestEvent.start_date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric"
            })}
          </div>
          <div style={detailStyle}>
            <DollarSign size={14} />
            {latestEvent.is_paid
              ? `${latestEvent.currency || "$"} ${latestEvent.price}`
              : "Free Entry"}
          </div>

          <div style={buttonContainerStyle}>
            <button
              style={buttonStyle}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "rgba(255,255,255,0.2)";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "rgba(255,255,255,0.1)";
                e.target.style.transform = "translateY(0)";
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleEventClick(latestEvent);
              }}
            >
              MORE ABOUT
            </button>
            <button
              style={{
                ...buttonStyle,
                background: "linear-gradient(45deg, #667eea, #764ba2)",
                border: "1px solid rgba(255,255,255,0.3)",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "linear-gradient(45deg, #5a6fd8, #6a42a0)";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "linear-gradient(45deg, #667eea, #764ba2)";
                e.target.style.transform = "translateY(0)";
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleEventClick(latestEvent);
              }}
            >
              APPLY NOW
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LatestEvent;