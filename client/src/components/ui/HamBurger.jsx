import React from 'react';

const HamBurger = ({ isOpen, onClick }) => {
  return (
    <button 
      onClick={onClick} 
      className={`menu-toggle ${isOpen ? "is-open" : ""}`}
      aria-label="Toggle menu"
    >
      <div id="bar1" className="menu-bars"></div>
      <div id="bar2" className="menu-bars"></div>
      <div id="bar3" className="menu-bars"></div>

      <style>{`
        .menu-toggle {
          position: relative;
          width: 16px;
          height: 16px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 7px;
          transition-duration: .3s;
          border: none;
          background: transparent;
          padding: 0;
        }

        .menu-bars {
          width: 100%;
          height: 3px;
          background-color: #444; 
          border-radius: 5px;
          transition-duration: .3s;
        }

        .menu-toggle:hover .menu-bars {
          background-color: #888; 
        }

        /* --- Active (Open) State --- */
        .menu-toggle.is-open {
          transform: rotate(-90deg);
        }

        .menu-toggle.is-open .menu-bars {
          background-color: #f0ece4; 
        }

        .menu-toggle.is-open #bar2 {
          transform: translateY(10px) rotate(60deg);
          margin-left: 0;
          transform-origin: right;
          transition-duration: .3s;
          z-index: 2;
        }

        .menu-toggle.is-open #bar1 {
          transform: translateY(20px) rotate(-60deg);
          transition-duration: .3s;
          transform-origin: left;
          z-index: 1;
        }
      `}</style>
    </button>
  );
};

export default HamBurger;