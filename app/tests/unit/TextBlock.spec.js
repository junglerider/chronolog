import { shallowMount } from '@vue/test-utils'
import TextBlock from '../../src/components/TextBlock.vue'

describe('TextBlock', () => {
  it('preserves line breaks in text', () => {
    const wrapper = shallowMount(TextBlock, {
      props: {
        value: 'First line\nSecond line'
      }
    })

    expect(wrapper.element.textContent).toBe('First line\nSecond line')
    expect(wrapper.classes()).toContain('text-block')
  })
})
