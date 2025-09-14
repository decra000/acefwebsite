import React, { useState, useRef } from 'react';
import { Download, Upload, Users, User, FileText, X, Palette, Award, CreditCard, FileCheck, Plus, Minus, Edit, Star, Globe, Leaf } from 'lucide-react';

// Premium Business Card Template with glassmorphism
const PremiumBusinessCardTemplate = ({ 
  recipientName = "John Doe", 
  size = "standard",
  id = "item-1",
  customData = {}
}) => {
  const sizeConfig = {
    compact: { width: 320, height: 180, fontSize: { name: '1rem', title: '0.7rem' } },
    standard: { width: 400, height: 225, fontSize: { name: '1.3rem', title: '0.8rem' } },
    premium: { width: 480, height: 270, fontSize: { name: '1.6rem', title: '0.9rem' } }
  };

  const config = sizeConfig[size];
  const position = customData.position || 'Team Member';
  const email = customData.email || 'contact@acef.org';
  const phone = customData.phone || '+254 700 000 000';
  const department = customData.department || 'Operations';

  return (
    <div id={id} style={{
      width: config.width,
      height: config.height,
      background: 'linear-gradient(135deg, rgba(10, 69, 28, 0.95) 0%, rgba(22, 163, 74, 0.9) 50%, rgba(156, 207, 159, 0.85) 100%)',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      padding: '24px',
      color: 'white',
      fontFamily: '"Inter", sans-serif',
      boxShadow: '0 25px 50px rgba(10, 69, 28, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
      position: 'relative',
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.1)'
    }}>
      {/* Glassmorphism overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.1) 100%)',
        zIndex: 1
      }}></div>

      {/* Logo */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        width: '50px',
        height: '50px',
        background: 'rgba(255,255,255,0.15)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        zIndex: 3,
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <Globe />
      </div>

      {/* ACEF Text */}
      <div style={{
        position: 'absolute',
        top: '24px',
        right: '24px',
        fontSize: '1.2rem',
        fontWeight: '700',
        zIndex: 3,
        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
        letterSpacing: '1px'
      }}>
        ACEF
      </div>

      {/* Content */}
      <div style={{ 
        position: 'relative', 
        zIndex: 2, 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        paddingTop: '40px'
      }}>
        <div style={{ 
          fontSize: config.fontSize.name, 
          fontWeight: '800', 
          marginBottom: '8px',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          {recipientName}
        </div>
        
        <div style={{ 
          fontSize: config.fontSize.title, 
          opacity: 0.9,
          marginBottom: '16px',
          fontWeight: '500'
        }}>
          {position}
        </div>

        <div style={{ 
          fontSize: '0.7rem', 
          opacity: 0.8,
          lineHeight: '1.4',
          fontWeight: '400'
        }}>
          {department} • {email}<br />
          {phone}
        </div>

        {/* Bottom accent */}
        <div style={{
          position: 'absolute',
          bottom: '16px',
          left: '24px',
          right: '24px',
          height: '2px',
          background: 'linear-gradient(90deg, rgba(255,255,255,0.6), rgba(255,255,255,0.1))',
          borderRadius: '1px'
        }}></div>
      </div>
    </div>
  );
};

// Premium Certificate Template - Design 1: Elegant
const PremiumCertificateElegant = ({ 
  recipientName = "Certificate Recipient", 
  size = "standard",
  id = "item-1",
  customData = {}
}) => {
  const sizeConfig = {
    compact: { width: 420, height: 300, fontSize: { name: '1.3rem', title: '0.85rem' } },
    standard: { width: 560, height: 400, fontSize: { name: '1.7rem', title: '1rem' } },
    premium: { width: 700, height: 500, fontSize: { name: '2rem', title: '1.2rem' } }
  };

  const config = sizeConfig[size];
  const program = customData.program || 'Climate Leadership Program';
  const date = customData.date || new Date().toLocaleDateString();
  const instructor = customData.instructor || 'Director';
  
  return (
    <div id={id} style={{
      width: config.width,
      height: config.height,
      background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      padding: '40px',
      fontFamily: '"Inter", sans-serif',
      boxShadow: '0 30px 60px rgba(10, 69, 28, 0.15), inset 0 1px 0 rgba(255,255,255,0.5)',
      color: '#0a451c',
      position: 'relative',
      overflow: 'hidden',
      border: '2px solid rgba(10, 69, 28, 0.1)'
    }}>
      {/* Decorative elements */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: 'radial-gradient(circle, rgba(10, 69, 28, 0.03) 0%, transparent 70%)',
        zIndex: 0
      }} />

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        zIndex: 2,
        position: 'relative'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          background: 'linear-gradient(135deg, #0a451c, #16a34a)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '24px',
          boxShadow: '0 8px 20px rgba(10, 69, 28, 0.3)'
        }}>
          <Globe />
        </div>
        
        <div style={{
          textAlign: 'right',
          fontSize: '0.9rem',
          fontWeight: '600',
          color: '#16a34a'
        }}>
          ACEF
        </div>
      </div>

      {/* Certificate title */}
      <div style={{
        textAlign: 'center',
        marginBottom: '40px',
        zIndex: 2,
        position: 'relative'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #0a451c, #16a34a)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '1.5rem',
          fontWeight: '800',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          marginBottom: '10px'
        }}>
          Certificate of Excellence
        </div>
        
        <div style={{
          width: '100px',
          height: '2px',
          background: 'linear-gradient(90deg, #0a451c, #facf3c)',
          margin: '0 auto'
        }}></div>
      </div>

      {/* Main content */}
      <div style={{
        textAlign: 'center',
        zIndex: 2,
        position: 'relative',
        marginBottom: '40px'
      }}>
        <div style={{ 
          fontSize: config.fontSize.name, 
          fontWeight: '700', 
          marginBottom: '20px',
          color: '#0a451c'
        }}>
          {recipientName}
        </div>
        
        <div style={{ 
          fontSize: config.fontSize.title, 
          lineHeight: 1.6,
          color: '#374151',
          maxWidth: '80%',
          margin: '0 auto'
        }}>
          has successfully completed the<br />
          <strong style={{ color: '#0a451c' }}>{program}</strong>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: 'absolute',
        bottom: '30px',
        left: '40px',
        right: '40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 2
      }}>
        <div style={{ textAlign: 'left' }}>
          <div style={{
            width: '120px',
            height: '1px',
            background: '#0a451c',
            marginBottom: '8px'
          }} />
          <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#0a451c' }}>{instructor}</div>
        </div>
        
        <div style={{
          fontSize: '0.8rem', 
          background: 'rgba(10, 69, 28, 0.1)', 
          padding: '8px 16px', 
          borderRadius: '20px',
          fontWeight: '600',
          color: '#0a451c',
          border: '1px solid rgba(10, 69, 28, 0.2)'
        }}>
          {date}
        </div>
      </div>
    </div>
  );
};

// Premium Certificate Template - Design 2: Modern
const PremiumCertificateModern = ({ 
  recipientName = "Certificate Recipient", 
  size = "standard",
  id = "item-1",
  customData = {}
}) => {
  const sizeConfig = {
    compact: { width: 420, height: 300, fontSize: { name: '1.3rem', title: '0.85rem' } },
    standard: { width: 560, height: 400, fontSize: { name: '1.7rem', title: '1rem' } },
    premium: { width: 700, height: 500, fontSize: { name: '2rem', title: '1.2rem' } }
  };

  const config = sizeConfig[size];
  const program = customData.program || 'Climate Leadership Program';
  const date = customData.date || new Date().toLocaleDateString();
  const instructor = customData.instructor || 'Director';
  
  return (
    <div id={id} style={{
      width: config.width,
      height: config.height,
      background: 'linear-gradient(135deg, #0a451c 0%, #16a34a 50%, #22c55e 100%)',
      borderRadius: '28px',
      padding: '32px',
      fontFamily: '"Inter", sans-serif',
      boxShadow: '0 35px 70px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.3)',
      color: '#fff',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Glass overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        zIndex: 1,
        borderRadius: '28px'
      }}></div>

      {/* Geometric patterns */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        width: '100px',
        height: '100px',
        background: 'linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
        borderRadius: '50%',
        zIndex: 1
      }}></div>

      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        width: '80px',
        height: '80px',
        background: 'linear-gradient(45deg, rgba(250, 207, 60, 0.3), rgba(250, 207, 60, 0.1))',
        borderRadius: '20px',
        transform: 'rotate(45deg)',
        zIndex: 1
      }}></div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '15px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            <Award size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: '700', letterSpacing: '2px' }}>ACEF</div>
            <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Excellence in Climate Action</div>
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{
            fontSize: '1.1rem',
            fontWeight: '600',
            letterSpacing: '4px',
            marginBottom: '20px',
            textTransform: 'uppercase',
            opacity: 0.9
          }}>
            Certificate of Achievement
          </div>

          <div style={{ 
            fontSize: config.fontSize.name, 
            fontWeight: '800', 
            marginBottom: '15px',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            {recipientName}
          </div>
          
          <div style={{ 
            fontSize: config.fontSize.title, 
            lineHeight: 1.5,
            opacity: 0.95,
            maxWidth: '85%',
            margin: '0 auto'
          }}>
            has demonstrated exceptional commitment in<br />
            <strong>{program}</strong>
          </div>
        </div>

      



      </div>
    </div>
  );
};

// Premium Certificate Template - Design 3: Luxury
const PremiumCertificateLuxury = ({ 
  recipientName = "Certificate Recipient", 
  size = "standard",
  id = "item-1",
  customData = {}
}) => {
  const sizeConfig = {
    compact: { width: 420, height: 300, fontSize: { name: '1.3rem', title: '0.85rem' } },
    standard: { width: 560, height: 400, fontSize: { name: '1.7rem', title: '1rem' } },
    premium: { width: 700, height: 500, fontSize: { name: '2rem', title: '1.2rem' } }
  };

  const config = sizeConfig[size];
  const program = customData.program || 'Climate Leadership Program';
  const date = customData.date || new Date().toLocaleDateString();
  const instructor = customData.instructor || 'Director';
  
  return (
    <div id={id} style={{
      width: config.width,
      height: config.height,
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
      borderRadius: '32px',
      padding: '40px',
      fontFamily: '"Inter", sans-serif',
      boxShadow: '0 40px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(250, 207, 60, 0.3)',
      color: '#ffffff',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Luxury gradient overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(250, 207, 60, 0.1) 0%, rgba(10, 69, 28, 0.1) 50%, rgba(250, 207, 60, 0.1) 100%)',
        zIndex: 1
      }}></div>

      {/* Gold accents */}
      <div style={{
        position: 'absolute',
        top: '30px',
        left: '30px',
        right: '30px',
        height: '2px',
        background: 'linear-gradient(90deg, transparent, #facf3c, transparent)',
        zIndex: 2
      }}></div>

      <div style={{
        position: 'absolute',
        bottom: '30px',
        left: '30px',
        right: '30px',
        height: '2px',
        background: 'linear-gradient(90deg, transparent, #facf3c, transparent)',
        zIndex: 2
      }}></div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Logo section */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '30px',
          gap: '15px'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #facf3c, #f59e0b)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#000',
            fontSize: '28px',
            boxShadow: '0 10px 25px rgba(250, 207, 60, 0.3)'
          }}>
            <Star />
          </div>
          <div style={{
            fontSize: '1.8rem',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #facf3c, #ffffff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '3px'
          }}>
            ACEF
          </div>
        </div>

        {/* Certificate title */}
        <div style={{
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          <div style={{
            fontSize: '1.2rem',
            fontWeight: '300',
            letterSpacing: '6px',
            textTransform: 'uppercase',
            color: '#facf3c',
            marginBottom: '10px'
          }}>
            Certificate of
          </div>
          <div style={{
            fontSize: '1.8rem',
            fontWeight: '800',
            letterSpacing: '4px',
            textTransform: 'uppercase',
            background: 'linear-gradient(135deg, #ffffff, #facf3c)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Excellence
          </div>
        </div>

        {/* Main content */}
        <div style={{
          textAlign: 'center',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <div style={{
            fontSize: '0.9rem',
            opacity: 0.8,
            marginBottom: '15px',
            fontWeight: '300'
          }}>
            This certifies that
          </div>

          <div style={{ 
            fontSize: config.fontSize.name, 
            fontWeight: '700', 
            marginBottom: '20px',
            background: 'linear-gradient(135deg, #ffffff, #facf3c)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {recipientName}
          </div>
          
          <div style={{ 
            fontSize: config.fontSize.title, 
            lineHeight: 1.6,
            opacity: 0.9,
            maxWidth: '80%',
            margin: '0 auto',
            fontWeight: '400'
          }}>
            has achieved outstanding performance in<br />
            <strong style={{ color: '#facf3c' }}>{program}</strong>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '20px'
        }}>
          <div>
            <div style={{
              width: '120px',
              height: '1px',
              background: 'linear-gradient(90deg, #facf3c, transparent)',
              marginBottom: '8px'
            }}></div>
            <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#facf3c' }}>{instructor}</div>
            <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Program Director</div>
          </div>
          
          <div style={{
            textAlign: 'right'
          }}>
            <div style={{ fontSize: '0.8rem', color: '#facf3c', fontWeight: '600' }}>{date}</div>
            <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Date of Completion</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Premium Philanthropy Badge Template
const PremiumPhilanthropyBadge = ({ 
  recipientName = "Generous Philanthropist", 
  size = "standard",
  id = "item-1",
  customData = {}
}) => {
  const sizeConfig = {
    compact: { diameter: 280, fontSize: { name: '1rem', title: '0.7rem' } },
    standard: { diameter: 350, fontSize: { name: '1.3rem', title: '0.8rem' } },
    premium: { diameter: 420, fontSize: { name: '1.6rem', title: '0.9rem' } }
  };

  const config = sizeConfig[size];
  const displayName = customData.isAnonymous === 'true' ? "ACEF Friend" : recipientName;
  const impact = customData.impact || 'Climate Action';
  const year = customData.year || new Date().getFullYear();
  const level = customData.level || 'Gold';

  const levelColors = {
    'Bronze': { primary: '#cd7f32', secondary: '#e6a85c' },
    'Silver': { primary: '#c0c0c0', secondary: '#e8e8e8' },
    'Gold': { primary: '#ffd700', secondary: '#fff76b' },
    'Platinum': { primary: '#e5e4e2', secondary: '#ffffff' }
  };

  const colors = levelColors[level] || levelColors['Gold'];

  return (
    <div id={id} style={{
      width: config.diameter,
      height: config.diameter,
      borderRadius: '50%',
      background: `linear-gradient(135deg, #0a451c 0%, #16a34a 50%, rgba(255,255,255,0.1) 100%)`,
      backdropFilter: 'blur(20px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '30px',
      color: 'white',
      fontFamily: '"Inter", sans-serif',
      boxShadow: `0 25px 50px rgba(10, 69, 28, 0.3), 0 0 0 3px ${colors.primary}, inset 0 1px 0 rgba(255,255,255,0.2)`,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Glass overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 70%)',
        borderRadius: '50%',
        zIndex: 1
      }}></div>
      
      {/* Decorative rings */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        right: '20px',
        bottom: '20px',
        border: `2px solid ${colors.primary}`,
        borderRadius: '50%',
        opacity: 0.6,
        zIndex: 1
      }}></div>
      
      <div style={{
        position: 'absolute',
        top: '35px',
        left: '35px',
        right: '35px',
        bottom: '35px',
        border: `1px solid rgba(255,255,255,0.3)`,
        borderRadius: '50%',
        zIndex: 1
      }}></div>

      {/* Content */}
      <div style={{ 
        position: 'relative', 
        zIndex: 2, 
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px'
      }}>
        {/* Icon */}
        <div style={{
          width: '60px',
          height: '60px',
          background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          color: '#000',
          boxShadow: `0 8px 20px rgba(0,0,0,0.2)`
        }}>
          <Leaf />
        </div>

        {/* Level badge */}
        <div style={{
          background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
          color: '#000',
          padding: '6px 16px',
          borderRadius: '20px',
          fontSize: '0.7rem',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
          {level} Philanthropist
        </div>

        {/* Name */}
        <div style={{ 
          fontSize: config.fontSize.name, 
          fontWeight: '800', 
          textAlign: 'center',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          lineHeight: 1.2
        }}>
          {displayName}
        </div>

        {/* Impact */}
        <div style={{ 
          fontSize: '0.85rem', 
          textAlign: 'center',
          opacity: 0.9,
          fontWeight: '500'
        }}>
          Supporting {impact}
        </div>

        {/* Appreciation text */}
        <div style={{ 
          fontSize: config.fontSize.title, 
          textAlign: 'center',
          opacity: 0.9,
          fontWeight: '400',
          lineHeight: 1.3
        }}>
          Thank you for making<br />a difference
        </div>

        {/* Year */}
        <div style={{ 
          fontSize: '0.8rem',
          background: 'rgba(255,255,255,0.15)',
          padding: '6px 14px',
          borderRadius: '15px',
          fontWeight: '600',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          {year}
        </div>
      </div>
    </div>
  );
};

// Field configuration for different template types
const FIELD_CONFIGURATIONS = {
  businessCard: {
    name: "Business Cards",
    template: PremiumBusinessCardTemplate,
    fields: [
      { key: 'recipientName', label: 'Full Name', type: 'text', required: true, placeholder: 'Enter full name' },
      { key: 'position', label: 'Position/Title', type: 'text', placeholder: 'e.g., Program Manager' },
      { key: 'department', label: 'Department', type: 'text', placeholder: 'e.g., Operations, Finance' },
      { key: 'email', label: 'Email Address', type: 'email', placeholder: 'email@acef.org' },
      { key: 'phone', label: 'Phone Number', type: 'text', placeholder: '+254 700 000 000' }
    ]
  },
  certificateElegant: {
    name: "Certificates - Elegant",
    template: PremiumCertificateElegant,
    fields: [
      { key: 'recipientName', label: 'Recipient Name', type: 'text', required: true, placeholder: 'Enter recipient name' },
      { key: 'program', label: 'Program/Course Name', type: 'text', placeholder: 'e.g., Climate Leadership Program' },
      { key: 'instructor', label: 'Instructor/Signatory', type: 'text', placeholder: 'e.g., Director, Prof. Smith' },
      { key: 'date', label: 'Completion Date', type: 'date' }
    ]
  },
  certificateModern: {
    name: "Certificates - Modern",
    template: PremiumCertificateModern,
    fields: [
      { key: 'recipientName', label: 'Recipient Name', type: 'text', required: true, placeholder: 'Enter recipient name' },
      { key: 'program', label: 'Program/Course Name', type: 'text', placeholder: 'e.g., Climate Leadership Program' },
      { key: 'instructor', label: 'Instructor/Signatory', type: 'text', placeholder: 'e.g., Director, Prof. Smith' },
      { key: 'date', label: 'Completion Date', type: 'date' }
    ]
  },
  certificateLuxury: {
    name: "Certificates - Luxury",
    template: PremiumCertificateLuxury,
    fields: [
      { key: 'recipientName', label: 'Recipient Name', type: 'text', required: true, placeholder: 'Enter recipient name' },
      { key: 'program', label: 'Program/Course Name', type: 'text', placeholder: 'e.g., Climate Leadership Program' },
      { key: 'instructor', label: 'Instructor/Signatory', type: 'text', placeholder: 'e.g., Director, Prof. Smith' },
      { key: 'date', label: 'Completion Date', type: 'date' }
    ]
  },
  philanthropyBadge: {
    name: "Philanthropy Badges",
    template: PremiumPhilanthropyBadge,
    fields: [
      { key: 'recipientName', label: 'Philanthropist Name', type: 'text', required: true, placeholder: 'Enter philanthropist name' },
      { key: 'impact', label: 'Impact Area', type: 'select', options: ['Climate Action', 'Education', 'Healthcare', 'Community Development', 'Environmental Protection'] },
      { key: 'level', label: 'Recognition Level', type: 'select', options: ['Bronze', 'Silver', 'Gold', 'Platinum'] },
      { key: 'year', label: 'Year', type: 'number', placeholder: new Date().getFullYear().toString() },
      { key: 'isAnonymous', label: 'Anonymous Recognition', type: 'checkbox' }
    ]
  }
};

const BadgeGenerator = () => {
  const [selectedType, setSelectedType] = useState('businessCard');
  const [recipients, setRecipients] = useState([
    { 
      recipientName: "Dr. Amina Kone", 
      size: "premium",
      customData: { 
        position: "Climate Program Manager",
        department: "Operations",
        email: "a.kone@acef.org",
        phone: "+254 700 123 456"
      }
    }
  ]);
  const [csvFile, setCsvFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  // Current configuration
  const currentConfig = FIELD_CONFIGURATIONS[selectedType];
  const TemplateComponent = currentConfig?.template;

  // Load html2canvas
  React.useEffect(() => {
    if (!window.html2canvas) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  const downloadSingle = async (itemId, name) => {
    try {
      if (!window.html2canvas) {
        alert('Please wait for the page to fully load before downloading.');
        return;
      }

      const element = document.getElementById(itemId);
      if (!element) return;

      const canvas = await window.html2canvas(element, {
        backgroundColor: null,
        scale: 3,
        useCORS: true,
        allowTaint: true,
        logging: false
      });

      canvas.toBlob((blob) => {
        const link = document.createElement('a');
        link.download = `${name.replace(/[^a-z0-9\s]/gi, '_')}_${selectedType}.png`;
        link.href = URL.createObjectURL(blob);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      }, 'image/png', 1.0);
      
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
  };

  const downloadAll = async () => {
    setIsProcessing(true);
    try {
      for (let i = 0; i < recipients.length; i++) {
        const recipient = recipients[i];
        await new Promise(resolve => setTimeout(resolve, 500));
        await downloadSingle(`item-${i}`, recipient.recipientName);
      }
    } catch (error) {
      console.error('Bulk download failed:', error);
    }
    setIsProcessing(false);
  };

  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csv = e.target.result;
          const lines = csv.split('\n').filter(line => line.trim());
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
          
          const recipientNameIndex = headers.findIndex(h => 
            h.includes('name') || h.includes('recipient')
          );
          
          if (recipientNameIndex === -1) {
            alert('CSV must contain a "name" or "recipient" column');
            return;
          }

          const newRecipients = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim().replace(/['"]/g, ''));
            
            const customData = {};
            headers.forEach((header, index) => {
              if (header !== 'name' && header !== 'recipient' && header !== 'size' && values[index]) {
                customData[header.replace(/\s+/g, '')] = values[index];
              }
            });

            const sizeIndex = headers.findIndex(h => h.includes('size'));
            const size = sizeIndex !== -1 ? values[sizeIndex] : 'standard';

            return {
              recipientName: values[recipientNameIndex] || 'Recipient',
              size: ['compact', 'standard', 'premium'].includes(size.toLowerCase()) ? size.toLowerCase() : 'standard',
              customData
            };
          }).filter(recipient => recipient.recipвысота && recipient.recipientName !== 'Recipient');

          setRecipients(newRecipients);
        } catch (error) {
          alert('Error parsing CSV file. Please check the format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const addSampleRecipient = () => {
    const newRecipient = {
      recipientName: 'New Recipient',
      size: 'standard',
      customData: {}
    };

    // Set default values for current template type
    if (selectedType === 'businessCard') {
      newRecipient.customData = {
        position: 'Team Member',
        department: 'Operations',
        email: 'contact@acef.org',
        phone: '+254 700 000 000'
      };
    } else if (selectedType.startsWith('certificate')) {
      newRecipient.customData = {
        program: 'Climate Leadership Program',
        instructor: 'Director',
        date: new Date().toISOString().split('T')[0]
      };
    } else if (selectedType === 'philanthropyBadge') {
      newRecipient.customData = {
        impact: 'Climate Action',
        level: 'Gold',
        year: new Date().getFullYear().toString(),
        isAnonymous: 'false'
      };
    }

    setRecipients([...recipients, newRecipient]);
  };

  const removeRecipient = (index) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const updateRecipientField = (recipientIndex, fieldKey, value) => {
    const updated = [...recipients];
    if (fieldKey === 'recipientName' || fieldKey === 'size') {
      updated[recipientIndex][fieldKey] = value;
    } else {
      updated[recipientIndex].customData[fieldKey] = value;
    }
    setRecipients(updated);
  };

  const resetRecipients = () => {
    const defaultRecipient = { 
      recipientName: "Dr. Amina Kone", 
      size: "premium",
      customData: {}
    };

    if (selectedType === 'businessCard') {
      defaultRecipient.customData = {
        position: "Climate Program Manager",
        department: "Operations", 
        email: "a.kone@acef.org",
        phone: "+254 700 123 456"
      };
    } else if (selectedType.startsWith('certificate')) {
      defaultRecipient.customData = {
        program: 'Climate Leadership Program',
        instructor: 'Director',
        date: new Date().toISOString().split('T')[0]
      };
    } else if (selectedType === 'philanthropyBadge') {
      defaultRecipient.customData = {
        impact: 'Climate Action',
        level: 'Gold',
        year: new Date().getFullYear().toString(),
        isAnonymous: 'false'
      };
    }

    setRecipients([defaultRecipient]);
    setCsvFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadCSVTemplate = () => {
    if (!currentConfig) return;
    
    const headers = ['recipientName', 'size', ...currentConfig.fields.filter(f => f.key !== 'recipientName').map(f => f.key)];
    
    const sampleRow = {
      recipientName: 'John Doe',
      size: 'standard'
    };
    
    currentConfig.fields.forEach(field => {
      if (field.key !== 'recipientName') {
        switch (field.type) {
          case 'text':
            sampleRow[field.key] = field.placeholder || `Sample ${field.label}`;
            break;
          case 'email':
            sampleRow[field.key] = 'sample@acef.org';
            break;
          case 'number':
            sampleRow[field.key] = '2024';
            break;
          case 'select':
            sampleRow[field.key] = field.options?.[0] || 'Option1';
            break;
          case 'checkbox':
            sampleRow[field.key] = 'false';
            break;
          case 'date':
            sampleRow[field.key] = new Date().toISOString().split('T')[0];
            break;
          default:
            sampleRow[field.key] = 'Sample Data';
        }
      }
    });
    
    const csvContent = [
      headers.join(','),
      headers.map(header => sampleRow[header] || '').join(','),
      headers.map(header => {
        if (header === 'recipientName') return 'Jane Smith';
        if (header === 'size') return 'premium';
        return sampleRow[header] || '';
      }).join(',')
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${selectedType}_template.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  // Update recipients when template type changes
  React.useEffect(() => {
    resetRecipients();
  }, [selectedType]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a451c 100%)',
      padding: '40px 20px',
      color: '#ffffff'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: '800',
          background: 'linear-gradient(135deg, #facf3c, #ffffff, #9ccf9f)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontFamily: '"Inter", sans-serif',
          marginBottom: '15px',
          textShadow: '0 4px 8px rgba(0,0,0,0.3)'
        }}>
          ACEF Resource Generator
        </h1>
        <p style={{
          fontSize: '1.3rem',
          color: '#e5e7eb',
          fontFamily: '"Inter", sans-serif',
          opacity: 0.9
        }}>
Specialized Generator for ACEF's business cards, certificates and badges        </p>
      </div>

      {/* Controls */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto 40px',
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        padding: '35px',
        borderRadius: '24px',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        {/* Template Type Selector */}
        <div style={{ marginBottom: '35px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '20px', 
            fontWeight: '700', 
            color: '#facf3c', 
            fontSize: '1.2rem' 
          }}>
            Select Template Type
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
            {Object.entries(FIELD_CONFIGURATIONS).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setSelectedType(key)}
                style={{
                  padding: '20px 25px',
                  border: selectedType === key ? '2px solid #facf3c' : '2px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  background: selectedType === key 
                    ? 'linear-gradient(135deg, rgba(250, 207, 60, 0.2), rgba(250, 207, 60, 0.1))' 
                    : 'rgba(255,255,255,0.05)',
                  color: selectedType === key ? '#facf3c' : '#ffffff',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  fontSize: '1rem',
                  backdropFilter: 'blur(10px)'
                }}
              >
                {config.name}
              </button>
            ))}
          </div>
        </div>

        {/* Field Configuration Display */}
        <div style={{ marginBottom: '35px' }}>
          <div style={{ 
            background: 'rgba(255,255,255,0.05)', 
            padding: '25px', 
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <h3 style={{ 
              margin: '0 0 18px 0', 
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <FileCheck size={20} color="#facf3c" />
              Available Fields for {currentConfig?.name}
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '12px'
            }}>
              {currentConfig?.fields.map((field, index) => (
                <div key={index} style={{
                  padding: '12px 16px',
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  fontSize: '0.9rem'
                }}>
                  <strong style={{ color: '#facf3c' }}>{field.label}</strong>
                  <div style={{ color: '#e5e7eb', marginTop: '4px' }}>
                    {field.type} {field.required && '(required)'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Data Input Methods */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '30px' }}>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '12px', 
              fontWeight: '600', 
              color: '#facf3c',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <Upload size={18} />
              Upload CSV File
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '2px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                fontSize: '14px',
                background: 'rgba(255,255,255,0.05)',
                color: '#ffffff',
                backdropFilter: 'blur(10px)'
              }}
            />
            <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '8px' }}>
              CSV should include: {currentConfig?.fields.filter(f => f.required).map(f => f.key).join(', ')} (required)
              <button
                onClick={() => downloadCSVTemplate()}
                style={{
                  display: 'block',
                  marginTop: '10px',
                  padding: '8px 14px',
                  background: 'linear-gradient(135deg, #facf3c, #f59e0b)',
                  color: '#000',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Download CSV Template
              </button>
            </div>
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '12px', 
              fontWeight: '600', 
              color: '#facf3c',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <Plus size={18} />
              Quick Actions
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={addSampleRecipient}
                style={{
                  padding: '14px 20px',
                  background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                Add Sample Recipient
              </button>
              <button
                onClick={resetRecipients}
                style={{
                  padding: '14px 20px',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                Reset All
              </button>
              <button
                onClick={downloadAll}
                disabled={recipients.length === 0 || isProcessing}
                style={{
                  padding: '14px 20px',
                  background: recipients.length > 0 && !isProcessing 
                    ? 'linear-gradient(135deg, #facf3c, #f59e0b)' 
                    : 'rgba(156, 163, 175, 0.3)',
                  color: recipients.length > 0 && !isProcessing ? '#000' : '#9ca3af',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: recipients.length > 0 && !isProcessing ? 'pointer' : 'not-allowed',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                {isProcessing ? 'Processing...' : `Download All (${recipients.length})`}
              </button>
            </div>
          </div>
        </div>

        {/* Status Display */}
        {csvFile && (
          <div style={{
            padding: '18px',
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.1))',
            borderRadius: '16px',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            marginBottom: '30px'
          }}>
            <div style={{ fontSize: '14px', color: '#22c55e', fontWeight: '600', marginBottom: '6px' }}>
              CSV Loaded Successfully
            </div>
            <div style={{ fontSize: '13px', color: '#16a34a' }}>
              File: {csvFile.name} • {recipients.length} recipients • Template: {currentConfig?.name}
            </div>
          </div>
        )}
      </div>

      {/* Individual Recipient Editor */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto 40px',
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        padding: '35px',
        borderRadius: '24px',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <h3 style={{ 
          margin: '0 0 25px 0', 
          color: '#facf3c',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Edit size={22} />
          Individual Editor ({recipients.length} recipients)
        </h3>
        
        {recipients.map((recipient, index) => (
          <div key={index} style={{
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '25px',
            marginBottom: '20px',
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h4 style={{ margin: 0, color: '#ffffff', fontSize: '1.1rem' }}>
                Recipient {index + 1}: {recipient.recipientName}
              </h4>
              <button
                onClick={() => removeRecipient(index)}
                style={{
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              >
                Remove
              </button>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '18px'
            }}>
              {/* Core fields */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#facf3c' }}>
                  Name (Required)
                </label>
                <input
                  type="text"
                  value={recipient.recipientName}
                  onChange={(e) => updateRecipientField(index, 'recipientName', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    marginTop: '6px',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#ffffff',
                    backdropFilter: 'blur(10px)'
                  }}
                />
              </div>
              
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#facf3c' }}>
                  Size
                </label>
                <select
                  value={recipient.size}
                  onChange={(e) => updateRecipientField(index, 'size', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    marginTop: '6px',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#ffffff',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <option value="compact" style={{ background: '#1a1a1a' }}>Compact</option>
                  <option value="standard" style={{ background: '#1a1a1a' }}>Standard</option>
                  <option value="premium" style={{ background: '#1a1a1a' }}>Premium</option>
                </select>
              </div>

              {/* Template-specific fields */}
              {currentConfig?.fields.filter(f => f.key !== 'recipientName').map((field) => (
                <div key={field.key}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#facf3c' }}>
                    {field.label} {field.required && '*'}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      value={recipient.customData[field.key] || ''}
                      onChange={(e) => updateRecipientField(index, field.key, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        fontSize: '14px',
                        marginTop: '6px',
                        background: 'rgba(255,255,255,0.05)',
                        color: '#ffffff',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      <option value="" style={{ background: '#1a1a1a' }}>Select...</option>
                      {field.options?.map(option => (
                        <option key={option} value={option} style={{ background: '#1a1a1a' }}>{option}</option>
                      ))}
                    </select>
                  ) : field.type === 'checkbox' ? (
                    <div style={{ marginTop: '10px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                        <input
                          type="checkbox"
                          checked={recipient.customData[field.key] === 'true'}
                          onChange={(e) => updateRecipientField(index, field.key, e.target.checked ? 'true' : 'false')}
                          style={{ transform: 'scale(1.2)' }}
                        />
                        <span style={{ color: '#ffffff' }}>Yes</span>
                      </label>
                    </div>
                  ) : (
                    <input
                      type={field.type}
                      value={recipient.customData[field.key] || ''}
                      onChange={(e) => updateRecipientField(index, field.key, e.target.value)}
                      placeholder={field.placeholder}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        fontSize: '14px',
                        marginTop: '6px',
                        background: 'rgba(255,255,255,0.05)',
                        color: '#ffffff',
                        backdropFilter: 'blur(10px)'
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Template Preview & Downloads */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '40px',
        justifyContent: 'center',
        alignItems: 'flex-start'
      }}>
        {recipients.map((recipient, index) => (
          <div key={index} style={{ 
            position: 'relative',
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            padding: '25px',
            borderRadius: '24px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.3s ease',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            {/* Template Component */}
            {TemplateComponent && (
              <TemplateComponent
                recipientName={recipient.recipientName}
                size={recipient.size}
                year={2024}
                id={`item-${index}`}
                customData={recipient.customData}
              />
            )}
            
            {/* Action Buttons */}
            <div style={{
              position: 'absolute',
              top: '15px',
              right: '15px',
              display: 'flex',
              gap: '10px'
            }}>
              <button
                onClick={() => downloadSingle(`item-${index}`, recipient.recipientName)}
                style={{
                  background: 'linear-gradient(135deg, #facf3c, #f59e0b)',
                  color: '#000',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 20px rgba(250, 207, 60, 0.4)',
                  transition: 'all 0.2s ease',
                  fontWeight: '600'
                }}
                title="Download this item"
              >
                <Download size={18} />
              </button>
              <button
                onClick={() => removeRecipient(index)}
                style={{
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 20px rgba(239, 68, 68, 0.4)',
                  transition: 'all 0.2s ease'
                }}
                title="Remove this item"
              >
                <X size={18} />
              </button>
            </div>

            {/* Item Info */}
            <div style={{
              marginTop: '20px',
              padding: '15px',
              background: 'rgba(255,255,255,0.08)',
              borderRadius: '12px',
              textAlign: 'center',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#facf3c', marginBottom: '6px' }}>
                {recipient.recipientName}
              </div>
              <div style={{ fontSize: '12px', color: '#e5e7eb' }}>
                {recipient.size} • {currentConfig?.name}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {recipients.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          color: '#e5e7eb'
        }}>
          <div style={{ 
            fontSize: '4rem', 
            marginBottom: '25px',
            background: 'linear-gradient(135deg, #facf3c, #ffffff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🎯
          </div>
          <h3 style={{ 
            fontSize: '1.8rem', 
            marginBottom: '15px', 
            color: '#facf3c',
            fontWeight: '700'
          }}>
            No Recipients Added
          </h3>
          <p style={{ 
            fontSize: '1.1rem', 
            marginBottom: '25px',
            opacity: 0.8,
            lineHeight: '1.6'
          }}>
            Upload a CSV file or add recipients manually to start creating your premium {currentConfig?.name.toLowerCase()}.
          </p>
          <div style={{
            display: 'flex',
            gap: '15px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={addSampleRecipient}
              style={{
                padding: '12px 25px',
                background: 'linear-gradient(135deg, #facf3c, #f59e0b)',
                color: '#000',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px'
              }}
            >
              Add Sample Recipient
            </button>
            <button
              onClick={() => downloadCSVTemplate()}
              style={{
                padding: '12px 25px',
                background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px'
              }}
            >
              Download CSV Template
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default BadgeGenerator;