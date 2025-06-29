# Dicoding Stories SPA

A Single Page Application for sharing stories in the Dicoding community. Built with vanilla JavaScript, Webpack, and modern web technologies.

## Features

- 📱 **Progressive Web App (PWA)** - Installable and works offline
- 🔐 **Authentication** - Login and registration system
- 📸 **Camera Integration** - Capture photos directly from camera
- 🗺️ **Interactive Maps** - Location selection and story mapping
- 🎨 **Photo Filters** - Apply filters to captured images
- 🔔 **Push Notifications** - Web push notifications support
- ♿ **Accessibility** - WCAG compliant with screen reader support
- 📱 **Responsive Design** - Works on all device sizes

## Technologies Used

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Build Tool**: Webpack 5
- **Maps**: Leaflet.js
- **API**: Dicoding Story API
- **PWA**: Service Worker, Web App Manifest
- **Testing**: Jest
- **Linting**: ESLint + Prettier

## Getting Started

### Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/your-username/dicoding-stories-spa.git
cd dicoding-stories-spa
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Start development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open your browser and navigate to `http://localhost:9000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run start` - Start development server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run serve` - Serve production build
- `npm run clean` - Clean dist folder
- `npm run analyze` - Analyze bundle size

## Project Structure

\`\`\`
dicoding-stories-spa/
├── scripts/
│   ├── main.js                 # Application entry point
│   ├── router.js               # SPA routing system
│   ├── services/               # API services
│   │   ├── auth-service.js
│   │   ├── story-service.js
│   │   └── notification-service.js
│   ├── presenters/             # MVP presenters
│   │   ├── home-presenter.js
│   │   ├── login-presenter.js
│   │   ├── add-story-presenter.js
│   │   ├── story-detail-presenter.js
│   │   └── settings-presenter.js
│   └── utils/                  # Utility functions
│       └── image-utils.js
├── styles/
│   ├── main.css               # Main styles
│   └── story-detail.css       # Story detail styles
├── public/
│   ├── sw.js                  # Service Worker
│   └── icons/                 # PWA icons
├── tests/                     # Test files
├── index.html                 # Main HTML file
├── manifest.json              # PWA manifest
├── webpack.config.js          # Webpack configuration
├── package.json               # Dependencies and scripts
└── STUDENT.txt               # Student information
\`\`\`

## API Integration

This application integrates with the Dicoding Story API:

- **Base URL**: `https://story-api.dicoding.dev/v1`
- **Authentication**: Bearer token
- **Endpoints**: Login, Register, Stories CRUD, Notifications

## PWA Features

- **Offline Support**: Service Worker caches resources
- **Installable**: Can be installed on devices
- **Push Notifications**: Web push notifications
- **Responsive**: Works on all screen sizes

## Accessibility Features

- Skip to content link
- Semantic HTML elements
- ARIA labels and roles
- Alt text for images
- Keyboard navigation support
- Screen reader compatibility

## Browser Support

- Chrome >= 88
- Firefox >= 85
- Safari >= 14
- Edge >= 88

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Dicoding for providing the Story API
- OpenStreetMap for map tiles
- Leaflet.js for map functionality
- The web development community for inspiration and resources
