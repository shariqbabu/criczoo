import React from 'react';
import { Providers } from './providers';
import { AppRouter } from './router';

const App: React.FC = () => (
  <Providers>
    <AppRouter />
  </Providers>
);

export default App;
