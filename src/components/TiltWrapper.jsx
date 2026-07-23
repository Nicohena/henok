import { useRef } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

/**
 * TiltWrapper — applies a 3D parallax tilt to its children based on
 * mouse position. Extracted from the old TiltedCard component, which
 * carried 80+ lines of dead image/tooltip/caption code that was never
 * used (MainScene only ever passed overlayContent, never imageSrc).
 *
 * Props:
 *   - children: the content to tilt (rendered inside the tilting layer)
 *   - containerWidth / containerHeight: outer dimensions
 *   - scaleOnHover: scale factor applied on hover (default 1.1)
 *   - rotateAmplitude: max rotation in degrees (default 14)
 *   - className: optional extra classes on the outer figure
 *
 * Disabled entirely when prefers-reduced-motion is set.
 */
export default function TiltWrapper({
  children,
  containerWidth = '100%',
  containerHeight = '300px',
  scaleOnHover = 1.1,
  rotateAmplitude = 14,
  className = ''
}) {
  const ref = useRef(null);
  const cardRef = useRef(null);
  const reduceMotion = useReducedMotion();

  function handleMouse(e) {
    if (reduceMotion || !ref.current || !cardRef.current) return;

    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;

    const rotationX = (offsetY / (rect.height / 2)) * -rotateAmplitude;
    const rotationY = (offsetX / (rect.width / 2)) * rotateAmplitude;

    cardRef.current.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg) scale(${scaleOnHover})`;
  }

  function handleMouseEnter() {
    if (reduceMotion || !cardRef.current) return;
    cardRef.current.style.transform = `scale(${scaleOnHover})`;
  }

  function handleMouseLeave() {
    if (reduceMotion || !cardRef.current) return;
    cardRef.current.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
  }

  return (
    <figure
      ref={ref}
      className={`relative w-full h-full [perspective:800px] flex flex-col items-center justify-center ${className}`}
      style={{ width: containerWidth, height: containerHeight }}
      onMouseMove={handleMouse}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={cardRef}
        className="relative [transform-style:preserve-3d] w-full h-full transition-transform duration-200 ease-out will-change-transform"
      >
        <div className="absolute inset-0 z-[2] will-change-transform [transform:translateZ(30px)]">
          {children}
        </div>
      </div>
    </figure>
  );
}
