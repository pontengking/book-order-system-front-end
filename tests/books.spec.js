import { test, expect } from '@playwright/test'

test('book lifecycle, stock boundaries, validation, search, and persistence against the live API', async ({
  page,
  request,
}) => {
  const title = `Bookkeeper verification ${Date.now()}`
  const edited = `${title} revised`
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  try {
    await page.goto('/')
    await expect(
      page.getByRole('heading', { name: 'Book management' }),
    ).toBeVisible()
    await expect(page.getByRole('alert')).toHaveCount(0)
    await page.getByRole('button', { name: 'Add book', exact: true }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByLabel('Book title', { exact: true }).fill(title)
    await dialog
      .getByLabel('Author', { exact: true })
      .fill('Verification Author')
    await dialog.getByLabel('Price', { exact: true }).fill('12.50')
    await dialog.getByLabel('Quantity', { exact: true }).fill('-1')
    await dialog.getByRole('button', { name: 'Add book', exact: true }).click()
    await expect(dialog).toBeVisible()
    expect(
      await dialog
        .getByLabel('Quantity', { exact: true })
        .evaluate((input) => input.validity.rangeUnderflow),
    ).toBe(true)
    await dialog.getByLabel('Quantity', { exact: true }).fill('1')
    await dialog.getByRole('button', { name: 'Add book', exact: true }).click()
    await expect(dialog).toBeHidden()
    await page
      .getByRole('textbox', { name: 'Search by book title' })
      .fill(title)
    await page.getByRole('button', { name: 'Search', exact: true }).click()
    let row = page.getByRole('row').filter({ hasText: title })
    await expect(row).toBeVisible()
    await expect(
      row.getByRole('button', { name: 'Remove', exact: true }),
    ).toBeDisabled()
    await row
      .getByRole('button', {
        name: `Increase quantity of ${title}`,
        exact: true,
      })
      .click()
    await expect(row.getByLabel('2 copies')).toBeVisible()
    await row
      .getByRole('button', { name: `Reduce quantity of ${title}`, exact: true })
      .click()
    await expect(row.getByLabel('1 copies')).toBeVisible()
    await row.getByRole('button', { name: 'Edit', exact: true }).click()
    await dialog.getByLabel('Book title', { exact: true }).fill(edited)
    await dialog.getByLabel('Quantity', { exact: true }).fill('0')
    await dialog.getByRole('button', { name: 'Save changes' }).click()
    await expect(dialog).toBeHidden()
    await page.reload()
    await page
      .getByRole('textbox', { name: 'Search by book title' })
      .fill(edited)
    await page.getByRole('button', { name: 'Search', exact: true }).click()
    row = page.getByRole('row').filter({ hasText: edited })
    await expect(row.getByLabel('0 copies')).toBeVisible()
    await expect(
      row.getByRole('button', {
        name: `Reduce quantity of ${edited}`,
        exact: true,
      }),
    ).toBeDisabled()
    await expect(row.getByText('Out of stock')).toBeVisible()
    await page.screenshot({
      path: 'test-results/catalog-desktop.png',
      fullPage: true,
    })
    await page.setViewportSize({ width: 390, height: 844 })
    await expect(
      page.getByRole('heading', { name: 'Book management' }),
    ).toBeVisible()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    await page.screenshot({
      path: 'test-results/catalog-mobile.png',
      fullPage: true,
    })
    await row.getByRole('button', { name: 'Remove', exact: true }).click()
    await dialog.getByRole('button', { name: 'Keep book' }).click()
    await expect(row).toBeVisible()
    await row.getByRole('button', { name: 'Remove', exact: true }).click()
    await dialog
      .getByRole('button', { name: 'Remove book', exact: true })
      .click()
    await expect(dialog).toBeHidden()
    await expect(
      page.getByRole('heading', { name: 'No matching titles' }),
    ).toBeVisible()
    await page.getByRole('button', { name: 'Clear', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'All books' })).toBeVisible()
    expect(errors).toEqual([])
  } finally {
    const response = await request.post('/api/books/search', {
      data: { page: 0, pageSize: 100, title },
    })
    const result = await response.json()
    for (const book of result.data?.content || []) {
      if (book.title !== title && book.title !== edited) continue
      const id = book.bookId ?? book.id
      await request.put(`/api/books/${id}`, {
        data: {
          title: book.title,
          author: book.author,
          price: book.price,
          unitsInStock: 0,
        },
      })
      await request.delete(`/api/books/${id}`)
    }
  }
})
