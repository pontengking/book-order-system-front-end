import { createTheme } from '@mui/material'

const theme = createTheme({
  palette: {
    primary: { main: '#c5681c', light: '#ebd19b' },
    background: { default: '#f8f7f5' },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: '"Segoe UI", Arial, sans-serif',
    h4: { fontFamily: 'Georgia, serif' },
    button: { textTransform: 'none' },
  },
  components: { MuiButton: { defaultProps: { disableElevation: true } } },
})

export default theme
