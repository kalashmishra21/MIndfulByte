import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as FaIcons from 'react-icons/fa';
import * as BiIcons from 'react-icons/bi';
import * as MdIcons from 'react-icons/md';
import './Hero.css';

const Hero = () => {
  const [particles, setParticles] = useState([]);
  const navigate = useNavigate();

  // Generate floating particles
  useEffect(() => {
    const generateParticles = () => {
      const newParticles = [];
      for (let i = 0; i < 50; i++) {
        newParticles.push({
          id: i,
          left: Math.random() * 100,
          animationDelay: Math.random() * 10,
          size: Math.random() * 4 + 2
        });
      }
      setParticles(newParticles);
    };
    
    generateParticles();
  }, []);

  const handleStartLearning = () => {
    // Scroll to the bytes section
    const bytesSection = document.querySelector('.bytes');
    if (bytesSection) {
      bytesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExploreBytes = () => {
    navigate('/all-bytes');
  };

  return (
    <section className="hero">
      {/* Animated Background */}
      <div className="hero-background">
        <div className="gradient-orb gradient-orb-1"></div>
        <div className="gradient-orb gradient-orb-2"></div>
        <div className="gradient-orb gradient-orb-3"></div>
      </div>

      {/* Floating Particles */}
      <div className="particles-container">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.left}%`,
              animationDelay: `${particle.animationDelay}s`,
              width: `${particle.size}px`,
              height: `${particle.size}px`
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="hero-content">
        <div className="hero-badge">
          <FaIcons.FaStar className="badge-icon" />
          <span>Daily Learning Journey</span>
        </div>

        <h1 className="hero-title">
          <span className="title-highlight">Transform</span> Your Mind
          <br />
          <span className="title-gradient">One Byte at a Time</span>
        </h1>

        <p className="hero-subtitle">
          Embark on a journey of self-discovery and growth with our curated daily wisdom. 
          Every step forward is progress worth celebrating.
        </p>

        <div className="hero-quote">
          <div className="quote-mark">
            <FaIcons.FaQuoteLeft />
          </div>
          <blockquote>
            "The journey of self-discovery begins with a single step."
          </blockquote>
          <cite>- Daily Byte Wisdom</cite>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="scroll-indicator">
        <div className="scroll-arrow">
          <BiIcons.BiChevronDown />
        </div>
        <span>Scroll to explore</span>
      </div>
    </section>
  );
};

export default Hero;
