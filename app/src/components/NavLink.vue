<template>
  <v-list-item v-if="link" link :to="link" class="side-bar-item">
    <div class="side-bar-content">
      <v-tooltip location="right">
        <template v-slot:activator="{ props }">
          <v-list-item-title v-bind="props">
            <slot></slot>
          </v-list-item-title>
        </template>
        <span>{{ tooltip }}</span>
      </v-tooltip>
    </div>
  </v-list-item>
  <v-list-item v-else disabled class="side-bar-title">
    <div class="side-bar-content">
      <v-list-item-title><slot></slot></v-list-item-title>
    </div>
  </v-list-item>
</template>

<style scoped>
  .side-bar-item {
    min-height: 20px;
    height: 40px;
    background-color: #2175bc;
    border-left: 7px solid #1958b7;
    border-bottom: 1px solid #90bade;
  }
  .side-bar-item:hover {
      background-color: #2586d7;
      border-left-color: #1c64d1;
  }
  .side-bar-content {
    color: white;
  }
  .side-bar-title {
    min-height: 20px;
    height: 40px;
    padding-left: 22px;
    background-color: black;
    border-bottom: 1px solid #90bade;
  }
</style>

<script>

export default {
  name: 'NavLink',
  props: {
    link: String,
    tooltip: String
  }
}

</script>
