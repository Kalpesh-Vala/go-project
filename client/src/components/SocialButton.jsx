import React from "react";
import PropTypes from "prop-types";

const SocialButton = ({ iconPath, alt }) => {
  return (
    <button className="btn btn-outline-secondary social-btn">
      <img src={iconPath} alt={alt} style={{ width: "20px", height: "20px" }} />
    </button>
  );
};

SocialButton.propTypes = {
  iconPath: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
};

export default SocialButton;