const baseUrl = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')

export async function request(
  path,
  {
    method = 'GET',
    body,
    headers,
    signal = AbortSignal.timeout(15000),
    ...options
  } = {},
) {
  let response
  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...options,
      method,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      signal,
    })
  } catch (error) {
    throw new Error(
      error.name === 'TimeoutError'
        ? 'The API took too long to respond. Please try again.'
        : 'Cannot reach the API. Check that the API is running and try again.',
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
