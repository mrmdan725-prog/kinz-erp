import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Critical App Crash:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '50px', background: '#0f172a', color: 'white', height: '100vh', direction: 'rtl' }}>
          <h1 style={{ color: '#ff4d4d' }}>حدث خطأ غير متوقع</h1>
          <pre style={{ background: '#1e293b', padding: '20px', borderRadius: '8px', overflow: 'auto' }}>
            {this.state.error?.toString()}
          </pre>
          <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', background: 'var(--primary)', border: 'none', borderRadius: '5px', color: 'white', cursor: 'pointer', marginTop: '20px' }}>
            تحديث الصفحة
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

console.log("Kinz ERP: Starting Application...");

const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
