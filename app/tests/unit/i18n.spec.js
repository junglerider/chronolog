import { decimalHoursToTime, formatDate, translate } from '../../src/services/i18n'

describe('localization helpers', () => {
  it('translates text and interpolates arguments', () => {
    const catalog = new Map([['Hello {1}, {2}', 'Hallo {1}, {2}']])

    expect(translate('Hello {1}, {2}', catalog, 'Alex', 3)).toBe('Hallo Alex, 3')
    expect(translate(42, catalog)).toBe(42)
  })

  it('formats ISO dates using the selected locale', () => {
    expect(formatDate('2026-10-20T13:16:10', 'de')).toBe('20.10.2026 13:16:10')
    expect(formatDate('2026-10-20', 'en')).toBe('20/10/2026')
    expect(formatDate('not-a-date', 'en')).toBe('not-a-date')
    expect(formatDate(null, 'en')).toBeNull()
  })

  it('formats signed decimal hours as hours and minutes', () => {
    expect(decimalHoursToTime(1.5)).toBe('1:30')
    expect(decimalHoursToTime(-2.25)).toBe('2:15')
  })
})
