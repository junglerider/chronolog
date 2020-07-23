<template>
  <v-autocomplete
    v-bind="$attrs"
    :no-data-text="'No results' | i18n"
    :items="items"
    :loading="isLoading"
    :search-input.sync="searchTerm"
    :value="value"
    :item-text="itemText"
    :item-value="itemValue"
    return-object
    @change="onChange"
  ></v-autocomplete>
</template>

<script>

export default {
  name: 'AutoComplete',
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    item: {
      type: Object,
      required: true
    },
    lookup: {
      type: Function,
      required: true
    },
    minSearchLength: {
      type: [Number, String],
      default: 1
    },
    debounce: {
      type: [Number, String],
      default: 400
    }
  },

  data() {
    return {
      isLoading: false,
      items: [this.item],
      value: Object.values(this.item)[0] ? this.item : undefined,
      itemValue: Object.keys(this.item)[0],
      itemText: Object.keys(this.item)[1],
      searchTerm: Object.values(this.item)[1],
      timer: null
    }
  },

  methods: {
    onChange(value) {
      this.$emit('change', value)
    }
  },

  watch: {
    searchTerm(term) {
      if (!term) {
        this.items = []
        // this.value = undefined
        return
      }
      if (term.length < Number(this.minSearchLength)) {
        return
      }
      if (this.timer) {
        clearTimeout(this.timer)
      }
      this.timer = setTimeout(async () => {
        if (this.isLoading) {
          return
        }
        this.isLoading = true
        this.items = await this.lookup(this.searchTerm)
        this.isLoading = false
      }, this.debounce)
    }
  }
}
</script>