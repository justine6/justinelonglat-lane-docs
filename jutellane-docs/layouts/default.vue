<template>
  <div class='min-h-screen flex'>
    <aside class='w-64 p-6 border-r'>
      <h2 class='text-lg font-semibold mb-4'>Jutellane Docs</h2>
      <nav>
        <ul class='space-y-2'>
          <li><NuxtLink to='/' active-class='font-semibold'>Home</NuxtLink></li>
          <li><NuxtLink to='/guide/getting-started' active-class='font-semibold'>Getting Started</NuxtLink></li>
          <li><NuxtLink to='/guide/tooling-setup' active-class='font-semibold'>Tooling Setup</NuxtLink></li>
          <li><NuxtLink to='/guide/ci-cd-pipelines' active-class='font-semibold'>CI/CD Pipelines</NuxtLink></li>
        </ul>
      </nav>
    </aside>

    <main class='flex-1 p-8'>
      <slot />
    </main>
  </div>
</template>
