import React, { useRef } from "react";
import { FaChevronDown } from "react-icons/fa";
import "./CakeAccordion.scss";

const CakeAccordion = ({ title, children, isExpanded, onToggle }) => {
  const contentRef = useRef(null);

  return (
    <div className="cake-accordion">
      <button className={`cake-accordion__header ${isExpanded ? "open" : ""}`} onClick={onToggle}>
        <span>{title}</span>
        <FaChevronDown className="icon" />
      </button>

      <div
        className="cake-accordion__content"
        style={{ maxHeight: isExpanded ? `${contentRef.current.scrollHeight}px` : "0px" }}
        ref={contentRef}
      >
        <div className="cake-accordion__inner">{children}</div>
      </div>
    </div>
  );
};

export default CakeAccordion;
