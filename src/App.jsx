import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Alert,
  AppBar,
  Box,
  Button,
  ButtonGroup,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material'
import { booksApi } from './api/books'

const emptyForm = { title: '', author: '', price: '', unitsInStock: '0' }
const pageSize = 10

export default function App() {
  const [books, setBooks] = useState([])
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [editor, setEditor] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [removing, setRemoving] = useState(null)
  const [busy, setBusy] = useState(false)
  const mutationLock = useRef(false)
  const requestId = useRef(0)

  const load = useCallback(async () => {
    const id = ++requestId.current
    setLoading(true)
    setError('')
    try {
      const result = await booksApi.search({
        page,
        pageSize,
        ...(search ? { title: search } : {}),
      })
      if (id !== requestId.current) return
      if (page > 0 && result.content.length === 0) {
        setPage(page - 1)
        return
      }
      setBooks(result.content)
      setTotal(result.totalElements)
    } catch (err) {
      if (id === requestId.current) setError(err.message)
    } finally {
      if (id === requestId.current) setLoading(false)
    }
  }, [page, search])
  const invalidateRequest = useCallback(() => {
    requestId.current++
  }, [])
  useEffect(() => {
    // Fetching a remote page requires a loading state before the request settles.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
    return invalidateRequest
  }, [load, invalidateRequest])

  function openEditor(book = null) {
    setForm(
      book
        ? {
            title: book.title,
            author: book.author,
            price: String(book.price),
            unitsInStock: String(book.unitsInStock),
          }
        : emptyForm,
    )
    setFormError('')
    setEditor(book ? { id: book.id } : {})
  }

  async function mutate(action, message, close) {
    if (mutationLock.current) return
    mutationLock.current = true
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await action()
      close?.()
      setNotice(message)
      await load()
    } catch (err) {
      if (editor) setFormError(err.message)
      else setError(err.message)
    } finally {
      mutationLock.current = false
      setBusy(false)
    }
  }

  function save(event) {
    event.preventDefault()
    const values = {
      title: form.title.trim(),
      author: form.author.trim(),
      price: Number(form.price),
      unitsInStock: Number(form.unitsInStock),
    }
    if (
      !values.title ||
      !values.author ||
      form.price === '' ||
      !Number.isFinite(values.price) ||
      values.price < 0.01 ||
      form.unitsInStock === '' ||
      !Number.isInteger(values.unitsInStock) ||
      values.unitsInStock < 0 ||
      values.unitsInStock > 2147483647
    ) {
      setFormError(
        'Enter a title, author, a price of at least 0.01, and a whole-number quantity from 0 to 2,147,483,647.',
      )
      return
    }
    mutate(
      () =>
        editor.id
          ? booksApi.update(editor.id, values)
          : booksApi.create(values),
      editor.id ? 'Book updated.' : 'Book added to your catalog.',
      () => setEditor(null),
    )
  }

  function changeQuantity(book, delta) {
    const quantity = book.unitsInStock + delta
    if (quantity < 0 || quantity > 2147483647) return
    mutate(
      () =>
        booksApi.update(book.id, {
          title: book.title,
          author: book.author,
          price: book.price,
          unitsInStock: quantity,
        }),
      `Quantity updated for “${book.title}”.`,
    )
  }

  const closeEditor = () => !busy && setEditor(null)
  const closeRemoval = () => !busy && setRemoving(null)
  const emptyTitle = error
    ? 'Catalog unavailable'
    : search
      ? 'No matching titles'
      : 'Your next chapter starts here'

  return (
    <>
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
            bookkeeper.
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
              onClick={() => openEditor()}
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
                <Button onClick={load} disabled={loading || busy}>
                  Try again
                </Button>
              }
            >
              {error}
            </Alert>
          )}
          <Paper
            component="section"
            variant="outlined"
            aria-label="Book catalog"
            sx={{ overflow: 'hidden' }}
          >
            <Stack spacing={2} sx={{ p: 3 }}>
              <Stack
                direction="row"
                sx={{ justifyContent: 'space-between', alignItems: 'center' }}
                spacing={2}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography component="h2" variant="h6">
                    All books <Chip size="small" label={error ? '—' : total} />
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ overflowWrap: 'anywhere' }}
                  >
                    {search
                      ? `Results for “${search}”`
                      : 'Manage your titles and available quantities.'}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  onClick={load}
                  disabled={loading || busy}
                >
                  Refresh
                </Button>
              </Stack>
              <Stack
                component="form"
                role="search"
                direction="row"
                spacing={1}
                onSubmit={(e) => {
                  e.preventDefault()
                  setPage(0)
                  setSearch(query.trim())
                }}
              >
                <TextField
                  size="small"
                  fullWidth
                  label="Search by book title"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  slotProps={{ htmlInput: { maxLength: 200 } }}
                />
                <Button type="submit" disabled={busy}>
                  Search
                </Button>
                {search && (
                  <Button
                    onClick={() => {
                      setQuery('')
                      setSearch('')
                      setPage(0)
                    }}
                  >
                    Clear
                  </Button>
                )}
              </Stack>
            </Stack>
            <TableContainer>
              <Table aria-label="Books" sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    {[
                      'Book title',
                      'Price',
                      'Quantity',
                      'Status',
                      'Actions',
                    ].map((label) => (
                      <TableCell key={label}>{label}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading || error || !books.length ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Stack
                          spacing={2}
                          sx={{ py: 6, alignItems: 'center' }}
                          role={loading ? 'status' : undefined}
                        >
                          {loading ? (
                            <>
                              <CircularProgress size={28} />
                              <Typography>Loading your books…</Typography>
                            </>
                          ) : (
                            <>
                              <Typography component="h3" variant="h6">
                                {emptyTitle}
                              </Typography>
                              <Typography color="text.secondary">
                                {error
                                  ? 'Please try refreshing your books.'
                                  : search
                                    ? 'Try another title or clear your search.'
                                    : 'Add your first book to start building your catalog.'}
                              </Typography>
                              {!error && !search && (
                                <Button
                                  variant="outlined"
                                  onClick={() => openEditor()}
                                >
                                  Add your first book
                                </Button>
                              )}
                            </>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ) : (
                    books.map((book) => (
                      <TableRow key={book.id} hover>
                        <TableCell
                          component="th"
                          scope="row"
                          sx={{ maxWidth: 320, overflowWrap: 'anywhere' }}
                        >
                          <Typography sx={{ fontWeight: 600 }}>{book.title}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {book.author}
                          </Typography>
                        </TableCell>
                        <TableCell>{Number(book.price).toFixed(2)}</TableCell>
                        <TableCell>
                          <ButtonGroup
                            size="small"
                            aria-label={`Quantity for ${book.title}`}
                          >
                            <Button
                              aria-label={`Reduce quantity of ${book.title}`}
                              disabled={busy || book.unitsInStock <= 0}
                              onClick={() => changeQuantity(book, -1)}
                            >
                              −
                            </Button>
                            <Box
                              component="span"
                              aria-label={`${book.unitsInStock} copies`}
                              sx={{
                                minWidth: 40,
                                px: 1,
                                display: 'grid',
                                placeItems: 'center',
                                borderBlock: 1,
                                borderColor: 'primary.main',
                              }}
                            >
                              {book.unitsInStock}
                            </Box>
                            <Button
                              aria-label={`Increase quantity of ${book.title}`}
                              disabled={busy || book.unitsInStock >= 2147483647}
                              onClick={() => changeQuantity(book, 1)}
                            >
                              ＋
                            </Button>
                          </ButtonGroup>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            variant="outlined"
                            color={
                              book.unitsInStock === 0 ? 'default' : 'success'
                            }
                            label={
                              book.unitsInStock === 0
                                ? 'Out of stock'
                                : 'In stock'
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Button
                              size="small"
                              onClick={() => openEditor(book)}
                              disabled={busy}
                            >
                              Edit
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              onClick={() => setRemoving(book)}
                              disabled={busy || book.unitsInStock !== 0}
                              title={
                                book.unitsInStock
                                  ? 'Only books with zero quantity can be removed'
                                  : 'Remove book'
                              }
                            >
                              Remove
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={error ? 0 : total}
              page={page}
              rowsPerPage={pageSize}
              rowsPerPageOptions={[pageSize]}
              onPageChange={(_, nextPage) => setPage(nextPage)}
              disabled={loading || busy || !!error}
            />
          </Paper>
          <Typography variant="body2" color="text.secondary">
            Books can be removed when their quantity reaches zero.
          </Typography>
        </Stack>
      </Container>
      <Dialog
        open={editor !== null}
        onClose={closeEditor}
        fullWidth
        maxWidth="sm"
        aria-labelledby="editor-title"
      >
        <Box component="form" onSubmit={save}>
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
                  max: 2147483647,
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
            <Button onClick={closeEditor} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={busy}>
              {busy ? 'Saving…' : editor?.id ? 'Save changes' : 'Add book'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
      <Dialog
        open={removing !== null}
        onClose={closeRemoval}
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
          <Button onClick={closeRemoval} disabled={busy}>
            Keep book
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={busy}
            onClick={() =>
              removing?.unitsInStock === 0 &&
              mutate(
                () => booksApi.remove(removing.id),
                'Book removed.',
                () => setRemoving(null),
              )
            }
          >
            {busy ? 'Removing…' : 'Remove book'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
