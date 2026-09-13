import './globals.css';
import { ThemeProvider } from './components/ThemeProvider';
import Navbar from './components/Navbar';

export const metadata = {
  title: 'Mini POS',
  description: 'ระบบขายของสำหรับร้านเล็ก',
};

// ตั้งค่าธีม (สว่าง/มืด) ก่อนหน้าเว็บ render เพื่อไม่ให้จอกระพริบสลับสี
const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem('mini-pos-theme');
    var theme = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ThemeProvider>
          <Navbar />
          <main className="container">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
