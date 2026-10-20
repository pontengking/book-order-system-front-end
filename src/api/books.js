const baseUrl = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')

async function request(path, { method = 'GET', body } = {}) {
  let response
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: { ...(body ? { 'Content-Type': 'application/json' } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(15000),
    })
  } catch (error) {
    throw new Error(
      error.name === 'TimeoutError'
        ? 'The book service took too long to respond. Please try again.'
        : 'Cannot reach the book service. Check that the API is running and try again.',
      { cause: error },
    )
  }
  const text = await response.text()
  let result
  try {
    result = text ? JSON.parse(text) : null
  } catch {
    result = text
  }
  if (!response.ok || result?.status === 'FAIL') {
    throw new Error(
      result?.errorDesc ||
      (response.status === 401
        ? 'Authentication failed. Check the API credentials in your server configuration.'
        : `The request failed (${response.status}). Please try again.`),
    )
  }
  return result && typeof result === 'object' && 'data' in result
    ? result.data
    : result
}

export const booksApi = {
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
