import { MAX_BOOK_QUANTITY } from '../constants'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material'

export default function BookFormDialog({
  editor,
  closeBookForm,
  submitBookForm,
  formError,
  busy,
  form,
  setForm,
}) {
  return (
    <Dialog
      open={editor !== null}
      onClose={closeBookForm}
      fullWidth
      maxWidth="sm"
      aria-labelledby="editor-title"
    >
      <Box component="form" onSubmit={submitBookForm}>
        <DialogTitle id="editor-title">
          {editor?.id ? 'Edit book' : 'Add a book'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            {[
              { name: 'title', label: 'Book title', maxLength: 200 },
              { name: 'author', label: 'Author', maxLength: 150 },
              {
                name: 'price',
                label: 'Price',
                type: 'number',
                min: 0.01,
                step: 0.01,
              },
              {
                name: 'unitsInStock',
                label: 'Quantity',
                type: 'number',
                min: 0,
                max: MAX_BOOK_QUANTITY,
                step: 1,
              },
            ].map(({ name, label, type = 'text', ...limits }) => (
              <TextField
                key={name}
                id={`book-${name}`}
                label={label}
                type={type}
                required
                fullWidth
                autoFocus={name === 'title'}
                disabled={busy}
                value={form[name]}
                onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                slotProps={{ htmlInput: { ...limits, 'aria-label': label } }}
                helperText={
                  name === 'unitsInStock'
                    ? 'Quantity must be a whole number, zero or greater.'
                    : undefined
                }
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeBookForm} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={busy}>
            {busy ? 'Saving…' : editor?.id ? 'Save changes' : 'Add book'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}
