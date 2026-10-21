import BookRow from './BookRow'
import { BOOK_PAGE_SIZE } from '../constants'
import {
  Box,
  Button,
  Chip,
  CircularProgress,
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
  Typography,
} from '@mui/material'

export default function BookCatalog({
  books,
  page,
  setPage,
  total,
  query,
  setQuery,
  search,
  setSearch,
  loading,
  error,
  busy,
  loadBooks,
  openBookForm,
  changeBookStock,
  setRemoving,
}) {
  const emptyTitle = error
    ? 'Catalog unavailable'
    : search
      ? 'No matching titles'
      : 'Your next chapter starts here'

  return (
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
          <Button variant="outlined" onClick={loadBooks} disabled={loading || busy}>
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
              {['Book title', 'Price', 'Quantity', 'Status', 'Actions'].map(
                (label) => (
                  <TableCell key={label}>{label}</TableCell>
                ),
              )}
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
                            onClick={() => openBookForm()}
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
                <BookRow
                  key={book.id}
                  book={book}
                  busy={busy}
                  openBookForm={openBookForm}
                  changeBookStock={changeBookStock}
                  setRemoving={setRemoving}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={error ? 0 : total}
        page={page}
        rowsPerPage={BOOK_PAGE_SIZE}
        rowsPerPageOptions={[BOOK_PAGE_SIZE]}
        onPageChange={(_, nextPage) => setPage(nextPage)}
        disabled={loading || busy || !!error}
      />
    </Paper>
  )
}
