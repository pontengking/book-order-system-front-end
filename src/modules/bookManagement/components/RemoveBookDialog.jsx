import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'

export default function RemoveBookDialog({
  removing,
  closeRemoveBookDialog,
  error,
  busy,
  confirmBookRemoval,
}) {
  return (
    <Dialog
      open={removing !== null}
      onClose={closeRemoveBookDialog}
      fullWidth
      maxWidth="xs"
      aria-labelledby="removal-title"
      aria-describedby="removal-description"
    >
      <DialogTitle id="removal-title">Remove book?</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <DialogContentText id="removal-description">
          “{removing?.title}” has no remaining stock. Removing it will
          permanently delete it from your catalog.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeRemoveBookDialog} disabled={busy}>
          Keep book
        </Button>
        <Button
          color="error"
          variant="contained"
          disabled={busy}
          onClick={confirmBookRemoval}
        >
          {busy ? 'Removing…' : 'Remove book'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
