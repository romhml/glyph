<script setup lang="ts"></script>

<template>
  <div class="w-60 flex flex-col items-center rounded">
    <nav class="flex flex-col items-center py-2">
      <h1 class="text-lg font-bold">Pont</h1>
    </nav>
    <Suspense>
      <div class="px-2 pb-2 w-full">
        <RouterView />
      </div>
    </Suspense>
    <footer class="flex flex-col items-center py-2">
      <p class="text-xs text-zinc-500">
        Made with ❤️ by
        <a class="font-bold underline cursor-pointer" href="https://github.com/romhml">romhml</a>
      </p>
    </footer>
  </div>
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
