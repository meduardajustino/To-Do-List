import React from "react";

function Photo({ backgrounds, onBackgroundChange }) {
  return (
    <div className="background-selector">
      {backgrounds.map((_, index) => (
        <button
          key={index}
          onClick={() => onBackgroundChange(index)}
          className="dot"
        ></button>
      ))}
    </div>
  );
}

export default Photo;