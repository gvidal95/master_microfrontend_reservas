import './App.css';
import { mockAuth } from './data/mockAuth';
import type { AuthContext } from './types/auth';

type AppProps = { auth?: AuthContext };

const App = ({ auth = mockAuth }: AppProps) => {
  return (
  <div>
      <h1>Microfrontend de Reservas</h1>

      <p>
        Este componente pertenece al módulo remoto Reservas.
      </p>

      <p>Usuario actual: {auth.user.name}</p>

      <button>
        Nueva reserva
      </button>
    </div>
  );
};

export default App;
