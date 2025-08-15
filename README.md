# No1OTT Vue.js

A modern OTT (Over-The-Top) streaming platform built with Vue.js and Tailwind CSS.

## Features

- Responsive design for all screen sizes
- Modern UI with smooth animations
- Movie/Show cards with badges (New Episode, 4K, Premium)
- Hero section with video/image carousel
- Mobile-friendly navigation
- Search functionality
- Custom scrollbar styling

## Project Setup

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VUE_APP_API_URL=http://localhost:8000  # Backend API URL
```

### Installation and Running

```bash
# Install dependencies
npm install

# Start development server
npm run serve

# Build for production
npm run build

# Lint and fix files
npm run lint
```

## Technologies Used

- Vue.js 3
- Tailwind CSS
- Font Awesome
- PostCSS
- Autoprefixer

## Project Structure

```
src/
├── assets/
│   └── main.css
├── components/
│   ├── Header.vue
│   ├── Hero.vue
│   ├── MovieCard.vue
│   └── MovieSection.vue
├── App.vue
└── main.js
```

## Customization

- Colors can be customized in `tailwind.config.js`
- Font styles can be modified in `src/assets/main.css`
- Component styles can be adjusted in their respective `.vue` files

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
