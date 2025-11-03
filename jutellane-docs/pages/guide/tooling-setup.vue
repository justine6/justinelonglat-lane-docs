<template>
  <div class='prose dark:prose-invert max-w-none mx-auto py-10 px-4'>
    <h1>Tooling Setup</h1>
    <p>
      Jutellane Docs relies on modern developer tooling to ensure consistent, high-quality builds and deployments.
    </p>

    <h2>Core Tools</h2>
    <ul>
      <li><strong>Node.js:</strong> Runtime for building and serving applications.</li>
      <li><strong>PNPM:</strong> Fast, disk-efficient package manager.</li>
      <li><strong>Nuxt 4:</strong> Framework for Vue-based static and hybrid sites.</li>
      <li><strong>Vite:</strong> Lightning-fast build tool and dev server.</li>
    </ul>

    <h2>Recommended Setup</h2>
    <pre><code>pnpm install
pnpm dev</code></pre>

    <h2>Environment Variables</h2>
    <p>Create a <code>.env</code> file at the project root and define key variables:</p>
    <pre><code>NITRO_PRESET=vercel
BASE_URL=https://docs.jutellane.com</code></pre>

    <p>
      Next, continue to <NuxtLink to="/guide/ci-cd-pipelines">CI/CD Pipelines</NuxtLink>.
    </p>
  </div>
</template>
