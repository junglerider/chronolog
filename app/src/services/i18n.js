export const translate = (sourceStr, catalog, ...args) => {
  if (typeof sourceStr !== 'string') {
    return sourceStr
  }

  let translatedStr = catalog.has(sourceStr) ? catalog.get(sourceStr) : sourceStr
  args.forEach((value, index) => {
    translatedStr = translatedStr.replace(`{${index + 1}}`, String(value))
  })
  return translatedStr
}

export const formatDate = (value, locale) => {
  if (typeof value !== 'string') {
    return value
  }

  const matches = value.match(/^(\d{4}-[01]\d-[0-3]\d)(\D[0-2]\d:[0-5]\d(:[0-5]\d)?)?(\.\d+([+-][0-2]\d:[0-5]\d|Z))?$/)
  if (!matches) {
    return value
  }

  const [year, month, day] = matches[1].split('-')
  const date = locale === 'de' ? `${day}.${month}.${year}` : `${day}/${month}/${year}`
  const time = matches[2] ? ` ${matches[2].substr(1)}` : ''
  return date + time
}

export const decimalHoursToTime = hours => {
  const wholeHours = Math.floor(Math.abs(hours))
  const minutes = Math.round((Math.abs(hours) - wholeHours) * 60)
  return `${wholeHours}:${minutes > 9 ? '' : '0'}${minutes}`
}
