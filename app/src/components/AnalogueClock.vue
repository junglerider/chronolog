<template>
  <!-- this component is based on the work of Rüdiger Appel (see below) -->
  <!--
     german-clock.svg

     Copyright (c) 2012 Rüdiger Appel
     Dual licensed under the MIT and GPL licenses.

     Date:    2012-03-14
     Version: 1.0
     Email:   ludi(at)me(dot)com
     URI:     http://www.3Quarks.com/de/Bahnhofsuhr/
  -->
  <svg xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    xmlns:ev="http://www.w3.org/2001/xml-events"
    version="1.1"
    baseProfile="full"
    width="100%"
    height="100%"
    viewBox="0 0 200 200">

  <defs>
    <!-- three hour stroke (DIN 41091.1) -->
    <symbol id="threeHourStroke">
    <line x1="100" y1="0" x2="100" y2="30" :style="strokeStyle"/>
    </symbol>

    <!-- hour stroke (DIN 41091.1) -->
    <symbol id="hourStroke">
    <line x1="100" y1="0" x2="100" y2="24"  :style="strokeStyle"/>
    </symbol>

    <!-- minute stroke (DIN 41091.1) -->
    <symbol id="minuteStroke">
    <line x1="100" y1="0" x2="100" y2="8" :style="strokeMinuteStyle"/>
    </symbol>

    <!-- quarter strokes -->
    <symbol id="quarterStrokes">
    <use xlink:href="#threeHourStroke" />
    <use xlink:href="#minuteStroke" transform="rotate( 6, 100, 100)"/>
    <use xlink:href="#minuteStroke" transform="rotate(12, 100, 100)"/>
    <use xlink:href="#minuteStroke" transform="rotate(18, 100, 100)"/>
    <use xlink:href="#minuteStroke" transform="rotate(24, 100, 100)"/>
    <use xlink:href="#hourStroke"   transform="rotate(30, 100, 100)"/>
    <use xlink:href="#minuteStroke" transform="rotate(36, 100, 100)"/>
    <use xlink:href="#minuteStroke" transform="rotate(42, 100, 100)"/>
    <use xlink:href="#minuteStroke" transform="rotate(48, 100, 100)"/>
    <use xlink:href="#minuteStroke" transform="rotate(54, 100, 100)"/>
    <use xlink:href="#hourStroke"   transform="rotate(60, 100, 100)"/>
    <use xlink:href="#minuteStroke" transform="rotate(66, 100, 100)"/>
    <use xlink:href="#minuteStroke" transform="rotate(72, 100, 100)"/>
    <use xlink:href="#minuteStroke" transform="rotate(78, 100, 100)"/>
    <use xlink:href="#minuteStroke" transform="rotate(84, 100, 100)"/>
    </symbol>

    <!-- visible dial circle -->
    <clipPath id="dialCircle">
      <circle cx="100" cy="100" r="100"/>
    </clipPath>

  </defs>

  <!-- link -->
  <g id="link">
    <circle cx="100" cy="100" r="100" :style="dialStyle"/>
  </g>

  <!-- dial -->
  <g clip-path="url(#dialCircle)">
    <use xlink:href="#quarterStrokes"/>
    <use xlink:href="#quarterStrokes" transform="rotate( 90, 100, 100)"/>
    <use xlink:href="#quarterStrokes" transform="rotate(180, 100, 100)"/>
    <use xlink:href="#quarterStrokes" transform="rotate(270, 100, 100)"/>
  </g>

  <!-- hour hand -->
  <g id="hourHand" :transform="hourHandRotation">
    <polygon points="94,46 100,40 106,46 106,118 94,118" :style="hourHandStyle"/>
  </g>

  <!-- minute hand -->
  <g id="minuteHand" :transform="minuteHandRotation">
    <polygon points="95.5,11.5 100,7 104.5,11.5 104.5,122 95.5,122" :style="minuteHandStyle"/>
  </g>

  <!-- second hand -->
  <g id="secondHand" :transform="secondHandRotation">
    <polygon points="98.8,11 100,9.8 101.2,11 101.6,42 98.4,42" :style="secondHandStyle"/>
    <polygon points="98.1,58 101.9,58 102.5,122 97.5,122" :style="secondHandStyle"/>
    <circle cx="100" cy="50" r="8.5" :style="secondHandCircleStyle"/>
  </g>

  </svg>
</template>

<script>
export default {
  name: 'StationClock',

  props: {
    utcOffset: { type: Number, default: null },
    dialColour: { type: String, default: 'white' },
    strokeColour: { type: String, default: 'black' },
    hourHandColour: { type: String, default: 'black' },
    minuteHandColour: { type: String, default: 'black' },
    secondHandColour: { type: String, default: '#ad1a14' },
  },

  data() {
    return {
      clock: null,
      hourHandRotation: 'rotate(0, 100, 100)',
      minuteHandRotation: 'rotate(0, 100, 100)',
      secondHandRotation: 'rotate(0, 100, 100)',
    }
  },

  methods: {
    runTheClock() {
      let now = new Date()
      if (typeof this.utcOffset === 'number') {
        const minutesOffset = this.utcOffset + now.getTimezoneOffset()
        now = new Date(now.getTime() + minutesOffset * 60000)
      }
      const hours = now.getHours()
      const minutes = now.getMinutes()
      const seconds = now.getSeconds()
      this.hourHandRotation = `rotate(${hours * 30 + minutes * 0.5}, 100, 100)`
      this.minuteHandRotation = `rotate(${minutes * 6}, 100, 100)`
      this.secondHandRotation = `rotate(${seconds * 6}, 100, 100)`
    },
  },

  computed: {
    dialStyle() {
      return `fill:${this.dialColour}; stroke:none`
    },
    hourHandStyle() {
      return `fill:${this.hourHandColour}; stroke:none`
    },
    minuteHandStyle() {
      return `fill:${this.minuteHandColour}; stroke:none`
    },
    secondHandStyle() {
      return `fill:${this.secondHandColour}; stroke:none`
    },
    secondHandCircleStyle() {
      return `fill:none; stroke:${this.secondHandColour}; stroke-width:6.5`
    },
    strokeStyle() {
      return `stroke:${this.strokeColour}; stroke-width:8.4; stroke-linecap:butt`
    },
    strokeMinuteStyle() {
      return `stroke:${this.strokeColour}; stroke-width:3.6; stroke-linecap:butt`
    }
  },

  created() {
    this.runTheClock()
  },

  mounted() {
    this.clock = setInterval(this.runTheClock, 1000)
  },

  destroyed() {
    clearInterval(this.clock)
  }
}
</script>
