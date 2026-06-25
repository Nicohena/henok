import { useRef } from 'react';

export default function TiltedCard({
  imageSrc,
  altText = 'Tilted card image',
  captionText = '',
  containerHeight = '300px',
  containerWidth = '100%',
  imageHeight = '300px',
  imageWidth = '300px',
  scaleOnHover = 1.1,
  rotateAmplitude = 14,
  showMobileWarning = true,
  showTooltip = true,
  overlayContent = null,
  displayOverlayContent = false,
  className = ''
}) {
  const ref = useRef(null);
  const cardRef = useRef(null);
  const captionRef = useRef(null);
  const lastYRef = useRef(0);

  function handleMouse(e) {
    if (!ref.current || !cardRef.current) return;

    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;

    const rotationX = (offsetY / (rect.height / 2)) * -rotateAmplitude;
    const rotationY = (offsetX / (rect.width / 2)) * rotateAmplitude;

    cardRef.current.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg) scale(${scaleOnHover})`;

    if (captionRef.current) {
      const velocityY = offsetY - lastYRef.current;
      captionRef.current.style.opacity = '1';
      captionRef.current.style.transform = `translate3d(${e.clientX - rect.left}px, ${e.clientY - rect.top}px, 0) rotate(${-velocityY * 0.6}deg)`;
      lastYRef.current = offsetY;
    }
  }

  function handleMouseEnter() {
    if (cardRef.current) {
      cardRef.current.style.transform = `scale(${scaleOnHover})`;
    }
    if (captionRef.current) {
      captionRef.current.style.opacity = '1';
    }
  }

  function handleMouseLeave() {
    lastYRef.current = 0;
    if (cardRef.current) {
      cardRef.current.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
    }
    if (captionRef.current) {
      captionRef.current.style.opacity = '0';
      captionRef.current.style.transform = 'translate3d(0, 0, 0) rotate(0deg)';
    }
  }

  return (
    <figure
      ref={ref}
      className={`relative w-full h-full [perspective:800px] flex flex-col items-center justify-center ${className}`}
      style={{
        height: containerHeight,
        width: containerWidth
      }}
      onMouseMove={handleMouse}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {showMobileWarning && (
        <div className="absolute top-4 text-center text-sm block sm:hidden">
          This effect is not optimized for mobile. Check on desktop.
        </div>
      )}

      <div
        ref={cardRef}
        className="relative [transform-style:preserve-3d] w-full h-full transition-transform duration-200 ease-out will-change-transform"
        style={{
          width: imageWidth,
          height: imageHeight,
        }}
      >
        {imageSrc && (
          <img
            src={imageSrc}
            alt={altText}
            className="absolute top-0 left-0 object-cover rounded-[15px] will-change-transform [transform:translateZ(0)] w-full h-full"
            style={{
              width: imageWidth,
              height: imageHeight
            }}
          />
        )}

        {displayOverlayContent && overlayContent && (
          <div className="absolute inset-0 z-[2] will-change-transform [transform:translateZ(30px)]">
            {overlayContent}
          </div>
        )}
      </div>

      {showTooltip && (
        <figcaption
          ref={captionRef}
          className="pointer-events-none absolute left-0 top-0 rounded-[4px] bg-white px-[10px] py-[4px] text-[10px] text-[#2d2d2d] opacity-0 z-[3] hidden sm:block transition-opacity duration-150 will-change-transform"
        >
          {captionText}
        </figcaption>
      )}
    </figure>
  );
}
