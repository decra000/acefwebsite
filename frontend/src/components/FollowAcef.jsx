import React from "react";
import { useTheme } from "../theme";
import { Facebook, Linkedin, Instagram, Youtube, Twitter } from "lucide-react";

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
          fontFamily: 'inherit',
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
            textDecoration: "none",
            display: "inline-block"
          }}
        >
          <Facebook size={32} />
        </a>

        {/* LinkedIn */}
        <a
          href="https://www.linkedin.com/company/acef-africa-climate-and-environment-foundation/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ 
            color: "#0A66C2", 
            textDecoration: "none",
            display: "inline-block"
          }}
        >
          <Linkedin size={32} />
        </a>

        {/* Instagram */}
        <a
          href="https://www.instagram.com/acefngo?igsh=MXE3YXRmd2hvZ2xodg=="
          target="_blank"
          rel="noopener noreferrer"
          style={{ 
            color: "#E1306C", 
            textDecoration: "none",
            display: "inline-block"
          }}
        >
          <Instagram size={32} />
        </a>

        {/* YouTube */}
        <a
          href="https://youtube.com/@acef-africaclimateandenvir6363?si=YfaOJ9L1IpKG0H8X"
          target="_blank"
          rel="noopener noreferrer"
          style={{ 
            color: "#FF0000", 
            textDecoration: "none",
            display: "inline-block"
          }}
        >
          <Youtube size={32} />
        </a>

        {/* X (Twitter) */}
        <a
          href="https://x.com/ACEFngo?t=H00D4LR0XgHHRHS73lQ76A&s=09"
          target="_blank"
          rel="noopener noreferrer"
          style={{ 
            color: isDarkMode ? "#ffffff" : "#000000", 
            textDecoration: "none",
            display: "inline-block"
          }}
        >
          <Twitter size={32} />
        </a>

        {/* TikTok - Using Music icon as alternative */}
        <a
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          style={{ 
            color: isDarkMode ? "#ffffff" : "#000000", 
            textDecoration: "none",
            display: "inline-block"
          }}
        >
          <svg 
            width="32" 
            height="32" 
            viewBox="0 0 24 24" 
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
          </svg>
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
          
          a svg {
            width: 28px !important;
            height: 28px !important;
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
          
          a svg {
            width: 24px !important;
            height: 24px !important;
          }
        }
      `}</style>
    </section>
  );
};

export default FollowACEF;