# Images Infinite Scroll

Angular 21 sample application with a photos list, favorites flow, and a single-photo details page.

## Development

```bash
npm start
npm run start:pl
```

## Technical Notes

- The application follows a signal-first, zoneless-oriented approach and uses `OnPush` change detection across the component layer.
- Standalone components are used throughout the app, and secondary routes are lazy-loaded.
- Styling is built around configurable CSS variables with Angular Material theme integration, making theme changes and alternative theme application straightforward.
- Basic internationalisation/localisation is supported, including localized builds.
- The layout is reasonably adaptive to different screen sizes, but responsiveness was not the main focus of the implementation.
- Image fetching is currently implemented with mocked functionality, while the dependency-injection-based service abstraction keeps replacing it with a real backend integration straightforward.

## UX Note

The current interaction behavior follows the stated requirements closely. From a design and user-experience perspective, it would likely be better to indicate selected items or communicate click intent more explicitly.

## Build and Test

- `npm test` runs the unit test suite.
- `npm run build` creates the build.
- `npm run build:pl` creates the localized build.
