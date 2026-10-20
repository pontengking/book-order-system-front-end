import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material'
import App from './App.jsx'

const theme = createTheme({
  palette: {
    primary: { main: '#28523e', light: '#edf1e8' },
    background: { default: '#f7f8f5' },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: '"Segoe UI", Arial, sans-serif',
    h4: { fontFamily: 'Georgia, serif' },
    button: { textTransform: 'none' },
  },
  components: { MuiButton: { defaultProps: { disableElevation: true } } },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
)
