import { shallowMount } from '@vue/test-utils'
import TextBlock from '../../src/components/TextBlock.vue'

describe('TextBlock', () => {
  it('renders each newline-delimited line', () => {
    const wrapper = shallowMount(TextBlock, {
      props: {
        value: 'First line\nSecond line'
      }
    })

    expect(wrapper.text()).toBe('First lineSecond line')
    expect(wrapper.findAll('br')).toHaveLength(2)
  })
})
