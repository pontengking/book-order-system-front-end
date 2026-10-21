import { MAX_BOOK_QUANTITY } from '../constants'

export function createBookForm(book) {
  return {
    title: book?.title ?? '',
    author: book?.author ?? '',
    price: book ? String(book.price) : '',
    unitsInStock: book ? String(book.unitsInStock) : '0',
  }
}

export function toBookPayload(form) {
  return {
    title: form.title.trim(),
    author: form.author.trim(),
    price: Number(form.price),
    unitsInStock: Number(form.unitsInStock),
  }
}

export function validateBookForm(form) {
  const values = toBookPayload(form)
  if (
    !values.title ||
    !values.author ||
    form.price === '' ||
    !Number.isFinite(values.price) ||
    values.price < 0.01 ||
    form.unitsInStock === '' ||
    !Number.isInteger(values.unitsInStock) ||
    values.unitsInStock < 0 ||
    values.unitsInStock > MAX_BOOK_QUANTITY
  ) {
    return 'Enter a title, author, a price of at least 0.01, and a whole-number quantity from 0 to 2,147,483,647.'
  }
  return ''
}
