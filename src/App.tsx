import './App.css';
import { mockAuth } from './data/mockAuth';
import type { AuthContext } from './types/auth';

type AppProps = { auth?: AuthContext };

const App = ({ auth }: AppProps) => {
  const isStandalone = auth === undefined;
  const currentAuth = auth ?? mockAuth;

  return (
  <div data-auth-mode={isStandalone ? 'standalone' : 'shell'}>
      <h1>Microfrontend de Reservas</h1>

      <p>
        Este componente pertenece al módulo remoto Reservas.
      </p>

      <p>Usuario actual: {currentAuth.user.name}</p>

      <button>
        Nueva reserva
      </button>
    </div>
  );
};

export default App;
