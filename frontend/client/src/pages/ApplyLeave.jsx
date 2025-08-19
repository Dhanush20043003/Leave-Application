import { Box, Button, Card, CardContent, MenuItem, TextField, Typography } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useState } from 'react';
import api from '../api/axios';

export default function ApplyLeave({ onSubmitted }) {
  const [type, setType] = useState('CASUAL');
  const [startDate, setStartDate] = useState(dayjs());
  const [endDate, setEndDate] = useState(dayjs());
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/leaves', {
        type,
        startDate: startDate.toDate(),
        endDate: endDate.toDate(),
        reason
      });
      setReason('');
      onSubmitted?.();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to submit');
    }
  };

  return (
    <Card>
      <CardContent component="form" onSubmit={submit}>
        <Typography variant="h6" gutterBottom>Apply for Leave</Typography>
        <TextField select label="Type" value={type} onChange={(e)=>setType(e.target.value)} sx={{ mr:2, mb:2, minWidth:160 }}>
          {['CASUAL','SICK','EARNED','UNPAID'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
        </TextField>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker label="Start date" value={startDate} onChange={setStartDate} />
          <Box sx={{ width: 16, display:'inline-block' }}/>
          <DatePicker label="End date" value={endDate} onChange={setEndDate} />
        </LocalizationProvider>
        <TextField label="Reason" value={reason} onChange={e=>setReason(e.target.value)} fullWidth multiline rows={3} sx={{ mt:2 }} />
        {error && <Typography color="error" variant="body2" mt={1}>{error}</Typography>}
        <Button type="submit" variant="contained" sx={{ mt:2 }}>Submit</Button>
      </CardContent>
    </Card>
  );
}
