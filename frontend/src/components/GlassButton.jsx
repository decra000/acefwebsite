import React, { useState, useEffect } from "react";

export default function UltraRealisticWaterButton() {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [rippleActive, setRippleActive] = useState(false);
  const [bubbleAnimation, setBubbleAnimation] = useState(false);

  useEffect(() => {
    if (isHovered) {
      const timer = setTimeout(() => setBubbleAnimation(true), 100);
      return () => clearTimeout(timer);
    } else {
      setBubbleAnimation(false);
    }
  }, [isHovered]);

  const baseStyle = {
    padding: "14px 24px",
    borderRadius: "45px",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    width: "100%",
    background: `
      radial-gradient(ellipse 70% 40% at 25% 20%, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.4) 40%, transparent 70%),
      radial-gradient(ellipse 50% 25% at 75% 15%, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.2) 50%, transparent 80%),
      radial-gradient(ellipse 30% 20% at 15% 45%, rgba(255, 255, 255, 0.6) 0%, transparent 60%),
      radial-gradient(ellipse 25% 15% at 60% 80%, rgba(223, 252, 211, 0.4) 0%, transparent 70%),
      linear-gradient(160deg, 
        rgba(240, 255, 240, 0.6) 0%,
        rgba(223, 252, 211, 0.7) 20%,
        rgba(183, 232, 149, 0.8) 45%,
        rgba(132, 217, 100, 0.85) 70%,
        rgba(85, 180, 79, 0.9) 90%,
        rgba(35, 130, 79, 0.95) 100%
      )
    `,
    color: "rgba(255, 255, 255, 0.98)",
    fontSize: "17px",
    fontWeight: "600",
    fontFamily: "'SF Pro Display', system-ui, -apple-system, sans-serif",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
    userSelect: "none",
    outline: "none",
    textAlign: "center",
    letterSpacing: "0.5px",
    textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
    
    // Ultra-realistic water drop shadows with surface tension
    boxShadow: `
      inset 0 3px 6px rgba(255, 255, 255, 0.9),
      inset 0 -3px 8px rgba(35, 130, 79, 0.3),
      inset 3px 3px 12px rgba(255, 255, 255, 0.6),
      inset -3px -3px 12px rgba(85, 180, 79, 0.4),
      inset 0 0 20px rgba(183, 232, 149, 0.2),
      0 2px 4px rgba(35, 130, 79, 0.1),
      0 6px 12px rgba(85, 180, 79, 0.2),
      0 12px 24px rgba(132, 217, 100, 0.15),
      0 20px 40px rgba(183, 232, 149, 0.1),
      0 1px 0 rgba(255, 255, 255, 0.4)
    `,
    
    transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
    transform: isPressed 
      ? "translateY(3px) scale(0.96) perspective(100px) rotateX(2deg)" 
      : isHovered 
        ? "translateY(-2px) scale(1.02) perspective(100px) rotateX(-1deg)" 
        : "translateY(0) scale(1) perspective(100px) rotateX(0deg)",
  };

  const hoverStyle = {
    background: `
      radial-gradient(ellipse 75% 45% at 27% 18%, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.5) 35%, transparent 65%),
      radial-gradient(ellipse 55% 30% at 73% 12%, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.3) 45%, transparent 75%),
      radial-gradient(ellipse 35% 25% at 12% 40%, rgba(255, 255, 255, 0.7) 0%, transparent 55%),
      radial-gradient(ellipse 30% 20% at 65% 85%, rgba(223, 252, 211, 0.5) 0%, transparent 65%),
      radial-gradient(circle at 45% 30%, rgba(183, 232, 149, 0.3) 0%, transparent 40%),
      linear-gradient(160deg, 
        rgba(245, 255, 245, 0.7) 0%,
        rgba(233, 252, 221, 0.8) 18%,
        rgba(193, 242, 159, 0.85) 40%,
        rgba(142, 227, 110, 0.9) 65%,
        rgba(95, 190, 89, 0.93) 85%,
        rgba(45, 140, 89, 0.98) 100%
      )
    `,
    border: "2px solid rgba(255, 255, 255, 0.5)",
    boxShadow: `
      inset 0 4px 8px rgba(255, 255, 255, 0.95),
      inset 0 -4px 10px rgba(35, 130, 79, 0.35),
      inset 4px 4px 15px rgba(255, 255, 255, 0.7),
      inset -4px -4px 15px rgba(85, 180, 79, 0.45),
      inset 0 0 25px rgba(183, 232, 149, 0.25),
      0 3px 6px rgba(35, 130, 79, 0.15),
      0 8px 16px rgba(85, 180, 79, 0.25),
      0 16px 32px rgba(132, 217, 100, 0.2),
      0 24px 48px rgba(183, 232, 149, 0.15),
      0 2px 0 rgba(255, 255, 255, 0.5)
    `,
  };

  const pressedStyle = {
    background: `
      radial-gradient(ellipse 65% 35% at 30% 25%, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.3) 45%, transparent 75%),
      radial-gradient(ellipse 45% 20% at 70% 20%, rgba(255, 255, 255, 0.65) 0%, rgba(255, 255, 255, 0.1) 55%, transparent 85%),
      radial-gradient(ellipse 25% 15% at 20% 50%, rgba(255, 255, 255, 0.45) 0%, transparent 70%),
      radial-gradient(ellipse 20% 12% at 60% 75%, rgba(223, 252, 211, 0.3) 0%, transparent 80%),
      linear-gradient(160deg, 
        rgba(235, 250, 235, 0.5) 0%,
        rgba(213, 247, 201, 0.6) 25%,
        rgba(173, 222, 139, 0.75) 50%,
        rgba(122, 197, 90, 0.8) 75%,
        rgba(75, 160, 69, 0.85) 100%
      )
    `,
    border: "2px solid rgba(255, 255, 255, 0.2)",
    boxShadow: `
      inset 0 4px 8px rgba(35, 130, 79, 0.4),
      inset 0 -2px 6px rgba(255, 255, 255, 0.7),
      inset 4px 4px 10px rgba(85, 180, 79, 0.35),
      inset -4px -4px 10px rgba(255, 255, 255, 0.5),
      inset 0 0 15px rgba(132, 217, 100, 0.2),
      0 1px 2px rgba(35, 130, 79, 0.2),
      0 3px 6px rgba(85, 180, 79, 0.15),
      0 6px 12px rgba(132, 217, 100, 0.1)
    `,
  };

  const currentStyle = {
    ...baseStyle,
    ...(isPressed ? pressedStyle : isHovered ? hoverStyle : {})
  };

  const handleClick = () => {
    setRippleActive(true);
    setTimeout(() => setRippleActive(false), 600);
    setTimeout(() => {
      window.location.href = '/findbycountry';
    }, 200);
  };

  return (
    <div style={{ 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      height: "300px",
      padding: "20px",
    }}>
      <div style={{ width: "320px", maxWidth: "90%" }}>
        <button
          style={currentStyle}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            setIsPressed(false);
          }}
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          onClick={handleClick}
        >
          {/* Primary curved water surface highlight */}
          <span style={{
            position: "absolute",
            top: "5px",
            left: "18px",
            width: isHovered ? "75px" : "65px",
            height: isHovered ? "12px" : "10px",
            background: "radial-gradient(ellipse 100% 60%, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.7) 40%, rgba(255, 255, 255, 0.2) 80%, transparent 100%)",
            borderRadius: "50%",
            pointerEvents: "none",
            transform: `rotate(-8deg) ${isHovered ? 'scale(1.1)' : 'scale(1)'}`,
            transition: "all 0.2s ease",
            filter: "blur(0.5px)"
          }} />
          
          {/* Secondary moving highlight */}
          <span style={{
            position: "absolute",
            top: isHovered ? "7px" : "8px",
            right: isHovered ? "25px" : "28px",
            width: isHovered ? "32px" : "28px",
            height: isHovered ? "6px" : "5px",
            background: "radial-gradient(ellipse 100% 70%, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.3) 60%, transparent 100%)",
            borderRadius: "50%",
            pointerEvents: "none",
            transform: `rotate(5deg)`,
            transition: "all 0.15s ease",
            opacity: isHovered ? 0.9 : 0.7
          }} />
          
          {/* Animated floating bubble */}
          <span style={{
            position: "absolute",
            top: bubbleAnimation ? "6px" : "9px",
            left: bubbleAnimation ? "48px" : "45px",
            width: "4px",
            height: "4px",
            background: "radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.4) 50%, rgba(183, 232, 149, 0.2) 80%, transparent 100%)",
            borderRadius: "50%",
            pointerEvents: "none",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            opacity: bubbleAnimation ? 1 : 0.6,
            transform: `scale(${bubbleAnimation ? 1.2 : 1})`,
            filter: "blur(0.2px)"
          }} />
          
          {/* Additional micro bubbles */}
          <span style={{
            position: "absolute",
            top: "11px",
            left: "35px",
            width: "2px",
            height: "2px",
            background: "radial-gradient(circle, rgba(255, 255, 255, 0.7) 0%, transparent 100%)",
            borderRadius: "50%",
            pointerEvents: "none",
            opacity: isHovered ? 0.8 : 0.4,
            transition: "opacity 0.2s ease"
          }} />
          
          <span style={{
            position: "absolute",
            top: "13px",
            right: "45px",
            width: "1.5px",
            height: "1.5px",
            background: "radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, transparent 100%)",
            borderRadius: "50%",
            pointerEvents: "none",
            opacity: isHovered ? 0.7 : 0.3,
            transition: "opacity 0.2s ease"
          }} />
          
          Find us by country
          
          {/* Enhanced bottom water meniscus */}
          <span style={{
            position: "absolute",
            bottom: "4px",
            left: "22px",
            right: "22px",
            height: "1.5px",
            background: `
              radial-gradient(ellipse 40% 100% at 30% 50%, rgba(183, 232, 149, 0.7) 0%, transparent 100%),
              linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 15%, rgba(183, 232, 149, 0.6) 40%, rgba(255, 255, 255, 0.5) 60%, rgba(183, 232, 149, 0.6) 85%, transparent 100%)
            `,
            borderRadius: "0.75px",
            pointerEvents: "none",
            opacity: isHovered ? 0.8 : 0.6,
            transition: "opacity 0.2s ease"
          }} />
          
          {/* Water surface tension edge */}
          <span style={{
            position: "absolute",
            bottom: "2px",
            left: "20px",
            right: "20px",
            height: "0.5px",
            background: "linear-gradient(90deg, transparent 0%, rgba(35, 130, 79, 0.3) 20%, rgba(85, 180, 79, 0.5) 50%, rgba(35, 130, 79, 0.3) 80%, transparent 100%)",
            borderRadius: "0.25px",
            pointerEvents: "none"
          }} />
          
          {/* Click ripple effect */}
          {rippleActive && (
            <span style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "200px",
              height: "200px",
              background: "radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, rgba(183, 232, 149, 0.2) 30%, transparent 70%)",
              borderRadius: "50%",
              transform: "translate(-50%, -50%) scale(0)",
              animation: "ripple 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards",
              pointerEvents: "none"
            }} />
          )}
          
          <style jsx>{`
            @keyframes ripple {
              to {
                transform: translate(-50%, -50%) scale(1);
                opacity: 0;
              }
            }
          `}</style>
        </button>
      </div>
    </div>
  );
}