"use client";

import React, { useState, useEffect, MouseEvent } from "react";

const HologramEffect = () => {
  const [orientation, setOrientation] = useState({
    alpha: 0,
    beta: 0,
    gamma: 0,
  });
  const [isSupported, setIsSupported] = useState(true);
  const lineCount = 20;

  useEffect(() => {
    // Check if DeviceOrientationEvent is supported
    if (window.DeviceOrientationEvent) {
      // Request permission for iOS 13+ devices
      // @ts-expect-error - requestPermission is not yet in the TS types
      if (typeof DeviceOrientationEvent.requestPermission === "function") {
        // Create a button for iOS permission
        const button = document.createElement("button");
        button.innerText = "Enable Motion Sensors";
        button.className =
          "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4";
        button.onclick = async () => {
          try {
            // @ts-expect-error - requestPermission is not yet in the TS types
            const permission = await DeviceOrientationEvent.requestPermission();
            if (permission === "granted") {
              window.addEventListener("deviceorientation", handleOrientation);
              button.remove();
            }
          } catch (error) {
            console.error(
              "Error requesting device orientation permission:",
              error
            );
          }
        };
        document.getElementById("permission-container")?.appendChild(button);
      } else {
        // For non-iOS devices, just add the event listener
        window.addEventListener("deviceorientation", handleOrientation);
      }
    } else {
      setIsSupported(false);
    }

    // Cleanup
    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, []);

  const handleOrientation = (event: DeviceOrientationEvent) => {
    setOrientation({
      alpha: event.alpha || 0, // Z-axis rotation [0, 360)
      beta: event.beta || 0, // X-axis rotation [-180, 180)
      gamma: event.gamma || 0, // Y-axis rotation [-90, 90)
    });
  };

  // Calculate color based on device orientation
  const getHologramColor = () => {
    // Normalize values to use for color generation
    const normalizedAlpha = orientation.alpha / 360;
    const normalizedBeta = (orientation.beta + 180) / 360;
    const normalizedGamma = (orientation.gamma + 90) / 180;

    // Create RGB values with holographic effect
    const r = Math.floor(150 + 100 * normalizedGamma);
    const g = Math.floor(150 + 100 * normalizedBeta);
    const b = Math.floor(220 + 35 * normalizedAlpha);

    return `rgb(${r}, ${g}, ${b})`;
  };

  // Determine line visibility based on orientation
  const shouldShowLine = (index: number, isHorizontal: boolean) => {
    // Create a deterministic but seemingly random pattern based on orientation
    const seed = isHorizontal
      ? (orientation.beta + orientation.gamma + index * 7) % 360
      : (orientation.alpha + orientation.gamma - index * 13) % 360;

    // Use different orientation angles to affect different lines
    if (isHorizontal) {
      // Horizontal lines visibility changes with beta (tilt forward/backward)
      return Math.abs((seed + orientation.beta) % 17) > 5;
    } else {
      // Vertical lines visibility changes with gamma (tilt left/right)
      return Math.abs((seed + orientation.gamma) % 19) > 6;
    }
  };

  // Generate hologram grid lines that appear/disappear based on rotation
  const generateHologramLines = () => {
    const lines = [];

    for (let i = 0; i < lineCount; i++) {
      // Determine if this line should be visible based on current orientation
      const showHLine = shouldShowLine(i, true);
      const showVLine = shouldShowLine(i, false);

      // Base opacity that will be controlled by orientation
      const hOpacity = showHLine ? 0.7 : 0;
      const vOpacity = showVLine ? 0.7 : 0;

      // Horizontal line
      lines.push(
        <div
          key={`h-line-${i}`}
          className="absolute w-full h-px"
          style={{
            top: `${(i * 100) / lineCount}%`,
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            opacity: hOpacity,
            boxShadow: `0px 0px 4px rgba(120, 220, 255, ${hOpacity})`,
            transition: "opacity 0.15s ease-out",
          }}
        />
      );

      // Vertical line
      lines.push(
        <div
          key={`v-line-${i}`}
          className="absolute h-full w-px"
          style={{
            left: `${(i * 100) / lineCount}%`,
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            opacity: vOpacity,
            boxShadow: `0px 0px 4px rgba(120, 220, 255, ${vOpacity})`,
            transition: "opacity 0.15s ease-out",
          }}
        />
      );
    }

    return lines;
  };

  // Mouse/touch fallback for desktop testing
  const handleMouseMove = (e: MouseEvent) => {
    if (!isSupported) {
      const x = (e.clientX / window.innerWidth) * 180 - 90;
      const y = (e.clientY / window.innerHeight) * 180 - 90;

      setOrientation({
        alpha: x + y,
        beta: y,
        gamma: x,
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full p-4">
      <div
        className="relative w-64 h-64 rounded-md overflow-hidden shadow-lg"
        style={{
          background: getHologramColor(),
          transition: "background-color 0.1s ease",
          boxShadow: `0 0 20px ${getHologramColor()}`,
        }}
        onMouseMove={handleMouseMove}
        onTouchMove={(e) => {
          const touch = e.touches[0];
          handleMouseMove({
            clientX: touch.clientX,
            clientY: touch.clientY,
          } as MouseEvent);
        }}
      >
        {/* Hologram grid effect with rotation-based visibility */}
        {generateHologramLines()}

        {/* Main content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-xl font-bold tracking-wider opacity-90 select-none transform">
            HOLOGRAM
          </div>
        </div>

        {/* Glare effect */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `linear-gradient(
              ${135 + orientation.gamma}deg, 
              rgba(255, 255, 255, 0.5) 0%, 
              rgba(255, 255, 255, 0) 50%
            )`,
          }}
        />

        {/* Scan line effect */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "repeating-linear-gradient(transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)",
            opacity: 0.3,
          }}
        />
      </div>

      {/* Permission container for iOS */}
      <div id="permission-container" className="mt-2"></div>

      {/* Display orientation values */}
      <div className="mt-4 text-center">
        {!isSupported ? (
          <p className="text-red-500">
            DeviceOrientation not supported. Use mouse/touch instead.
          </p>
        ) : (
          <div className="text-sm text-gray-700">
            <p>Alpha: {orientation.alpha.toFixed(1)}°</p>
            <p>Beta: {orientation.beta.toFixed(1)}°</p>
            <p>Gamma: {orientation.gamma.toFixed(1)}°</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HologramEffect;
