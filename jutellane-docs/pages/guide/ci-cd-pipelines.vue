<template>
  <div class='prose dark:prose-invert max-w-none mx-auto py-10 px-4'>
    <h1>CI/CD Pipelines</h1>
    <p>
      This section describes the automated workflows that power Jutellane’s development and deployment process.
    </p>

    <h2>Continuous Integration</h2>
    <p>On each push or pull request, GitHub Actions triggers automated tests and builds:</p>
    <pre><code>name: CI
on:
  push:
    branches: [ main ]
  pull_request:
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm install
      - run: pnpm build
</code></pre>

    <h2>Continuous Deployment</h2>
    <p>
      Upon successful build on <strong>main</strong>, Vercel automatically deploys the docs to the live site.
    </p>

    <p>
      Return to <NuxtLink to='/'>Home</NuxtLink> or read the next guide on <NuxtLink to='/guide/tooling-setup'>Tooling Setup</NuxtLink>.
    </p>
  </div>
</template>
