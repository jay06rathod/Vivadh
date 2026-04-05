import React from "react";
import { useNavigate } from "react-router-dom";

const BackButton = ({ label = "Back", className = "" }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className={`flex items-center gap-2 text-[#666] hover:text-[#bbb] transition ${className}`}
    >
      <span className="text-xl">←</span>
      {label && <span className="text-sm">{label}</span>}
    </button>
  );
};

export default BackButton;