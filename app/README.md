# Chronolog UI

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lint frontend source and tests
```
npm run lint
```

### Run unit/component tests
```
npm run test:unit
```

### Run browser smoke tests
Install Chromium for Playwright, then run:
```
npx playwright install --no-shell chromium
npm run test:e2e
```
The browser test starts the Vue development server on port 5403.

The Vite build, dev server, and unit test configuration are in `vite.config.js`.
