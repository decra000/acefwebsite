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
    <div className="glass-button-container">
      <div
        className={`glass-button ${isHovered ? 'hovered' : ''} ${isPressed ? 'pressed' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      >
        {/* Background glow effect */}
        <div className="glow-effect"></div>
        
        {/* Main content */}
        <div className="button-content">
          {/* Icon container */}
          <div className="icon-container">
            <div className="icon-bg">
              <Globe className="globe-icon" size={24} />
            </div>
            <MapPin className="map-pin" size={20} />
          </div>
          
          {/* Text content */}
          <div className="text-content">
            <h3 className="main-title">Find Us Globally</h3>
            <p className="subtitle">Discover ACEF in your country</p>
          </div>
          
          {/* Arrow indicator */}
          <div className="arrow-container">
            <ArrowRight className="arrow-icon" size={20} />
          </div>
        </div>
        
        {/* Animated border */}
        <div className="animated-border"></div>
      </div>

      <style jsx>{`
        .glass-button-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          padding: 2rem;
          position: relative;
          z-index: 1;
        }

        .glass-button {
          position: relative;
          width: 350px;
          height: 120px;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          cursor: pointer;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          user-select: none;
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .glass-button:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
          box-shadow: 
            0 12px 40px rgba(0, 0, 0, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.15);
        }

        .glass-button.pressed {
          transform: translateY(0px) scale(0.98);
          background: rgba(255, 255, 255, 0.15);
        }

        .glow-effect {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(
            circle,
            rgba(76, 175, 80, 0.1) 0%,
            rgba(76, 175, 80, 0.05) 30%,
            transparent 70%
          );
          opacity: 0;
          transition: opacity 0.4s ease;
          pointer-events: none;
        }

        .glass-button:hover .glow-effect {
          opacity: 1;
        }

        .button-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 2rem;
          height: 100%;
          position: relative;
          z-index: 2;
        }

        .icon-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-bg {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(56, 142, 60, 0.2));
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(76, 175, 80, 0.3);
          position: relative;
        }

        .globe-icon {
          color: rgba(255, 255, 255, 0.9);
          animation: rotate 8s linear infinite;
        }

        .map-pin {
          position: absolute;
          top: -5px;
          right: -5px;
          color: #4CAF50;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          padding: 2px;
          backdrop-filter: blur(10px);
        }

        .text-content {
          flex: 1;
          margin-left: 1.5rem;
          text-align: left;
        }

        .main-title {
          font-size: 1.2rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.95);
          margin: 0 0 0.25rem 0;
          letter-spacing: -0.01em;
        }

        .subtitle {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
          font-weight: 400;
        }

        .arrow-container {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .glass-button:hover .arrow-container {
          background: rgba(76, 175, 80, 0.2);
          transform: translateX(5px);
        }

        .arrow-icon {
          color: rgba(255, 255, 255, 0.8);
          transition: all 0.3s ease;
        }

        .glass-button:hover .arrow-icon {
          color: #4CAF50;
        }

        .animated-border {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 20px;
          padding: 1px;
          background: linear-gradient(
            45deg,
            transparent,
            rgba(76, 175, 80, 0.3),
            transparent,
            rgba(76, 175, 80, 0.3),
            transparent
          );
          background-size: 300% 300%;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .glass-button:hover .animated-border {
          opacity: 1;
          animation: borderMove 3s ease-in-out infinite;
        }

        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes borderMove {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .glass-button {
            width: 300px;
            height: 100px;
          }

          .button-content {
            padding: 1rem 1.5rem;
          }

          .icon-bg {
            width: 40px;
            height: 40px;
          }

          .globe-icon {
            width: 20px;
            height: 20px;
          }

          .map-pin {
            width: 16px;
            height: 16px;
          }

          .main-title {
            font-size: 1.1rem;
          }

          .subtitle {
            font-size: 0.8rem;
          }

          .text-content {
            margin-left: 1rem;
          }
        }

        @media (max-width: 480px) {
          .glass-button {
            width: 280px;
            height: 90px;
          }

          .main-title {
            font-size: 1rem;
          }

          .subtitle {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}