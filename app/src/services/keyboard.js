export function controlArrowDirection(event) {
  if (!event.ctrlKey || event.altKey || event.metaKey || event.shiftKey || event.defaultPrevented) {
    return 0
  }

  const target = event.target
  if (target && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))) {
    return 0
  }

  if (event.key === 'ArrowLeft') {
    return -1
  }
  if (event.key === 'ArrowRight') {
    return 1
  }
  return 0
}
