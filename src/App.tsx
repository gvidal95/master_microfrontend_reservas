import './App.css';
import { Box, Paper, Typography } from '@mui/material';
import { Reservation } from './components/Reservation';
import { mockAuth } from './data/mockAuth';
import type { AuthContext } from './types/auth';
import { ServicesProvider } from './services/ServicesContext';

type AppProps = { auth?: AuthContext };

const App = ({ auth }: AppProps) => {
  const isStandalone = auth === undefined;
  const currentAuth = auth ?? mockAuth;
  const parsedUserId = Number(currentAuth.user.id);
  const reservationUserId = Number.isFinite(parsedUserId) ? parsedUserId : 1;

  return (
    <ServicesProvider token={currentAuth.token}>
      <Paper
        data-auth-mode={isStandalone ? 'standalone' : 'shell'}
        square
        elevation={0}
        sx={{ minHeight: '100%', bgcolor: 'background.default' }}
      >
        <Box sx={{ maxWidth: 1180, mx: 'auto', px: { xs: 2, sm: 3 }, pt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Sesión activa: {currentAuth.user.name} ({currentAuth.user.email})
          </Typography>
        </Box>
        <Reservation userId={reservationUserId} />
      </Paper>
    </ServicesProvider>
  );
};

export default App;
