<template>
  <Suspense>
    <RouterView />
  </Suspense>
</template>

<style>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.2s ease-in;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
