// src/components/LatestEvent.jsx (mobile optimized)
import React, { useState, useEffect, useRef } from "react";
import { Download, Share2, Calendar, MapPin, DollarSign } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import QRCode from "qrcode";
import { API_URL, STATIC_URL } from "../../config";
import { useLogo } from "../../context/LogoContext";

const LatestEvent = ({ onEventStatus }) => {
  const [latestEvent, setLatestEvent] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { currentLogo } = useLogo();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const resolveUrl = (path) => {
    if (!path) return null;
    return path.startsWith("http") ? path : `${STATIC_URL}${path}`;
  };

  useEffect(() => {
    const fetchLatestEvent = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get(`${API_URL}/events`);
        let eventFound = false;
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        
        if (Array.isArray(data) && data.length > 0) {
          const futureEvents = data.filter(event => {
            if (!event.start_date) return true;
            const eventDate = new Date(event.start_date);
            eventDate.setHours(0, 0, 0, 0);
            return eventDate >= currentDate;
          }).sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
          
          if (futureEvents.length > 0) {
            setLatestEvent(futureEvents[0]);
            eventFound = true;
          }
        } else if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
          const futureEvents = data.data.filter(event => {
            if (!event.start_date) return true;
            const eventDate = new Date(event.start_date);
            eventDate.setHours(0, 0, 0, 0);
            return eventDate >= currentDate;
          }).sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
          
          if (futureEvents.length > 0) {
            setLatestEvent(futureEvents[0]);
            eventFound = true;
          }
        }
        
        if (onEventStatus) {
          onEventStatus(eventFound);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        if (onEventStatus) {
          onEventStatus(false);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLatestEvent();
  }, [onEventStatus]);

  if (isLoading || !latestEvent) {
    return null;
  }

  const handleEventClick = (event) => {
    navigate(`/events?eventId=${event.id}`);
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    if (!latestEvent) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 400;
    canvas.height = 600;

    const bgUrl = resolveUrl(latestEvent.image_url);
    const bgImg = new Image();
    if (bgUrl) {
      bgImg.crossOrigin = "anonymous";
      bgImg.src = bgUrl;
    }

    const drawPoster = async () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (bgUrl && bgImg.complete && bgImg.naturalWidth) {
        const imgAspect = bgImg.width / bgImg.height;
        const canvasAspect = canvas.width / canvas.height;
        let renderWidth, renderHeight, offsetX, offsetY;

        if (imgAspect > canvasAspect) {
          renderHeight = canvas.height;
          renderWidth = bgImg.width * (canvas.height / bgImg.height);
          offsetX = (canvas.width - renderWidth) / 2;
          offsetY = 0;
        } else {
          renderWidth = canvas.width;
          renderHeight = bgImg.height * (canvas.width / bgImg.width);
          offsetX = 0;
          offsetY = (canvas.height - renderHeight) / 2;
        }
        ctx.drawImage(bgImg, offsetX, offsetY, renderWidth, renderHeight);
      } else {
        const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        g.addColorStop(0, "#667eea");
        g.addColorStop(0.5, "#764ba2");
        g.addColorStop(1, "#f093fb");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      const overlay = ctx.createLinearGradient(0, canvas.height - 220, 0, canvas.height);
      overlay.addColorStop(0, "rgba(0,0,0,0)");
      overlay.addColorStop(1, "rgba(0,0,0,0.9)");
      ctx.fillStyle = overlay;
      ctx.fillRect(0, canvas.height - 220, canvas.width, 220);

      const logoPath =
        currentLogo?.logo_url ||
        currentLogo?.file_url ||
        currentLogo?.url ||
        currentLogo?.path ||
        currentLogo?.logo_path;
      const logoSrc = resolveUrl(logoPath);
      if (logoSrc) {
        try {
          const logoImg = new Image();
          logoImg.crossOrigin = "anonymous";
          logoImg.src = logoSrc;
          await new Promise((resolve) => {
            logoImg.onload = () => {
              const maxLogoWidth = 140;
              const maxLogoHeight = 60;
              const naturalW = logoImg.naturalWidth || logoImg.width;
              const naturalH = logoImg.naturalHeight || logoImg.height;
              let drawW = naturalW;
              let drawH = naturalH;
              const ratio = naturalW / naturalH;

              if (drawW > maxLogoWidth) {
                drawW = maxLogoWidth;
                drawH = Math.round(drawW / ratio);
              }
              if (drawH > maxLogoHeight) {
                drawH = maxLogoHeight;
                drawW = Math.round(drawH * ratio);
              }
              const x = (canvas.width - drawW) / 2;
              const y = 14;
              ctx.drawImage(logoImg, x, y, drawW, drawH);
              resolve();
            };
            logoImg.onerror = () => {
              console.warn("Logo failed to load for poster");
              resolve();
            };
          });
        } catch (err) {
          console.warn("Logo drawing error:", err);
        }
      }

      ctx.fillStyle = "white";
      ctx.font = "700 22px sans-serif";
      ctx.textBaseline = "top";
      const pad = 20;
      const maxTextWidth = canvas.width - pad * 2;
      const titleLines = wrapTextLines(ctx, latestEvent.title || "Event", maxTextWidth, 2);
      let textY = canvas.height - 160;
      ctx.font = "700 22px sans-serif";
      for (const line of titleLines) {
        ctx.fillText(line, pad, textY);
        textY += 28;
      }

      ctx.font = "16px sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      const oneLiner = latestEvent.one_liner || "Join us for an amazing experience";
      const oneLines = wrapTextLines(ctx, oneLiner, maxTextWidth, 3);
      for (const line of oneLines) {
        ctx.fillText(line, pad, textY);
        textY += 20;
      }

      ctx.font = "14px sans-serif";
      ctx.fillStyle = "white";
      const dateStr = latestEvent.start_date
        ? new Date(latestEvent.start_date).toLocaleDateString()
        : "Date TBA";
      ctx.fillText(dateStr, pad, canvas.height - 50);
      ctx.fillText(latestEvent.location || "Venue TBA", pad, canvas.height - 30);

      const priceText = latestEvent.is_paid
        ? `${latestEvent.currency || "$"} ${latestEvent.price}`
        : "Free";
      ctx.fillText(priceText, pad + 150, canvas.height - 50);

      try {
        const eventUrl = `${window.location.origin}/events?eventId=${latestEvent.id}`;
        const qrDataUrl = await QRCode.toDataURL(eventUrl, { margin: 1, width: 300 });
        const qrImg = new Image();
        qrImg.src = qrDataUrl;
        await new Promise((resolve) => {
          qrImg.onload = () => {
            const qrSize = 80;
            ctx.drawImage(qrImg, canvas.width - qrSize - 20, canvas.height - qrSize - 20, qrSize, qrSize);
            resolve();
          };
          qrImg.onerror = () => resolve();
        });
      } catch (qrErr) {
        console.warn("QR generation failed:", qrErr);
      }

      const link = document.createElement("a");
      link.download = `${(latestEvent.title || "event").replace(/\s+/g, "-")}-poster.png`;
      canvas.toBlob((blob) => {
        link.href = URL.createObjectURL(blob);
        link.click();
      }, "image/png");
    };

    function wrapTextLines(ctxLocal, text, maxWidth, maxLines = 2) {
      const words = text.split(" ");
      const lines = [];
      let current = "";
      for (const w of words) {
        const test = current ? `${current} ${w}` : w;
        const measured = ctxLocal.measureText(test).width;
        if (measured > maxWidth && current) {
          lines.push(current);
          current = w;
          if (lines.length >= maxLines) break;
        } else {
          current = test;
        }
      }
      if (lines.length < maxLines && current) lines.push(current);
      if (lines.length > maxLines) lines.length = maxLines;
      if (lines.length === maxLines) {
        const last = lines[lines.length - 1];
        while (ctxLocal.measureText(last + "…").width > maxWidth) {
          lines[lines.length - 1] = lines[lines.length - 1].slice(0, -1);
        }
        lines[lines.length - 1] = lines[lines.length - 1] + "…";
      }
      return lines;
    }

    if (bgUrl) {
      if (bgImg.complete) {
        await drawPoster();
      } else {
        const bgLoadPromise = new Promise((resolve) => {
          const to = setTimeout(() => {
            console.warn("bg image load timeout — continue with gradient fallback");
            resolve();
          }, 2000);
          bgImg.onload = () => {
            clearTimeout(to);
            resolve();
          };
          bgImg.onerror = () => {
            clearTimeout(to);
            resolve();
          };
        });
        await bgLoadPromise;
        await drawPoster();
      }
    } else {
      await drawPoster();
    }
  };

  const handleShare = (e) => {
    e.stopPropagation();
    if (!latestEvent) return;
    if (navigator.share) {
      navigator.share({
        title: latestEvent.title,
        text: latestEvent.one_liner,
        url: `${window.location.origin}/events?eventId=${latestEvent.id}`,
      }).catch(err => console.warn("Web share failed:", err));
    } else {
      navigator.clipboard?.writeText(`${window.location.origin}/events?eventId=${latestEvent.id}`)
        .then(() => alert("Event link copied to clipboard"))
        .catch(() => alert("Copy failed — please copy link manually"));
    }
  };

  // Responsive dimensions
  const posterDimensions = isMobile 
    ? { width: '100%', maxWidth: 340, height: 510 }
    : { width: 400, height: 600 };

  const posterStyle = {
    position: "relative",
    width: posterDimensions.width,
    maxWidth: posterDimensions.maxWidth,
    height: posterDimensions.height,
    margin: "0 auto",
    borderRadius: isMobile ? 12 : 16,
    overflow: "hidden",
    cursor: "pointer",
    background: latestEvent.image_url 
      ? `linear-gradient(135deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.55) 100%), url(${resolveUrl(latestEvent.image_url)})` 
      : "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
    backgroundSize: "cover",
    backgroundPosition: "center",
    boxShadow: isMobile 
      ? "0 15px 35px -8px rgba(0,0,0,0.25)" 
      : "0 25px 50px -12px rgba(0,0,0,0.25)",
    transition: "transform .25s ease",
    transform: (isHovered && !isMobile) ? "scale(1.02)" : "scale(1)"
  };

  const overlayStyle = {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.85) 100%)",
    zIndex: 1
  };

  const contentStyle = {
    position: "absolute",
    inset: 0,
    zIndex: 2,
    padding: isMobile ? 20 : 24,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    color: "white",
    fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const titleStyle = {
    fontSize: isMobile ? 20 : 24,
    fontWeight: 800,
    lineHeight: 1.1,
    marginBottom: isMobile ? 6 : 8,
    textShadow: "0 2px 6px rgba(0,0,0,0.6)",
    fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const oneLinerStyle = {
    fontSize: isMobile ? 12 : 13,
    lineHeight: 1.4,
    opacity: 0.95,
    marginBottom: isMobile ? 10 : 12,
    background: "rgba(0,0,0,0.35)",
    padding: isMobile ? "6px 8px" : "8px 10px",
    borderRadius: isMobile ? 6 : 8,
    fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const detailStyle = { 
    fontSize: isMobile ? 11 : 12, 
    opacity: 0.95, 
    display: "flex", 
    gap: isMobile ? 6 : 8, 
    alignItems: "center",
    fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const utilityButtonsStyle = {
    position: "absolute", 
    top: isMobile ? 12 : 16, 
    right: isMobile ? 12 : 16, 
    display: "flex", 
    gap: isMobile ? 6 : 8, 
    zIndex: 4
  };

  const utilityButtonStyle = {
    width: isMobile ? 32 : 36, 
    height: isMobile ? 32 : 36, 
    borderRadius: "50%", 
    backgroundColor: "rgba(255,255,255,0.08)", 
    color: "white", 
    border: "1px solid rgba(255,255,255,0.12)", 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    cursor: "pointer",
    transition: "all 0.2s ease"
  };

  const buttonContainerStyle = {
    display: "flex",
    gap: isMobile ? 8 : 12,
    opacity: isMobile ? 1 : (isHovered ? 1 : 0),
    transform: isMobile ? "translateY(0)" : (isHovered ? "translateY(0)" : "translateY(8px)"),
    transition: "all .22s ease",
    marginTop: isMobile ? 10 : 8,
    flexDirection: isMobile && window.innerWidth <= 480 ? 'column' : 'row'
  };

  const actionButtonStyle = {
    flex: 1,
    padding: isMobile ? "8px 10px" : "10px 12px",
    borderRadius: isMobile ? 8 : 10,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: isMobile ? 13 : 14,
    transition: "all 0.2s ease",
    fontFamily: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    minHeight: isMobile ? 40 : 'auto'
  };

  return (
    <div
      ref={containerRef}
      style={posterStyle}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
      onClick={() => handleEventClick(latestEvent)}
    >
      <div style={overlayStyle} />

      {/* utility buttons */}
      <div style={utilityButtonsStyle}>
        <button
          style={utilityButtonStyle}
          onClick={(e) => { e.stopPropagation(); handleDownload(e); }}
          title="Download poster"
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "rgba(255,255,255,0.15)";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "rgba(255,255,255,0.08)";
          }}
        >
          <Download size={isMobile ? 14 : 16} />
        </button>
        <button
          style={utilityButtonStyle}
          onClick={(e) => { e.stopPropagation(); handleShare(e); }}
          title="Share"
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "rgba(255,255,255,0.15)";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "rgba(255,255,255,0.08)";
          }}
        >
          <Share2 size={isMobile ? 14 : 16} />
        </button>
      </div>

      {/* content */}
      <div style={contentStyle}>
        <div>
          <div style={titleStyle}>{latestEvent.title}</div>
          <div style={oneLinerStyle}>
            {latestEvent.one_liner?.length > (isMobile ? 100 : 120) 
              ? `${latestEvent.one_liner.substring(0, isMobile ? 100 : 120)}...` 
              : latestEvent.one_liner || "Join us for an amazing event experience"}
          </div>
        </div>

        <div>
          <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 6 : 8 }}>
            <div style={detailStyle}>
              <MapPin size={isMobile ? 12 : 14} />
              {latestEvent.location || "Venue TBA"}
            </div>
            <div style={detailStyle}>
              <Calendar size={isMobile ? 12 : 14} />
              {latestEvent.start_date 
                ? new Date(latestEvent.start_date).toLocaleDateString("en-US", { 
                    month: "short", 
                    day: "numeric", 
                    year: "numeric" 
                  }) 
                : "Date TBA"}
            </div>
            <div style={detailStyle}>
              <DollarSign size={isMobile ? 12 : 14} />
              {latestEvent.is_paid 
                ? `${latestEvent.currency || "$"} ${latestEvent.price}` 
                : "Free Entry"}
            </div>
          </div>

          <div style={buttonContainerStyle} onClick={(e) => e.stopPropagation()}>
            <button
              style={actionButtonStyle}
              onClick={(e) => {
                e.stopPropagation();
                handleEventClick(latestEvent);
              }}
              onMouseEnter={(e) => {
                if (!isMobile) {
                  e.target.style.background = "rgba(255,255,255,0.12)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isMobile) {
                  e.target.style.background = "rgba(255,255,255,0.06)";
                }
              }}
            >
              MORE ABOUT
            </button>

            <button
              style={{ 
                ...actionButtonStyle, 
                background: "linear-gradient(45deg,#667eea,#764ba2)", 
                border: "1px solid rgba(255,255,255,0.18)" 
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (latestEvent.registration_url) {
                  window.open(latestEvent.registration_url, "_blank", "noopener");
                } else {
                  handleEventClick(latestEvent);
                }
              }}
              onMouseEnter={(e) => {
                if (!isMobile) {
                  e.target.style.opacity = "0.9";
                }
              }}
              onMouseLeave={(e) => {
                if (!isMobile) {
                  e.target.style.opacity = "1";
                }
              }}
            >
              APPLY NOW
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Touch improvements for mobile */
        @media (max-width: 768px) {
          button {
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
          }
        }

        /* Extra small mobile */
        @media (max-width: 480px) {
          button {
            min-height: 44px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LatestEvent;