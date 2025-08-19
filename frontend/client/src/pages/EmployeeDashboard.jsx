import { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import api from '../api/axios';
import ApplyLeave from './ApplyLeave';

export default function EmployeeDashboard() {
  const [rows, setRows] = useState([]);

  const load = async () => {
    const { data } = await api.get('/leaves/me');
    setRows(data.map(d => ({ id: d._id, ...d })));
  };

  useEffect(() => { load(); }, []);

  const cols = [
    { field: 'type', headerName: 'Type', flex: 1 },
    { field: 'startDate', headerName: 'From', flex: 1, valueGetter: p => new Date(p.row.startDate).toLocaleDateString() },
    { field: 'endDate', headerName: 'To', flex: 1, valueGetter: p => new Date(p.row.endDate).toLocaleDateString() },
    { field: 'status', headerName: 'Status', flex: 1 },
    { field: 'comments', headerName: 'Comments', flex: 1 }
  ];

  return (
    <Box sx={{ p: 3, display: 'grid', gap: 3 }}>
      <ApplyLeave onSubmitted={load} />
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>My Leave Requests</Typography>
          <div style={{ height: 420, width: '100%' }}>
            <DataGrid rows={rows} columns={cols} disableRowSelectionOnClick />
          </div>
        </CardContent>
      </Card>
    </Box>
  );
}
