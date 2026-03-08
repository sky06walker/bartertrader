import { useState, useEffect } from 'react';
import './Toast.css';

export default function Toast({ message, onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast-notification ${visible ? 'show' : 'hide'}`}>
      <span className="toast-icon">✓</span>
      {message}
    </div>
  );
}
