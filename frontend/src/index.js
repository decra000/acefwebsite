import React from 'react';
import ReactDOM from 'react-dom/client';

// Add global error handling
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  console.error('Error details:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
});

// Add unhandled promise rejection handling
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', backgroundColor: '#ffebee', color: '#c62828' }}>
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap', fontSize: '12px', marginTop: '10px' }}>
            <summary>Error Details (Click to expand)</summary>
            <div style={{ marginTop: '10px' }}>
              <strong>Error:</strong> {this.state.error && this.state.error.toString()}
            </div>
            <div style={{ marginTop: '10px' }}>
              <strong>Component Stack:</strong>
              {this.state.errorInfo.componentStack}
            </div>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

try {
  // Import App component
  const App = React.lazy(() => import('./App'));

  // Check if root element exists
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    throw new Error('Root element with id "root" not found in the DOM');
  }

  console.log('Root element found:', rootElement);
  console.log('Creating React root...');

  const root = ReactDOM.createRoot(rootElement);
  
  console.log('React root created successfully');
  console.log('Rendering app...');

  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <React.Suspense fallback={
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <div>Loading application...</div>
          </div>
        }>
          <App />
        </React.Suspense>
      </ErrorBoundary>
    </React.StrictMode>
  );

  console.log('App rendered successfully');

} catch (error) {
  console.error('Error during app initialization:', error);
  
  // Fallback rendering
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; background-color: #ffebee; color: #c62828; font-family: Arial, sans-serif;">
        <h2>Application Failed to Load</h2>
        <p><strong>Error:</strong> ${error.message}</p>
        <p>Please check the console for more details and refresh the page.</p>
        <button onclick="window.location.reload()" style="padding: 10px 20px; margin-top: 10px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Reload Page
        </button>
      </div>
    `;
  }
}

// Import reportWebVitals function if it exists
try {
  import('./reportWebVitals').then(({ default: reportWebVitals }) => {
    reportWebVitals();
  });
} catch (error) {
  console.warn('reportWebVitals not available:', error);
}