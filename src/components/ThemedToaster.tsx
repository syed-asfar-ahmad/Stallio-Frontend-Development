import { Toaster } from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';export default function ThemedToaster() {
  const { resolved } = useTheme();
  const isDark = resolved === 'dark';

  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 4000,
        style: isDark
          ? {
              background: '#18181b',
              color: '#fafafa',
              border: '1px solid rgb(63 63 70)',
              boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)',
            }
          : {
              background: '#ffffff',
              color: '#1c1917',
              border: '1px solid #e7e5e4',
              boxShadow: '0 10px 40px -10px rgba(0,0,0,0.12)',
            },
      }}
    />
  );
}
