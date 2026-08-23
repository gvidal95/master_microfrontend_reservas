import './App.css';
import { useState } from 'react';
import { Alert, Box, Paper, Tab, Tabs, Typography } from '@mui/material';
import { Reservation } from './components/Reservation';
import { mockAuth } from './data/mockAuth';
import type { AuthContext } from './types/auth';
import { ServicesProvider } from './services/ServicesContext';

type AppProps = { auth?: AuthContext };

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

const App = ({ auth }: AppProps) => {
  const [activeTab, setActiveTab] = useState(0);
  const isStandalone = auth === undefined;
  const currentAuth = auth ?? mockAuth;
  const parsedUserId = Number(currentAuth.user.id);
  const hasValidUserId = Number.isSafeInteger(parsedUserId) && parsedUserId > 0;

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

        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          aria-label="Reservas"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Crear reserva" id="tab-0" aria-controls="tabpanel-0" />
          <Tab label="Gestión de reservas" id="tab-1" aria-controls="tabpanel-1" />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          {hasValidUserId ? (
            <Reservation userId={parsedUserId} />
          ) : (
            <Alert severity="error" sx={{ maxWidth: 1180, mx: 'auto', mt: 3 }}>
              No se puede crear una reserva porque la sesión no contiene un ID de usuario válido.
            </Alert>
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {/* Espacio reservado para implementar la gestión de reservas. */}
        </TabPanel>
      </Paper>
    </ServicesProvider>
  );
};

export default App;
