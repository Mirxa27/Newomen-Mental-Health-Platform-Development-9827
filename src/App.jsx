import { BrowserRouter } from 'react-router-dom';
import AppRouter from './router';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}

export default App;