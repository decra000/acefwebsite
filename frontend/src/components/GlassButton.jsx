import React, { useState } from "react";
import { MapPin, Globe, ArrowRight } from "lucide-react";

export default function GlassButton() {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = () => {
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);
    setTimeout(() => {
      window.location.href = "/findbycountry";
    }, 200);
  };

  return (
    <div className="premium-button-container">
      <div
        className={`premium-button ${isHovered ? 'hovered' : ''} ${isPressed ? 'pressed' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      >
        {/* Ambient glow effects */}
        <div className="ambient-glow"></div>
        <div className="hover-glow"></div>
        
        {/* Water droplet effect */}
        <div className="droplet-container">
          <div className="growing-circle"></div>
          <div className="water-droplet"></div>
        </div>
        
        {/* Content wrapper */}
        <div className="content-wrapper">
          {/* Globe icon with enhanced styling */}
          <div className="icon-section">
            <div className="globe-container">
              <Globe className="globe-icon" size={28} />
              <div className="orbit-ring"></div>
            </div>
            <div className="location-indicator">
              <MapPin size={14} />
            </div>
          </div>
          
          {/* Enhanced typography */}
          <div className="text-section">
            <div className="primary-text">
              <span className="text-line">Find Us</span>
              <span className="text-line highlight">Globally</span>
            </div>
            <div className="secondary-text">
              <span>Discover ACEF presence</span>
              <span>in your country</span>
            </div>
          </div>
          
          {/* Call-to-action indicator */}
          <div className="cta-section">
            <div className="action-button">
              <ArrowRight size={16} />
              <div className="ripple-effect"></div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .premium-button-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          padding: 2rem;
          position: relative;
        }

        .premium-button {
          position: relative;
          width: 280px;
          height: 320px;
          background: transparent;
          cursor: pointer;
          overflow: visible;
          transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          user-select: none;
        }

        .premium-button:hover {
          transform: translateY(-8px) scale(1.02);
        }

        .premium-button.pressed {
          transform: translateY(-4px) scale(1.01);
          transition: all 0.15s ease;
        }

        .ambient-glow {
          position: absolute;
          top: -40%;
          left: -40%;
          width: 180%;
          height: 180%;
          background: radial-gradient(
            ellipse,
            rgba(76, 175, 80, 0.08) 0%,
            rgba(76, 175, 80, 0.04) 40%,
            transparent 70%
          );
          opacity: 0.6;
          pointer-events: none;
        }

        .hover-glow {
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          width: 160px;
          height: 160px;
          background: linear-gradient(
            45deg,
            rgba(76, 175, 80, 0.1),
            rgba(56, 142, 60, 0.08),
            rgba(76, 175, 80, 0.1)
          );
          border-radius: 50%;
          opacity: 1;
          transition: opacity 0.5s ease;
          pointer-events: none;
          filter: blur(12px);
        }

        .droplet-container {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 200vh;
          pointer-events: none;
          overflow: visible;
        }

        .growing-circle {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 0;
          height: 0;
          background: radial-gradient(
            circle,
            rgba(76, 175, 80, 0.3) 0%,
            rgba(76, 175, 80, 0.1) 40%,
            transparent 70%
          );
          border-radius: 50%;
          opacity: 0;
          animation: growAndShrink 3s ease-in-out infinite;
        }

        .water-droplet {
          position: absolute;
          top: 45%;
          left: 50%;
          transform: translateX(-50%);
          width: 10px;
          height: 15px;
          background: linear-gradient(
            145deg,
            rgba(173, 216, 230, 0.95) 0%,
            rgba(135, 206, 235, 0.9) 30%,
            rgba(76, 175, 80, 0.85) 70%,
            rgba(56, 142, 60, 0.9) 100%
          );
          border-radius: 60% 40% 60% 40%;
          opacity: 0;
          transform-origin: center;
          box-shadow: 
            0 2px 12px rgba(76, 175, 80, 0.3),
            0 4px 24px rgba(173, 216, 230, 0.2),
            inset 0 1px 4px rgba(255, 255, 255, 0.6),
            inset 0 -1px 2px rgba(76, 175, 80, 0.3);
          filter: drop-shadow(0 1px 3px rgba(76, 175, 80, 0.4));
          animation: dropletFall 4s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite 2.2s;
        }

        .content-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          height: 100%;
          padding: 32px 24px;
          position: relative;
          z-index: 2;
        }

        .icon-section {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .globe-container {
          position: relative;
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .globe-background {
          display: none;
        }

        .globe-icon {
          color: #4CAF50;
          animation: rotate 8s linear infinite;
          filter: drop-shadow(0 2px 4px rgba(76, 175, 80, 0.3));
          transition: all 0.4s ease;
          z-index: 1;
        }

        .orbit-ring {
          position: absolute;
          width: 100px;
          height: 100px;
          border: 1px solid rgba(76, 175, 80, 0.2);
          border-radius: 50%;
          animation: orbit 20s linear infinite reverse;
          opacity: 1;
          transition: opacity 0.4s ease;
        }

        .location-indicator {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 28px;
          height: 28px;
          background: linear-gradient(135deg, #4CAF50, #45a049);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
          animation: pulse 2s ease-in-out infinite;
        }

        .text-section {
          text-align: center;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 16px;
        }

        .primary-text {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .text-line {
          font-size: 1.25rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.95);
          letter-spacing: -0.02em;
          line-height: 1.2;
          transition: all 0.3s ease;
        }

        .text-line.highlight {
          background: linear-gradient(135deg, #4CAF50, #66BB6A);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 700;
        }

        .secondary-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .secondary-text span {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.85);
          font-weight: 400;
          line-height: 1.3;
          transition: color 0.3s ease;
        }

        .cta-section {
          position: relative;
        }

        .action-button {
          position: relative;
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, rgba(76, 175, 80, 0.3), rgba(56, 142, 60, 0.4));
          border: 1px solid rgba(76, 175, 80, 0.6);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4CAF50;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          transform: translateY(-2px) scale(1.1);
          box-shadow: 0 8px 24px rgba(76, 175, 80, 0.3);
        }

        .ripple-effect {
          position: absolute;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(76, 175, 80, 0.3) 0%, transparent 70%);
          border-radius: 50%;
          opacity: 1;
          transform: scale(1);
          transition: all 0.6s ease;
          animation: ripple 1.5s ease-out infinite;
        }

        .border-gradient {
          display: none;
        }

        .corner-accents {
          display: none;
        }

        .corner {
          display: none;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
          }
          50% {
            transform: scale(1.1);
            box-shadow: 0 6px 20px rgba(76, 175, 80, 0.6);
          }
        }

        @keyframes ripple {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes growAndShrink {
          0% {
            width: 0;
            height: 0;
            opacity: 0;
          }
          15% {
            width: 60px;
            height: 60px;
            opacity: 0.6;
          }
          35% {
            width: 120px;
            height: 120px;
            opacity: 0.8;
          }
          55% {
            width: 180px;
            height: 180px;
            opacity: 0.4;
          }
          70% {
            width: 40px;
            height: 40px;
            opacity: 0.9;
          }
          85% {
            width: 12px;
            height: 12px;
            opacity: 1;
          }
          100% {
            width: 0;
            height: 0;
            opacity: 0;
          }
        }

        @keyframes dropletFall {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(0px) scale(0.3) rotate(0deg);
          }
          3% {
            opacity: 0.9;
            transform: translateX(-50%) translateY(0px) scale(1) rotate(2deg);
          }
          8% {
            opacity: 1;
            transform: translateX(-50%) translateY(20px) scale(1.1) rotate(-1deg);
          }
          15% {
            opacity: 1;
            transform: translateX(-50%) translateY(80px) scale(1.05) rotate(1deg);
          }
          25% {
            opacity: 0.95;
            transform: translateX(-50%) translateY(180px) scale(1) rotate(-0.5deg);
          }
          35% {
            opacity: 0.9;
            transform: translateX(-50%) translateY(320px) scale(0.95) rotate(0.5deg);
          }
          50% {
            opacity: 0.8;
            transform: translateX(-50%) translateY(550px) scale(0.85) rotate(-0.3deg);
          }
          65% {
            opacity: 0.6;
            transform: translateX(-50%) translateY(850px) scale(0.75) rotate(0.2deg);
          }
          78% {
            opacity: 0.4;
            transform: translateX(-50%) translateY(1200px) scale(0.6) rotate(-0.1deg);
          }
          88% {
            opacity: 0.2;
            transform: translateX(-50%) translateY(1600px) scale(0.4) rotate(0deg);
          }
          96% {
            opacity: 0.05;
            transform: translateX(-50%) translateY(2000px) scale(0.2) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: translateX(-50%) translateY(2400px) scale(0.1) rotate(0deg);
          }
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .premium-button {
            width: 240px;
            height: 280px;
          }

          .content-wrapper {
            padding: 24px 20px;
          }

          .globe-container {
            width: 64px;
            height: 64px;
          }

          .globe-icon {
            width: 24px;
            height: 24px;
          }

          .text-line {
            font-size: 1.1rem;
          }

          .secondary-text span {
            font-size: 0.85rem;
          }

          .action-button {
            width: 40px;
            height: 40px;
          }
        }

        @media (max-width: 480px) {
          .premium-button {
            width: 200px;
            height: 240px;
          }

          .content-wrapper {
            padding: 20px 16px;
          }

          .globe-container {
            width: 56px;
            height: 56px;
          }

          .text-line {
            font-size: 1rem;
          }

          .secondary-text span {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
}