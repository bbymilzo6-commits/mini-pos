'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  // อ่านค่าธีมที่ตั้งไว้แล้วบน <html> (ตั้งค่าล่วงหน้าโดย script ใน layout.js)
  // เพื่อไม่ให้หน้าจอกระพริบสลับสีตอนโหลด
  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    setTheme(current);
  }, []);

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('mini-pos-theme', next);
    } catch (e) {
      // localStorage อาจใช้ไม่ได้ในบางเบราว์เซอร์ ไม่เป็นไร ธีมจะรีเซ็ตเมื่อโหลดหน้าใหม่
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
