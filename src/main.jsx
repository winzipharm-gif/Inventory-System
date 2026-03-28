import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

import { InventoryProvider } from './context/InventoryContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthProvider';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <InventoryProvider>
          <App />
        </InventoryProvider>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>,
)
