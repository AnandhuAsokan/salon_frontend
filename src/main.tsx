import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app.tsx'

// 1. Find the DOM element with the id 'root'
const rootElement = document.getElementById('root');

// 2. Check if the element was found before creating the root
if (!rootElement) {
  throw new Error('Failed to find the root element');
}

// 3. Create a React root and render the App
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)