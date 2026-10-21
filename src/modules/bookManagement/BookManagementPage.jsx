import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import BookCatalog from './components/BookCatalog'
import BookFormDialog from './components/BookFormDialog'
import RemoveBookDialog from './components/RemoveBookDialog'
import { useBookManagement } from './hooks/useBookManagement'

export default function BookManagementPage() {
  const management = useBookManagement()
  const {
    busy,
    notice,
    setNotice,
    error,
    removing,
    loadBooks,
    loading,
    openBookForm,
    catalogProps,
    formDialogProps,
    removalDialogProps,
  } = management
  return (
    <>
      <Container component="main" maxWidth="lg" sx={{ py: { xs: 3, sm: 6 } }}>
        <Stack spacing={3}>
          <Stack
            direction="row"
            sx={{ justifyContent: 'space-between', alignItems: 'center' }}
            spacing={2}
          >
            <Box>
              <Typography component="h1" variant="h4">
                Book management
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                A little less admin. A little more room for books.
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={() => openBookForm()}
              disabled={busy}
              sx={{ flexShrink: 0 }}
            >
              Add book
            </Button>
          </Stack>
          <Paper variant="outlined" sx={{ p: 3, bgcolor: 'primary.light' }}>
            <Typography variant="h6">A home for every title.</Typography>
            <Typography variant="body2">
              Add books, keep stock up to date, and make your catalog easy to
              manage.
            </Typography>
          </Paper>
          {notice && (
            <Alert
              severity="success"
              role="status"
              onClose={() => setNotice('')}
            >
              {notice}
            </Alert>
          )}
          {error && !removing && (
            <Alert
              severity="error"
              action={
                <Button onClick={loadBooks} disabled={loading || busy}>
                  Try again
                </Button>
              }
            >
              {error}
            </Alert>
          )}

          <BookCatalog {...catalogProps} />
          <Typography variant="body2" color="text.secondary">
            Books can be removed when their quantity reaches zero.
          </Typography>
        </Stack>
      </Container>

      <BookFormDialog {...formDialogProps} />
      <RemoveBookDialog {...removalDialogProps} />
    </>
  )
}
