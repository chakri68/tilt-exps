"use client";

import React, { useState, useEffect } from "react";

const HologramEffect = () => {
  const [orientation, setOrientation] = useState({
    alpha: 0,
    beta: 0,
    gamma: 0,
  });
  const [isSupported, setIsSupported] = useState(true);
  const [flickerStates, setFlickerStates] = useState<
    { opacity: number; intensity: number }[]
  >([]);
  const [flickerTimestamp, setFlickerTimestamp] = useState(0);

  useEffect(() => {
    // Initialize flicker states for lines
    const lineCount = 20;
    const initialFlickerStates = Array(lineCount * 2)
      .fill(0)
      .map(() => ({
        opacity: Math.random() * 0.5 + 0.3,
        intensity: Math.random(),
      }));
    setFlickerStates(initialFlickerStates);

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

    // Set up flickering animation
    const flickerInterval = setInterval(() => {
      setFlickerTimestamp(Date.now());
    }, 50); // Update flicker effect every 50ms

    // Cleanup
    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
      clearInterval(flickerInterval);
    };
  }, []);

  // Update flicker states when timestamp changes
  useEffect(() => {
    if (flickerTimestamp === 0) return;

    setFlickerStates((prevStates) =>
      prevStates.map((state) => {
        // Randomly decide if this line should change its flicker state
        if (Math.random() < 0.2) {
          return {
            opacity: Math.random() * 0.5 + 0.3,
            intensity: Math.random(),
          };
        }
        return state;
      })
    );
  }, [flickerTimestamp]);

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

  // Generate hologram grid lines with flickering effect
  const generateHologramLines = () => {
    const lines = [];
    const lineCount = 20;

    for (let i = 0; i < lineCount; i++) {
      // Get flicker state for this line
      const hFlickerState = flickerStates[i] || {
        opacity: 0.5,
        intensity: 0.5,
      };
      const vFlickerState = flickerStates[i + lineCount] || {
        opacity: 0.5,
        intensity: 0.5,
      };

      // Horizontal line with flicker
      lines.push(
        <div
          key={`h-line-${i}`}
          className="absolute w-full h-px"
          style={{
            top: `${(i * 100) / lineCount}%`,
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            opacity: hFlickerState.opacity,
            boxShadow: `0px 0px ${
              4 + hFlickerState.intensity * 3
            }px rgba(120, 220, 255, ${0.6 + hFlickerState.intensity * 0.4})`,
            transition: "opacity 0.05s ease, box-shadow 0.05s ease",
          }}
        />
      );

      // Vertical line with flicker
      lines.push(
        <div
          key={`v-line-${i}`}
          className="absolute h-full w-px"
          style={{
            left: `${(i * 100) / lineCount}%`,
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            opacity: vFlickerState.opacity,
            boxShadow: `0px 0px ${
              4 + vFlickerState.intensity * 3
            }px rgba(120, 220, 255, ${0.6 + vFlickerState.intensity * 0.4})`,
            transition: "opacity 0.05s ease, box-shadow 0.05s ease",
          }}
        />
      );
    }

    return lines;
  };

  // Random glitch effect
  const getGlitchEffect = () => {
    // Randomly create a glitch effect
    if (Math.random() < 0.05) {
      const glitchX = Math.random() < 0.5 ? "-2px" : "2px";
      return {
        transform: `translateX(${glitchX})`,
        opacity: Math.random() * 0.4 + 0.6,
      };
    }
    return {};
  };

  // Mouse/touch fallback for desktop testing
  const handleMouseMove = (e: { clientX: number; clientY: number }) => {
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
          handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
        }}
      >
        {/* Hologram grid effect with flickering */}
        {generateHologramLines()}

        {/* Main content with occasional glitch */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={getGlitchEffect()}
        >
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
