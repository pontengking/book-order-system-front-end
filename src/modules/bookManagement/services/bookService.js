import { request } from '../../../utils/request'

export const bookService = {
  search: async (criteria) => {
    const page = await request('/books/search', {
      method: 'POST',
      body: criteria,
    })
    // Search returns BookVO.bookId; the single-book endpoint uses BookResponse.id.
    return {
      ...page,
      content: page.content.map((book) => ({
        ...book,
        id: book.bookId ?? book.id,
      })),
    }
  },
  create: (book) => request('/books/save', { method: 'POST', body: book }),
  update: (id, book) =>
    request(`/books/${encodeURIComponent(id)}`, { method: 'PUT', body: book }),
  remove: (id) =>
    request(`/books/${encodeURIComponent(id)}`, { method: 'DELETE' }),
}
