import './globals.css';
import { Toaster } from 'react-hot-toast';
import { siteMetadata } from './shared-metadata';

export const metadata = siteMetadata;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              background: 'var(--background)',
              color: 'var(--foreground)',
              border: '1px solid rgba(var(--foreground-rgb), 0.1)',
            },
          }} 
        />
        {children}
      </body>
    </html>
  );
}