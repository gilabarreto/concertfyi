import "./BackgroundImage.css";
import { useState, useEffect } from "react";

// Import the background images from the image directory.
import background1 from "../imgs/main-page-1.jpg";
import background2 from "../imgs/main-page-2.jpg";
import background3 from "../imgs/main-page-3.jpg";
import background4 from "../imgs/main-page-4.jpg";
import background5 from "../imgs/main-page-5.jpg";
import background6 from "../imgs/main-page-6.jpg";

// Define the BackgroundImage component.
export default function BackgroundImage() {
  // Create an array of background images.
  const background = [
    background1,
    background2,
    background3,
    background4,
    background5,
    background6
  ];

  // Define the active image index state and update it using the useEffect hook.
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const timerId = setTimeout(() => {
      let newActiveIndex = activeImageIndex === 5 ? 0 : activeImageIndex + 1;
      setActiveImageIndex(newActiveIndex);
    }, 6000);
    return () => clearTimeout(timerId); // clear timer on component unmount
  }, [activeImageIndex]);

  // Return the rendered background images.
  return (
    <div>
      {background.map((img, index) => (
        <img
          key={index}
          src={background[activeImageIndex]}
          className={activeImageIndex === index ? "background-img" : "background-img hidden"}
          alt={`Background ${index}`}
        />
      ))}
    </div>
  );
}
