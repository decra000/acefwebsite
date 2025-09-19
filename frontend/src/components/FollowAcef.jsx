import React from "react";
import { useTheme } from "../theme";

const FollowACEF = () => {
  const { colors, isDarkMode } = useTheme();

  return (
    <section
      style={{
        width: "100%",
        padding: "60px 20px",
        backgroundColor: colors.background,
        textAlign: "center",
      }}
    >
      <h2
        style={{
          fontFamily: '"Georgia", "Times New Roman", serif',
          fontSize: "28px",
          fontWeight: "500",
          marginBottom: "40px",
          color: colors.primary,
        }}
      >
        Follow ACEF
      </h2>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "40px",
          flexWrap: "wrap",
        }}
      >
        {/* Facebook */}
        <a
          href="https://www.facebook.com/share/172ZDMd2dL/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ 
            color: "#1877F2", 
            fontSize: "32px", 
            textDecoration: "none",
            minWidth: "32px",
            minHeight: "32px",
            display: "inline-block"
          }}
        >
          <i className="fab fa-facebook"></i>
        </a>

        {/* LinkedIn */}
        <a
          href="https://www.linkedin.com/company/acef-africa-climate-and-environment-foundation/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ 
            color: "#0A66C2", 
            fontSize: "32px", 
            textDecoration: "none",
            minWidth: "32px",
            minHeight: "32px",
            display: "inline-block"
          }}
        >
          <i className="fab fa-linkedin"></i>
        </a>

        {/* Instagram */}
        <a
          href="https://www.instagram.com/acefngo?igsh=MXE3YXRmd2hvZ2xodg=="
          target="_blank"
          rel="noopener noreferrer"
          style={{ 
            color: "#E1306C", 
            fontSize: "32px", 
            textDecoration: "none",
            minWidth: "32px",
            minHeight: "32px",
            display: "inline-block"
          }}
        >
          <i className="fab fa-instagram"></i>
        </a>

        {/* YouTube */}
        <a
          href="https://youtube.com/@acef-africaclimateandenvir6363?si=YfaOJ9L1IpKG0H8X"
          target="_blank"
          rel="noopener noreferrer"
          style={{ 
            color: "#FF0000", 
            fontSize: "32px", 
            textDecoration: "none",
            minWidth: "32px",
            minHeight: "32px",
            display: "inline-block"
          }}
        >
          <i className="fab fa-youtube"></i>
        </a>

        {/* X (Twitter) */}
        <a
          href="https://x.com/ACEFngo?t=H00D4LR0XgHHRHS73lQ76A&s=09"
          target="_blank"
          rel="noopener noreferrer"
          style={{ 
            color: isDarkMode ? "#ffffff" : "#000000", 
            fontSize: "32px", 
            textDecoration: "none",
            minWidth: "32px",
            minHeight: "32px",
            display: "inline-block"
          }}
        >
          <i className="fab fa-x-twitter"></i>
        </a>

        {/* TikTok */}
        <a
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          style={{ 
            color: isDarkMode ? "#ffffff" : "#000000", 
            fontSize: "32px", 
            textDecoration: "none",
            minWidth: "32px",
            minHeight: "32px",
            display: "inline-block"
          }}
        >
          <i className="fab fa-tiktok"></i>
        </a>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          section {
            padding: 40px 16px !important;
          }
          
          h2 {
            font-size: 24px !important;
            margin-bottom: 32px !important;
          }
          
          div {
            gap: 30px !important;
          }
          
          a {
            font-size: 28px !important;
          }
        }
        
        @media (max-width: 480px) {
          section {
            padding: 32px 16px !important;
          }
          
          h2 {
            font-size: 22px !important;
            margin-bottom: 24px !important;
          }
          
          div {
            gap: 24px !important;
            max-width: 280px;
            margin: 0 auto;
          }
          
          a {
            font-size: 24px !important;
          }
        }
      `}</style>
    </section>
  );
};

export default FollowACEF;