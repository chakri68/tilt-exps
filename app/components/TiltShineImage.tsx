"use client";

import React, { useEffect, useRef } from "react";

export type TiltShineImageProps = {
  imageUrl?: string;
};

const TiltShineImage = ({ imageUrl }: TiltShineImageProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Update shine effect based on orientation values
  const updateShine = (x: number, y: number) => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const shine = container.querySelector(".shine") as HTMLElement;

    // Update the gradient position
    shine.style.background = `linear-gradient(${135 + (x - 0.5) * 90}deg, 
                              rgba(255,255,255,0.7) 0%, 
                              rgba(255,255,255,0) 60%)`;

    // Add a slight transform effect for more dimensionality
    container.style.transform = `perspective(1000px) rotateX(${
      (y - 0.5) * -10
    }deg) rotateY(${(x - 0.5) * 10}deg)`;
  };

  // Handle orientation changes
  const handleOrientation = (event: DeviceOrientationEvent) => {
    // Get the orientation values
    const beta = event.beta; // X-axis (-180 to 180)
    const gamma = event.gamma; // Y-axis (-90 to 90)

    if (beta === null || gamma === null) return;

    // Normalize values to use for the shine effect
    const normalizedX = Math.min(Math.max((gamma + 90) / 180, 0), 1);
    const normalizedY = Math.min(Math.max((beta + 180) / 360, 0), 1);

    // Update the shine effect position
    updateShine(normalizedX, normalizedY);
  };

  // Set up event listeners
  useEffect(() => {
    // Default to center position
    updateShine(0.5, 0.5);

    window.addEventListener("deviceorientation", handleOrientation);

    // Cleanup function
    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div
        ref={containerRef}
        className="relative w-64 h-64 overflow-hidden rounded-lg shadow-lg transition-transform duration-100 ease-out"
      >
        <div className="w-full h-full">
          <img
            src={imageUrl || "/api/placeholder/400/400"}
            alt="Tilt responsive image"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="shine absolute inset-0 pointer-events-none"></div>
      </div>
    </div>
  );
};

export default TiltShineImage;
