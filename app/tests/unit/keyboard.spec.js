import { vi } from 'vitest'
import { controlArrowDirection } from '../../src/services/keyboard'
import DataList from '../../src/components/DataList.vue'

describe('controlArrowDirection', () => {
  it('returns the navigation direction for Ctrl+Left and Ctrl+Right', () => {
    expect(controlArrowDirection({ key: 'ArrowLeft', ctrlKey: true })).toBe(-1)
    expect(controlArrowDirection({ key: 'ArrowRight', ctrlKey: true })).toBe(1)
  })

  it('ignores other modifiers and unmodified arrow keys', () => {
    expect(controlArrowDirection({ key: 'ArrowLeft' })).toBe(0)
    expect(controlArrowDirection({ key: 'ArrowRight', ctrlKey: true, shiftKey: true })).toBe(0)
  })

  it('preserves arrow-key editing in input fields', () => {
    expect(controlArrowDirection({
      key: 'ArrowLeft',
      ctrlKey: true,
      target: { tagName: 'INPUT' }
    })).toBe(0)
  })

  it('changes list pages only within the available page range', () => {
    const context = { page: 2, pageCount: 3 }
    const previousEvent = {
      key: 'ArrowLeft',
      ctrlKey: true,
      preventDefault: vi.fn()
    }
    const nextEvent = {
      key: 'ArrowRight',
      ctrlKey: true,
      preventDefault: vi.fn()
    }

    DataList.methods.onKeydown.call(context, previousEvent)
    expect(context.page).toBe(1)
    expect(previousEvent.preventDefault).toHaveBeenCalledOnce()

    DataList.methods.onKeydown.call(context, nextEvent)
    expect(context.page).toBe(2)
    expect(nextEvent.preventDefault).toHaveBeenCalledOnce()

    context.page = context.pageCount
    const boundaryEvent = {
      key: 'ArrowRight',
      ctrlKey: true,
      preventDefault: vi.fn()
    }
    DataList.methods.onKeydown.call(context, boundaryEvent)
    expect(context.page).toBe(3)
    expect(boundaryEvent.preventDefault).not.toHaveBeenCalled()
  })
})
