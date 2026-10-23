import NumberFormat from '../../src/services/NumberFormat'

describe('NumberFormat', () => {
  it('formats and parses localized amounts', () => {
    const german = new NumberFormat('de', 'EUR')

    expect(german.format(1234.5)).toBe('1.234,50')
    expect(german.formatAmount(1234.5)).toBe('1.234,50 €')
    expect(german.parse('1.234,50')).toBe(1234.5)
  })

  it('preserves null and undefined values', () => {
    const formatter = new NumberFormat('en')

    expect(formatter.format(null)).toBeNull()
    expect(formatter.format(undefined)).toBeUndefined()
  })
})
