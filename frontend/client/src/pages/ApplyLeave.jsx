import { Box, Button, Card, CardContent, MenuItem, TextField, Typography, Alert } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useState } from 'react';
import api from '../api/axios';

export default function ApplyLeave({ onSubmitted }) {
  const [type, setType] = useState('CASUAL');
  const [startDate, setStartDate] = useState(dayjs().add(1, 'day')); // Default to tomorrow
  const [endDate, setEndDate] = useState(dayjs().add(1, 'day'));
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validation
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    if (startDate.isAfter(endDate)) {
      setError('Start date cannot be after end date');
      return;
    }

    if (startDate.isBefore(dayjs(), 'day')) {
      setError('Start date cannot be in the past');
      return;
    }

    if (!reason.trim()) {
      setError('Please provide a reason for leave');
      return;
    }

    try {
      setLoading(true);
      await api.post('/leaves', {
        type,
        startDate: startDate.toDate(),
        endDate: endDate.toDate(),
        reason: reason.trim()
      });
      
      setSuccess('Leave request submitted successfully!');
      setReason('');
      setType('CASUAL');
      setStartDate(dayjs().add(1, 'day'));
      setEndDate(dayjs().add(1, 'day'));
      
      // Call callback to refresh the list
      if (onSubmitted) {
        onSubmitted();
      }
    } catch (err) {
      console.error('Submit leave error:', err);
      setError(err.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    return endDate.diff(startDate, 'day') + 1;
  };

  return (
    <Card>
      <CardContent component="form" onSubmit={submit}>
        <Typography variant="h6" gutterBottom>Apply for Leave</Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <TextField 
            select 
            label="Leave Type" 
            value={type} 
            onChange={(e) => setType(e.target.value)} 
            sx={{ minWidth: 160 }}
            required
          >
            <MenuItem value="CASUAL">Casual Leave</MenuItem>
            <MenuItem value="SICK">Sick Leave</MenuItem>
            <MenuItem value="EARNED">Earned Leave</MenuItem>
            <MenuItem value="UNPAID">Unpaid Leave</MenuItem>
          </TextField>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker 
              label="Start Date" 
              value={startDate} 
              onChange={setStartDate}
              minDate={dayjs()}
              sx={{ minWidth: 160 }}
              required
            />
            <DatePicker 
              label="End Date" 
              value={endDate} 
              onChange={setEndDate}
              minDate={startDate || dayjs()}
              sx={{ minWidth: 160 }}
              required
            />
          </LocalizationProvider>

          {startDate && endDate && (
            <Box sx={{ display: 'flex', alignItems: 'center', px: 2 }}>
              <Typography variant="body2" color="primary">
                Duration: {calculateDays()} day(s)
              </Typography>
            </Box>
          )}
        </Box>

        <TextField 
          label="Reason for Leave" 
          value={reason} 
          onChange={(e) => setReason(e.target.value)} 
          fullWidth 
          multiline 
          rows={3} 
          sx={{ mb: 2 }} 
          required
          placeholder="Please provide a detailed reason for your leave request..."
        />

        <Button 
          type="submit" 
          variant="contained" 
          disabled={loading}
          sx={{ mt: 1 }}
        >
          {loading ? 'Submitting...' : 'Submit Leave Request'}
        </Button>
      </CardContent>
    </Card>
  );
}