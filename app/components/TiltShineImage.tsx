import React, {
  useState,
  useEffect,
  MouseEventHandler,
  MouseEvent,
} from "react";

const HologramEffect = () => {
  const [orientation, setOrientation] = useState({
    alpha: 0,
    beta: 0,
    gamma: 0,
  });

  useEffect(() => {
    // Check if DeviceOrientationEvent is supported
    if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", handleOrientation);
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

  // Generate hologram grid lines
  const generateHologramLines = () => {
    const lines = [];
    const lineCount = 20;

    for (let i = 0; i < lineCount; i++) {
      const opacity = 0.2 + (0.8 * (i % 3)) / 3;
      lines.push(
        <div
          key={`h-line-${i}`}
          className="absolute w-full h-px"
          style={{
            top: `${(i * 100) / lineCount}%`,
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            opacity: opacity,
            boxShadow: "0px 0px 4px rgba(120, 220, 255, 0.8)",
          }}
        />
      );

      lines.push(
        <div
          key={`v-line-${i}`}
          className="absolute h-full w-px"
          style={{
            left: `${(i * 100) / lineCount}%`,
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            opacity: opacity,
            boxShadow: "0px 0px 4px rgba(120, 220, 255, 0.8)",
          }}
        />
      );
    }

    return lines;
  };

  // Mouse/touch fallback for desktop testing
  const handleMouseMove: MouseEventHandler<HTMLDivElement> = (e) => {
    const x = (e.clientX / window.innerWidth) * 180 - 90;
    const y = (e.clientY / window.innerHeight) * 180 - 90;

    setOrientation({
      alpha: x + y,
      beta: y,
      gamma: x,
    });
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
          } as MouseEvent<HTMLDivElement>);
        }}
      >
        {/* Hologram grid effect */}
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
      </div>

      {/* Permission container for iOS */}
      <div id="permission-container" className="mt-2"></div>

      {/* Display orientation values */}
      <div className="mt-4 text-center">
        <div className="text-sm text-gray-700">
          <p>Alpha: {orientation.alpha.toFixed(1)}°</p>
          <p>Beta: {orientation.beta.toFixed(1)}°</p>
          <p>Gamma: {orientation.gamma.toFixed(1)}°</p>
        </div>
      </div>
    </div>
  );
};

export default HologramEffect;
