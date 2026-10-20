<template>
  <v-autocomplete
    v-bind="$attrs"
    :no-data-text="$i18n('No results')"
    :items="items"
    :loading="isLoading"
    v-model:search="searchTerm"
    :model-value="value"
    :item-title="itemText"
    :item-value="itemValue"
    return-object
    @update:model-value="onChange"
  >
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps || {}" />
    </template>
  </v-autocomplete>
</template>

<script>

export default {

  name: 'AutoComplete',

  inheritAttrs: false,

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

  emits: ['change'],

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
      this.value = value
      this.$emit('change', value)
    }
  },

  watch: {
    searchTerm(term) {
      if (!term) {
        this.items = []
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
