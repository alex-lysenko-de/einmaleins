<script setup>
import ConfettiOverlay     from './ui/components/ConfettiOverlay.vue'
import FlyingApplesOverlay from './ui/components/FlyingApplesOverlay.vue'
</script>

<template>
  <RouterView />
  <ConfettiOverlay />
  <FlyingApplesOverlay />
</template>
