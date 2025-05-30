import React from 'react';
import { Link } from 'react-router-dom';
import * as BiIcons from 'react-icons/bi';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3 className="footer-title">DailyByte</h3>
          <p className="footer-tagline">
            Empowering minds through daily<br /> 
            psychological insights and growth.
          </p>
        </div>

        <div className="footer-section">
          <h3 className="footer-heading">Quick Links</h3>
          <div className="footer-links-inline">
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/privacy">Privacy Policy</Link>
          </div>
        </div>

        <div className="footer-section">
          <h3 className="footer-heading">Connect</h3>
          <div className="social-icons">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <BiIcons.BiLogoTwitter />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <BiIcons.BiLogoFacebook />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <BiIcons.BiLogoInstagram />
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h3 className="footer-heading">Newsletter</h3>
          <div className="newsletter-form">
            <input 
              type="email" 
              placeholder="Enter your email" 
              aria-label="Email for newsletter"
            />
            <button type="button" aria-label="Subscribe">
              <BiIcons.BiRightArrowAlt />
            </button>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2025 DailyByte. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;