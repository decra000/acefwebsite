import React, { useState, useEffect } from 'react';

const StickyTextScroller = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const sections = [
    {
      title: "About",
      content: "Africa Climate and Environment Foundation (ACEF) is a youth focused non-governmental organization (NGO) founded in 2021, dedicated to empowering grassroots youth and women while supporting locally driven initiatives to address the triple planetary crisis of climate change, biodiversity loss, and pollution. Registered across various African nations, ACEF works to enhance climate resilience, promote sustainable livelihoods, and foster environmental stewardship through innovative, community-led solutions."
    },
    {
      title: "Our Work",
      content: "ACEF works toward addressing global issues related to climate change, environmental degradation, and poverty alleviation by focusing on Sustainable Development Goals (SDGs) such as clean water and sanitation (SDG 6), climate action (SDG 13), Life below water (SDG 14), and quality education (SDG 4). Through a combination of advocacy and on-the-ground action, we mobilize youth, implement sustainable projects, and create partnerships aimed at building resilience within vulnerable communities."
    },
    {
      title: "Mission",
      content: "To engage extensively on multi-faceted climate action, environmental protection, and sustainable development activities that help bridge the hunger and poverty gap."
    },
    {
      title: "Vision",
      content: "To become the global leader in climate, environmental, and community service."
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const stickySection = document.getElementById('sticky-section');
      const nextSection = document.getElementById('next-section');
      
      if (!stickySection || !nextSection) return;

      const stickyRect = stickySection.getBoundingClientRect();
      const nextRect = nextSection.getBoundingClientRect();
      
      // Calculate scroll progress within the sticky section
      const stickyHeight = stickySection.offsetHeight;
      const windowHeight = window.innerHeight;
      const scrollProgress = Math.max(0, -stickyRect.top / (stickyHeight - windowHeight));
      
      // Determine which section to show based on scroll progress
      const sectionProgress = scrollProgress * (sections.length - 1);
      const newIndex = Math.min(Math.floor(sectionProgress), sections.length - 1);
      
      setCurrentIndex(newIndex);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="h-screen bg-gradient-to-br from-green-600 to-blue-600 flex items-center justify-center">
        <div className="text-center text-white px-8">
          <h1 className="text-5xl font-bold mb-6">Africa Climate and Environment Foundation</h1>
          <p className="text-xl opacity-90">Empowering youth for climate action across Africa</p>
        </div>
      </section>

      {/* Sticky Text Section */}
      <section id="sticky-section" className="relative" style={{ height: '400vh' }}>
        <div className="sticky top-0 h-screen bg-white flex items-center justify-center overflow-hidden">
          <div className="max-w-4xl mx-auto px-8 text-center">
            <div className="transition-all duration-700 ease-in-out transform">
              <h2 className="text-4xl font-bold text-gray-800 mb-8 transition-all duration-500">
                {sections[currentIndex].title}
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed transition-all duration-500">
                {sections[currentIndex].content}
              </p>
            </div>
            
            {/* Progress indicators */}
            <div className="flex justify-center mt-12 space-x-3">
              {sections.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'bg-green-500 scale-125' 
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

     
    </div>
  );
};

export default StickyTextScroller;