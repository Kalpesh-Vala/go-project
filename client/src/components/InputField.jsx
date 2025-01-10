import React from "react";

const InputField = ({ label, type, placeholder, icon }) => {
  return (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      <div className="input-group">
        {icon && (
          <span className="input-group-text bg-light">
            <i className={icon}></i>
          </span>
        )}
        <input
          type={type}
          className="form-control"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};

export default InputField;
