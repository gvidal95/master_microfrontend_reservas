import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import type { reservationDataSave } from '../data/reservation';
import { useServices } from '../services/ServicesContext';
import type { CourtData } from '../types/court';
import type { ReservationData } from '../types/reservation';
import type { ScheduleData } from '../types/schedule';

type ReservationProps = {
  userId: number;
};

type TimeSlot = {
  start: string;
  end: string;
};

type AvailableCourt = {
  court: CourtData;
  schedule: ScheduleData;
  slots: TimeSlot[];
};

const SLOT_MINUTES = 60;

const toLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const formatTime = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

const toStoredTime = (time: string) => `${time}:00`;

const overlapsReservation = (
  slot: TimeSlot,
  courtId: number,
  reservations: ReservationData[],
) => reservations.some((reservation) =>
  reservation.reservationCourtId === courtId
  && toMinutes(reservation.reservationStartTime) < toMinutes(slot.end)
  && toMinutes(reservation.reservationEndTime) > toMinutes(slot.start));

const getAvailableSlots = (
  schedule: ScheduleData,
  courtId: number,
  reservations: ReservationData[],
) => {
  const slots: TimeSlot[] = [];
  const scheduleStart = toMinutes(schedule.scheduleStart);
  const scheduleEnd = toMinutes(schedule.scheduleEnd);

  for (let start = scheduleStart; start + SLOT_MINUTES <= scheduleEnd; start += SLOT_MINUTES) {
    const slot = { start: formatTime(start), end: formatTime(start + SLOT_MINUTES) };
    if (!overlapsReservation(slot, courtId, reservations)) slots.push(slot);
  }

  return slots;
};

export const Reservation = ({ userId }: ReservationProps) => {
  const { courtService, reservationService } = useServices();

  const today = useMemo(() => toLocalDate(new Date()), []);
  const [selectedDate, setSelectedDate] = useState('');
  const [courts, setCourts] = useState<CourtData[]>([]);
  const [occupiedReservations, setOccupiedReservations] = useState<ReservationData[]>([]);
  const [selectedCourt, setSelectedCourt] = useState<AvailableCourt | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!selectedDate) {
      setCourts([]);
      setOccupiedReservations([]);
      return;
    }

    let isCurrentRequest = true;
    setIsLoading(true);
    setError('');
    setSelectedCourt(null);
    setSelectedSlot(null);

    Promise.all([
      courtService.getCourts(selectedDate),
      reservationService.getOccupiedReservationsByDate(selectedDate),
    ])
      .then(([loadedCourts, reservations]) => {
        if (!isCurrentRequest) return;
        setCourts(loadedCourts);
        setOccupiedReservations(reservations);
      })
      .catch(() => {
        if (!isCurrentRequest) return;
        setCourts([]);
        setOccupiedReservations([]);
        setError('No se pudieron cargar las canchas disponibles. Inténtalo nuevamente.');
      })
      .finally(() => {
        if (isCurrentRequest) setIsLoading(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [courtService, reservationService, selectedDate]);

  const availableCourts = useMemo<AvailableCourt[]>(() => {
    return courts.flatMap((court) => {
      const schedule = court.courtSchedules?.[0];
      if (!schedule) return [];

      const slots = getAvailableSlots(schedule, court.courtId, occupiedReservations);
      return slots.length ? [{ court, schedule, slots }] : [];
    });
  }, [courts, occupiedReservations]);

  const closeDialog = () => {
    if (isSaving) return;
    setSelectedCourt(null);
    setSelectedSlot(null);
  };

  const saveReservation = async () => {
    if (!selectedCourt || !selectedSlot || !selectedDate) return;

    const reservation: typeof reservationDataSave = {
      reservationDate: selectedDate,
      reservationStartTime: toStoredTime(selectedSlot.start),
      reservationEndTime: toStoredTime(selectedSlot.end),
      reservationCourtId: selectedCourt.court.courtId,
      reservationUserId: userId,
    };

    setIsSaving(true);
    setError('');

    try {
      const savedReservation = await reservationService.saveReservation(reservation);
      setOccupiedReservations((current) => [...current, savedReservation]);
      setSuccessMessage('La reserva se guardó correctamente.');
      setSelectedCourt(null);
      setSelectedSlot(null);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'No se pudo guardar la reserva. Inténtalo nuevamente.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 1180, mx: 'auto', py: 3, px: { xs: 2, sm: 3 } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3, justifyContent: 'space-between', alignItems: { sm: 'center' } }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Reservar una cancha</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Elige una fecha
          </Typography>
        </Box>
        <TextField
          label="Fecha de la reserva"
          type="date"
          value={selectedDate}
          onChange={(event) => {
            const date = event.target.value;
            if (date && date < today) {
              setSelectedDate('');
              setError('La fecha de la reserva debe ser igual o posterior a la fecha actual.');
              return;
            }
            setSelectedDate(date);
          }}
          slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: today } }}
          sx={{ width: { xs: '100%', sm: 230 } }}
          required
        />
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!selectedDate && (
        <Card variant="outlined">
          <CardContent sx={{ py: 5, textAlign: 'center' }}>
            <CalendarMonthRoundedIcon color="primary" sx={{ fontSize: 44, mb: 1 }} />
            <Typography variant="h6">Selecciona una fecha</Typography>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <Stack spacing={1.5} sx={{ py: 7, alignItems: 'center' }}>
          <CircularProgress size={36} />
          <Typography variant="body2" color="text.secondary">Consultando disponibilidad…</Typography>
        </Stack>
      )}

      {selectedDate && !isLoading && !error && (
        <>
          <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: 'center' }}>
            <EventAvailableRoundedIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Canchas disponibles</Typography>
            <Chip label={availableCourts.length} size="small" color="primary" variant="outlined" />
          </Stack>

          {availableCourts.length === 0 ? (
            <Alert severity="info">No hay canchas con bloques disponibles para la fecha seleccionada.</Alert>
          ) : (
            <Grid container spacing={2}>
              {availableCourts.map((availableCourt) => (
                <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={availableCourt.court.courtId}>
                  <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderColor: 'primary.light' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', mb: 1.5 }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>{availableCourt.court.courtName}</Typography>
                          <Typography variant="caption" color="text.secondary">{availableCourt.court.sport?.sportName}</Typography>
                        </Box>
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {availableCourt.court.courtDescription}
                      </Typography>
                      <Divider sx={{ mb: 1.5 }} />
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <ScheduleRoundedIcon color="action" fontSize="small" />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {availableCourt.schedule.scheduleStart.slice(0, 5)} — {availableCourt.schedule.scheduleEnd.slice(0, 5)}
                        </Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {availableCourt.slots.length} {availableCourt.slots.length === 1 ? 'bloque disponible' : 'bloques disponibles'}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ px: 2, pb: 2 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => {
                          setSelectedCourt(availableCourt);
                          setSelectedSlot(null);
                          setError('');
                        }}
                      >
                        Reservar
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      <Dialog open={Boolean(selectedCourt)} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>Reservar · {selectedCourt?.court.courtName}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            Selecciona un bloque disponible para el {selectedDate}.
          </Typography>
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
            {selectedCourt?.slots.map((slot) => {
              const isSelected = selectedSlot?.start === slot.start;
              return (
                <Chip
                  key={slot.start}
                  label={`${slot.start} — ${slot.end}`}
                  color="primary"
                  variant={isSelected ? 'filled' : 'outlined'}
                  clickable
                  onClick={() => setSelectedSlot(slot)}
                />
              );
            })}
          </Stack>
          {selectedSlot && (
            <Alert severity="info" icon={<ScheduleRoundedIcon />} sx={{ mt: 2.5 }}>
              Reserva seleccionada: {selectedSlot.start} — {selectedSlot.end}
            </Alert>
          )}
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDialog} color="inherit" disabled={isSaving}>Cancelar</Button>
          <Button
            onClick={saveReservation}
            variant="contained"
            loading={isSaving}
            disabled={!selectedSlot}
          >
            Guardar reserva
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage('')}
        message={successMessage}
      />
    </Box>
  );
};
