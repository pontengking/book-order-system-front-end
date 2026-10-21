import { useCallback, useEffect, useRef, useState } from 'react'
import { bookService } from '../services/bookService'
import { BOOK_PAGE_SIZE, MAX_BOOK_QUANTITY } from '../constants'
import {
  createBookForm,
  toBookPayload,
  validateBookForm,
} from '../utils/bookForm'

export function useBookManagement() {
  const [books, setBooks] = useState([])
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [editor, setEditor] = useState(null)
  const [form, setForm] = useState(createBookForm)
  const [formError, setFormError] = useState('')
  const [removing, setRemoving] = useState(null)
  const [busy, setBusy] = useState(false)
  const mutationLock = useRef(false)
  const requestId = useRef(0)

  const loadBooks = useCallback(async () => {
    const id = ++requestId.current
    setLoading(true)
    setError('')
    try {
      const result = await bookService.search({
        page,
        pageSize: BOOK_PAGE_SIZE,
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
  const ignorePendingBookResponses = useCallback(() => {
    requestId.current++
  }, [])

  useEffect(() => {
    // Fetching a remote page requires a loading state before the request settles.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadBooks()
    // Ignore responses from the previous search/page or an unmounted component.
    return ignorePendingBookResponses
  }, [loadBooks, ignorePendingBookResponses])

  function openBookForm(book = null) {
    setForm(createBookForm(book))
    setFormError('')
    setEditor(book ? { id: book.id } : {})
  }

  // Prevent overlapping writes, show the outcome, and refresh the catalog.
  async function runBookAction(bookAction, successMessage, closeDialog) {
    if (mutationLock.current) return
    mutationLock.current = true
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await bookAction()
      closeDialog?.()
      setNotice(successMessage)
      await loadBooks()
    } catch (err) {
      if (editor) setFormError(err.message)
      else setError(err.message)
    } finally {
      mutationLock.current = false
      setBusy(false)
    }
  }

  function submitBookForm(event) {
    event.preventDefault()
    const values = toBookPayload(form)
    const validationError = validateBookForm(form)
    if (validationError) {
      setFormError(validationError)
      return
    }
    runBookAction(
      () =>
        editor.id
          ? bookService.update(editor.id, values)
          : bookService.create(values),
      editor.id ? 'Book updated.' : 'Book added to your catalog.',
      () => setEditor(null),
    )
  }

  function changeBookStock(book, quantityChange) {
    const quantity = book.unitsInStock + quantityChange
    if (quantity < 0 || quantity > MAX_BOOK_QUANTITY) return
    runBookAction(
      () =>
        bookService.update(book.id, {
          title: book.title,
          author: book.author,
          price: book.price,
          unitsInStock: quantity,
        }),
      `Quantity updated for “${book.title}”.`,
    )
  }

  function closeBookForm() {
    if (busy) return
    setEditor(null)
  }

  function closeRemoveBookDialog() {
    if (busy) return
    setRemoving(null)
  }

  function confirmBookRemoval() {
    if (removing?.unitsInStock !== 0) return
    return runBookAction(
      () => bookService.remove(removing.id),
      'Book removed.',
      () => setRemoving(null),
    )
  }

  return {
    busy,
    notice,
    setNotice,
    error,
    removing,
    loadBooks,
    loading,
    openBookForm,
    catalogProps: {
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
    },
    formDialogProps: {
      editor,
      closeBookForm,
      submitBookForm,
      formError,
      busy,
      form,
      setForm,
    },
    removalDialogProps: {
      removing,
      closeRemoveBookDialog,
      error,
      busy,
      confirmBookRemoval,
    },
  }
}
