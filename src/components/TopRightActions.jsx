import { useState, useEffect, useRef } from 'react';
import './TopRightActions.css';

export default function TopRightActions() {
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef(null);
  const userPausedRef = useRef(false);

  const getAudio = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/music.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.15;
      audioRef.current.muted = false;
      // preload='none' — don't fetch the 2.3MB mp3 until the user
      // actually interacts. Saves bandwidth for visitors who bounce.
      audioRef.current.preload = 'none';
    }
    return audioRef.current;
  };

  useEffect(() => {
    const audio = getAudio();

    const startMusic = () => {
      if (userPausedRef.current || !audio.paused) return;
      audio.muted = false;
      audio.play().then(() => {
        setIsMuted(false);
      }).catch(() => {
        // Autoplay blocked or fetch failed — stay muted, no error UI
        setIsMuted(true);
      });
    };

    // Single listener, fires once on the first user interaction of any
    // kind, then removes itself. Previously this attached FOUR separate
    // capture-mode listeners (pointerdown + click + keydown + touchstart)
    // that all fired on every interaction — overkill and noisy.
    //
    // pointerdown covers mouse + touch + pen in one event. The { once: true }
    // option auto-removes the listener after the first fire, so we don't
    // need manual removeEventListener bookkeeping.
    //
    // We skip the sound button itself so clicking mute doesn't double-fire
    // (the toggleSound handler manages play/pause on its own).
    const handleFirstInteraction = (event) => {
      if (event.target?.closest?.('.sound-btn')) return;
      startMusic();
    };

    // Try once immediately (will fail silently if autoplay is blocked,
    // which is the expected behavior on all modern browsers without
    // prior user interaction — the listener below handles the real start).
    startMusic();
    window.addEventListener('pointerdown', handleFirstInteraction, {
      capture: true,
      passive: true,
      once: true,
    });

    return () => {
      // { once: true } means the listener auto-removed itself if it fired,
      // but if the component unmounts before any interaction we still
      // need to clean up. removeEventListener is a no-op if already removed.
      window.removeEventListener('pointerdown', handleFirstInteraction, true);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const handleGetInTouch = (e) => {
    e.stopPropagation();
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleSound = (e) => {
    e.stopPropagation(); // prevent global interaction handler from overriding toggle
    const audio = getAudio();

    if (audio.paused) {
      userPausedRef.current = false;
      audio.muted = false;
      audio.play().then(() => {
        setIsMuted(false);
      }).catch(() => {
        setIsMuted(true);
      });
    } else {
      userPausedRef.current = true;
      audio.pause();
      setIsMuted(true);
    }
  };

  return (
    <div className="top-right-actions">
      <button className="get-in-touch-btn" onClick={handleGetInTouch}>
        Get In Touch
      </button>
      <button className="sound-btn" onClick={toggleSound} aria-label={isMuted ? "Unmute" : "Mute"}>
        <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          {isMuted ? (
            <>
              <path d="M13.5 3C14.3284 3 15 3.67157 15 4.5V19.5C15 20.3284 14.3284 21 13.5 21C13.208 21 12.9248 20.9163 12.6841 20.7606L7.20239 17.2144C6.5492 16.7918 5.7925 16.5 5 16.5H4C2.89543 16.5 2 15.6046 2 14.5V9.5C2 8.39543 2.89543 7.5 4 7.5H5C5.7925 7.5 6.5492 7.2082 7.20239 6.78564L12.6841 3.2394C12.9248 3.08365 13.208 3 13.5 3Z" />
              <path d="M18.5 9L23.5 14M23.5 9L18.5 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </>
          ) : (
            <path d="M13.5 3C14.3284 3 15 3.67157 15 4.5V19.5C15 20.3284 14.3284 21 13.5 21C13.208 21 12.9248 20.9163 12.6841 20.7606L7.20239 17.2144C6.5492 16.7918 5.7925 16.5 5 16.5H4C2.89543 16.5 2 15.6046 2 14.5V9.5C2 8.39543 2.89543 7.5 4 7.5H5C5.7925 7.5 6.5492 7.2082 7.20239 6.78564L12.6841 3.2394C12.9248 3.08365 13.208 3 13.5 3Z" />
          )}
        </svg>
      </button>
    </div>
  );
}
