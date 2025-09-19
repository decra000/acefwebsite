// src/components/LatestEvent.jsx (replace your existing file)
import React, { useState, useEffect, useRef } from "react";
import { Download, Share2, Calendar, MapPin, DollarSign } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import QRCode from "qrcode";
import { API_URL, STATIC_URL } from "../../config";
import { useLogo } from "../../context/LogoContext"; // adjust path if needed

const LatestEvent = () => {
  const [latestEvent, setLatestEvent] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const { currentLogo } = useLogo();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const resolveUrl = (path) => {
    if (!path) return null;
    return path.startsWith("http") ? path : `${STATIC_URL}${path}`;
  };

  useEffect(() => {
    const fetchLatestEvent = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/events`);
        if (Array.isArray(data) && data.length > 0) {
          const sorted = data.sort(
            (a, b) => new Date(a.start_date) - new Date(b.start_date)
          );
          setLatestEvent(sorted[0]);
        } else if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
          const sorted = data.data.sort(
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

  const handleEventClick = (event) => {
    // navigate to event detail modal/page using the same pattern as your main events page
    navigate(`/events?eventId=${event.id}`);
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    if (!latestEvent) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 400;
    canvas.height = 600;

    // Background image (event image) - fallback to gradient if missing
    const bgUrl = resolveUrl(latestEvent.image_url);
    const bgImg = new Image();
    if (bgUrl) {
      bgImg.crossOrigin = "anonymous";
      bgImg.src = bgUrl;
    }

    const drawPoster = async () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background (if we have image draw it with aspect ratio, else gradient)
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
        // gradient fallback
        const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        g.addColorStop(0, "#667eea");
        g.addColorStop(0.5, "#764ba2");
        g.addColorStop(1, "#f093fb");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // overlay gradient bottom for text readability
      const overlay = ctx.createLinearGradient(0, canvas.height - 220, 0, canvas.height);
      overlay.addColorStop(0, "rgba(0,0,0,0)");
      overlay.addColorStop(1, "rgba(0,0,0,0.9)");
      ctx.fillStyle = overlay;
      ctx.fillRect(0, canvas.height - 220, canvas.width, 220);

      // draw logo centered at top if available (preserve aspect ratio)
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
              // compute max dims (so logo doesn't look huge or stretched)
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

      // Title - multiline wrap near bottom
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

      // one-liner
      ctx.font = "16px sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      const oneLiner = latestEvent.one_liner || "Join us for an amazing experience";
      const oneLines = wrapTextLines(ctx, oneLiner, maxTextWidth, 3);
      for (const line of oneLines) {
        ctx.fillText(line, pad, textY);
        textY += 20;
      }

      // date & location (bottom-left)
      ctx.font = "14px sans-serif";
      ctx.fillStyle = "white";
      const dateStr = latestEvent.start_date
        ? new Date(latestEvent.start_date).toLocaleDateString()
        : "Date TBA";
      ctx.fillText(dateStr, pad, canvas.height - 50);
      ctx.fillText(latestEvent.location || "Venue TBA", pad, canvas.height - 30);

      // price (bottom left, next to date or under)
      const priceText = latestEvent.is_paid
        ? `${latestEvent.currency || "$"} ${latestEvent.price}`
        : "Free";
      ctx.fillText(priceText, pad + 150, canvas.height - 50);

      // QR code bottom-right
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

      // trigger download
      const link = document.createElement("a");
      link.download = `${(latestEvent.title || "event").replace(/\s+/g, "-")}-poster.png`;
      canvas.toBlob((blob) => {
        link.href = URL.createObjectURL(blob);
        link.click();
      }, "image/png");
    };

    // helper: wrap text into N lines (returns array of lines)
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
      // if we have more than maxLines, truncate last line with ellipsis
      if (lines.length > maxLines) lines.length = maxLines;
      if (lines.length === maxLines) {
        const last = lines[lines.length - 1];
        // ensure last ends with ellipsis if too wide
        while (ctxLocal.measureText(last + "…").width > maxWidth) {
          lines[lines.length - 1] = lines[lines.length - 1].slice(0, -1);
        }
        lines[lines.length - 1] = lines[lines.length - 1] + "…";
      }
      return lines;
    }

    // If we have a background image, wait for it to load (or timeout)
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
      // fallback — copy link
      navigator.clipboard?.writeText(`${window.location.origin}/events?eventId=${latestEvent.id}`)
        .then(() => alert("Event link copied to clipboard"))
        .catch(() => alert("Copy failed — please copy link manually"));
    }
  };

  if (!latestEvent) return null;

  // on-screen small helpers
  const logoRenderSrc = resolveUrl(
    currentLogo?.logo_url || currentLogo?.file_url || currentLogo?.url || currentLogo?.path
  );

  // on-screen poster styles (kept inline so easy to paste)
  const posterStyle = {
    position: "relative",
    width: 400,
    height: 600,
    margin: "0 auto",
    borderRadius: 16,
    overflow: "hidden",
    cursor: "pointer",
    background: latestEvent.image_url ? `linear-gradient(135deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.55) 100%), url(${resolveUrl(latestEvent.image_url)})` : "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
    backgroundSize: "cover",
    backgroundPosition: "center",
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
    transition: "transform .25s ease",
    transform: isHovered ? "scale(1.02)" : "scale(1)"
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
    padding: 24,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    color: "white"
  };

  const titleStyle = {
    fontSize: 24,
    fontWeight: 800,
    lineHeight: 1.1,
    marginBottom: 8,
    textShadow: "0 2px 6px rgba(0,0,0,0.6)"
  };

  const oneLinerStyle = {
    fontSize: 13,
    lineHeight: 1.4,
    opacity: 0.95,
    marginBottom: 12,
    background: "rgba(0,0,0,0.35)",
    padding: "8px 10px",
    borderRadius: 8
  };

  const detailStyle = { fontSize: 12, opacity: 0.95, display: "flex", gap: 8, alignItems: "center" };

  const utilityButtonsStyle = {
    position: "absolute", top: 16, right: 16, display: "flex", gap: 8, zIndex: 4
  };

  const utilityButtonStyle = {
    width: 36, height: 36, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.08)", color: "white", border: "1px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
  };

  const buttonContainerStyle = {
    display: "flex",
    gap: 12,
    opacity: isHovered ? 1 : 0,
    transform: isHovered ? "translateY(0)" : "translateY(8px)",
    transition: "all .22s ease",
    marginTop: 8
  };

  const actionButtonStyle = {
    flex: 1,
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "white",
    fontWeight: 700,
    cursor: "pointer"
  };

  return (
    <div
      ref={containerRef}
      style={posterStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => handleEventClick(latestEvent)}
    >
   
      <div style={overlayStyle} />

      {/* utility buttons (download/share) */}
      <div style={utilityButtonsStyle}>
        <button
          style={utilityButtonStyle}
          onClick={(e) => { e.stopPropagation(); handleDownload(e); }}
          title="Download poster"
        >
          <Download size={16} />
        </button>
        <button
          style={utilityButtonStyle}
          onClick={(e) => { e.stopPropagation(); handleShare(e); }}
          title="Share"
        >
          <Share2 size={16} />
        </button>
      </div>

      {/* content */}
      <div style={contentStyle}>
        <div>
          <div style={titleStyle}>{latestEvent.title}</div>
          <div style={oneLinerStyle}>
            {latestEvent.one_liner?.length > 120 ? `${latestEvent.one_liner.substring(0, 120)}...` : latestEvent.one_liner || "Join us for an amazing event experience"}
          </div>
        </div>

        <div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={detailStyle}><MapPin size={14} />{latestEvent.location || "Venue TBA"}</div>
            <div style={detailStyle}><Calendar size={14} />{latestEvent.start_date ? new Date(latestEvent.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Date TBA"}</div>
            <div style={detailStyle}><DollarSign size={14} />{latestEvent.is_paid ? `${latestEvent.currency || "$"} ${latestEvent.price}` : "Free Entry"}</div>
          </div>

          <div style={buttonContainerStyle} onClick={(e) => e.stopPropagation()}>
            <button
              style={actionButtonStyle}
              onClick={(e) => {
                e.stopPropagation();
                // more about -> same event detail modal / page
                handleEventClick(latestEvent);
              }}
            >
              MORE ABOUT
            </button>

            <button
              style={{ ...actionButtonStyle, background: "linear-gradient(45deg,#667eea,#764ba2)", border: "1px solid rgba(255,255,255,0.18)" }}
              onClick={(e) => {
                e.stopPropagation();
                // open registration url if available, else go to event detail
                if (latestEvent.registration_url) {
                  window.open(latestEvent.registration_url, "_blank", "noopener");
                } else {
                  handleEventClick(latestEvent);
                }
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
