# React TypeScript Website

This is a basic React website setup using TypeScript. 

## Project Structure

```
react-ts-website
├── public
│   ├── index.html          # Main HTML file for the application
│   └── favicon.ico         # Favicon for the website
├── src
│   ├── components
│   │   └── App.tsx         # Main component of the application
│   ├── styles
│   │   └── App.css         # CSS styles for the App component
│   ├── index.tsx           # Entry point of the React application
│   └── react-app-env.d.ts   # TypeScript definitions for the React app environment
├── package.json             # npm configuration file
├── tsconfig.json            # TypeScript configuration file
└── tsconfig.node.json       # TypeScript configuration for Node.js environment
```

## Getting Started

To get started with this project, follow these steps:

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd react-ts-website
   ```

1. **Install dependencies:**
   ```bash
   npm install
   # NOTE: this project uses Three.js and react-three libraries for the 3D star-field background
   # If you modified package.json manually, make sure to run `npm install` to actually fetch new packages
   ```

3. **Run the application:**
   ```
   npm start
   ```

The application will be available at `http://localhost:5173` when you use Vite's dev server.

### Run / Build with Vite

Start development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Preview production build locally:
```bash
npm run preview
```

## 3D / Star-field background


This project now includes a simple 3D star-field background and camera controls built with:

- three
- @react-three/fiber (r3f)
- @react-three/drei (optional helpers)

Recent changes made during migration and polishing:

- Re-installed `@react-three/drei` (v9) to match the installed `@react-three/fiber` v8 stack.
- Replaced DOM-based labels with in-scene canvas sprites (so the labels are actual 3D sprites generated from a canvas texture).
- Migrated from Create React App (react-scripts) to Vite and upgraded TypeScript to 5.x for a faster, modern dev experience.
 - Re-installed `@react-three/drei` (v9) to match the installed `@react-three/fiber` v8 stack.
 - Re-enabled a DOM `Html` label mode via `@react-three/drei` and added a `labelMode` toggle in the app so you can switch between in-scene `Sprite` labels and DOM overlays.
 - Lazy-loaded the `StarScene` component (React.lazy + Suspense) so the 3D scene is split out as a separate chunk — improves perceived page load on first render.

How it works:

- The Canvas and 3D scene are implemented in `src/components/StarScene.tsx`.
- Sections are represented by markers placed at different z positions. Clicking a nav button will move the camera smoothly to that section using a small lerp animation.
- The background uses a single Points geometry (packed positions) for a performant star-field.

Adding 3D models:

- Use the glTF format for good performance and tool compatibility. Put your `.glb` files in `public/models` and load them using `useGLTF` from `@react-three/drei`.
- Prefer binary glTF (.glb), compress with Draco if you need to reduce file size.

Performance tips:

- Keep particle counts reasonable (use instanced geometry / points where possible).
- Avoid too many lights or extremely high-poly models.
- Use Suspense and lazy-loading for heavy models so the main page remains interactive.

Extension ideas:

- Bind camera movement to scroll position (parallax-style) instead of button clicks.
- Add easing functions or use `gsap` / `@react-spring/three` to get fancier camera motions.
- Use `postprocessing` (bloom, vignette) for cinematic effects.


## Built With

- [React](https://reactjs.org/) - A JavaScript library for building user interfaces
- [TypeScript](https://www.typescriptlang.org/) - A typed superset of JavaScript that compiles to plain JavaScript

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.