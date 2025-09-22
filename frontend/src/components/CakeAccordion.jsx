import React, { useState, useRef } from "react";
import { FaChevronDown } from "react-icons/fa";
import "./CakeAccordion.scss";

const CakeAccordion = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef(null);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="cake-accordion">
      <button className={`cake-accordion__header ${isOpen ? "open" : ""}`} onClick={toggleAccordion}>
        <span>{title}</span>
        <FaChevronDown className="icon" />
      </button>

      <div
        className="cake-accordion__content"
        style={{ maxHeight: isOpen ? `${contentRef.current.scrollHeight}px` : "0px" }}
        ref={contentRef}
      >
        <div className="cake-accordion__inner">{children}</div>
      </div>
    </div>
  );
};

export default CakeAccordion;
