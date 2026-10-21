import {
  Box,
  Button,
  ButtonGroup,
  Chip,
  Stack,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material'
import { MAX_BOOK_QUANTITY } from '../constants'

export default function BookRow({
  book,
  busy,
  openBookForm,
  changeBookStock,
  setRemoving,
}) {
  return (

    <TableRow hover>
      <TableCell
        component="th"
        scope="row"
        sx={{ maxWidth: 320, overflowWrap: 'anywhere' }}
      >
          {/*<Typography sx={{ fontWeight: 600 }}>*/}
          {/*    {*/}
          {/*        columnNumber ===  0 ? <>ok</>: <>not ok</>*/}
          {/*    }*/}
          {/*</Typography>*/}

        <Typography sx={{ fontWeight: 600 }}>{book.title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {book.author}
        </Typography>
      </TableCell>
      <TableCell>{Number(book.price).toFixed(2)}</TableCell>
      <TableCell>
        <ButtonGroup size="small" aria-label={`Quantity for ${book.title}`}>
          <Button
            aria-label={`Reduce quantity of ${book.title}`}
            disabled={busy || book.unitsInStock <= 0}
            onClick={() => changeBookStock(book, -1)}
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
            disabled={busy || book.unitsInStock >= MAX_BOOK_QUANTITY}
            onClick={() => changeBookStock(book, 1)}
          >
            ＋
          </Button>
        </ButtonGroup>
      </TableCell>
      <TableCell>
        <Chip
          size="small"
          variant="outlined"
          color={book.unitsInStock === 0 ? 'default' : 'success'}
          label={book.unitsInStock === 0 ? 'Out of stock' : 'In stock'}
        />
      </TableCell>
      <TableCell>
        <Stack direction="row" spacing={1}>
          <Button size="small" onClick={() => openBookForm(book)} disabled={busy}>
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
  )
}
