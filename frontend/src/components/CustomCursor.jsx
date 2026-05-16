import React, { useEffect, useState } from 'react';

const INTERACTIVE_SELECTOR = 'a, button, input, textarea, select, [role="button"], .product-card, .latest-product-orbit-card';

const CustomCursor = () => {
  const [enabled, setEnabled] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    const canUseCustomCursor = window.matchMedia('(pointer: fine)').matches;
    if (!canUseCustomCursor) return undefined;

    setEnabled(true);
    document.body.classList.add('custom-cursor-enabled');

    const handleMove = (event) => {
      setPosition({ x: event.clientX, y: event.clientY });
      setVisible(true);
      setHovering(event.target instanceof Element && Boolean(event.target.closest(INTERACTIVE_SELECTOR)));
    };

    const handleLeave = () => setVisible(false);
    const handleEnter = () => setVisible(true);
    const handleDown = () => setPressed(true);
    const handleUp = () => setPressed(false);

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseenter', handleEnter);
    window.addEventListener('mouseleave', handleLeave);
    window.addEventListener('mousedown', handleDown);
    window.addEventListener('mouseup', handleUp);

    return () => {
      document.body.classList.remove('custom-cursor-enabled');
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseenter', handleEnter);
      window.removeEventListener('mouseleave', handleLeave);
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mouseup', handleUp);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      className={`custom-cursor ${visible ? 'is-visible' : ''} ${hovering ? 'is-hovering' : ''} ${pressed ? 'is-pressed' : ''}`}
      style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, -50%)` }}
      aria-hidden="true"
    >
      <span className="custom-cursor-dot" />
    </div>
  );
};

export default CustomCursor;
