import { AppBar, Toolbar, Typography } from '@mui/material'

export default function AppHeader() {
  return (
    <AppBar
      position="static"
      color="inherit"
      elevation={0}
      sx={{ borderBottom: 1, borderColor: 'divider' }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography
          component="a"
          href="/"
          variant="h6"
          color="primary"
          sx={{ textDecoration: 'none', fontWeight: 700 }}
        >
          BookKeeper
        </Typography>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ display: { xs: 'none', sm: 'block' } }}
        >
          Inventory workspace
        </Typography>
      </Toolbar>
    </AppBar>
  )
}
