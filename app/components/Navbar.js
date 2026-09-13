'use client';

import { Store, ShoppingCart, History, Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="navbar glass">
      <div className="navbar-title">
        <Store size={20} strokeWidth={2.4} />
        <span>Mini POS</span>
      </div>

      <nav className="navbar-links">
        <a href="/">
          <Store size={16} />
          <span>หน้าแรก</span>
        </a>
        <a href="/sell">
          <ShoppingCart size={16} />
          <span>ขายสินค้า</span>
        </a>
        <a href="/history">
          <History size={16} />
          <span>ประวัติ</span>
        </a>
      </nav>

      <button
        type="button"
        className="icon-btn theme-toggle"
        onClick={toggleTheme}
        aria-label="สลับโหมดสว่าง/มืด"
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </header>
  );
}
