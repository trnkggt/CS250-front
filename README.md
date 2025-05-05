# CS250 Project

A modern React application built with Material-UI and other powerful libraries.

## Tech Stack

- React 19
- Material-UI (MUI) v5
- React Router v6
- Formik & Yup for form handling and validation
- Axios for API requests
- Date-fns for date manipulation

## Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React context providers
├── pages/         # Page components
├── services/      # API and other services
└── App.js         # Main application component
```

## Getting Started

### Prerequisites

- Node.js (Latest LTS version recommended)
- npm (comes with Node.js)

### Installation

1. Clone the repository:
```bash
git clone [your-repository-url]
cd cs250
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open in your default browser at [http://localhost:3000](http://localhost:3000).

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

## Features

- Modern UI with Material-UI components
- Form validation with Formik and Yup
- Responsive design
- Client-side routing with React Router
- API integration with Axios

## Development

The project uses Create React App for development. Any changes made to the source files will automatically trigger a hot reload in the development server.

## Building for Production

To create a production build:

```bash
npm run build
```

This will create an optimized build in the `build` directory.

## Testing

Run the test suite:

```bash
npm test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and confidential.
