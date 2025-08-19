import { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, MenuItem, TextField, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import api from '../api/axios';
import ConfirmDialog from '../components/ConfirmDialog';

export default function AdminDashboard() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('');
  const [confirm, setConfirm] = useState({ open: false, id: null, action: null });

  const load = async () => {
    const { data } = await api.get(`/leaves${status ? `?status=${status}` : ''}`);
    setRows(data.map(d => ({ id: d._id, ...d })));
  };

  useEffect(() => { load(); }, [status]);

  const decide = async (id, action) => {
    await api.post(`/leaves/${id}/decision`, { action });
    load();
  };

  const cols = [
    { field: 'employee', headerName: 'Employee', flex: 1, valueGetter: p => p.row.employee?.name },
    { field: 'type', headerName: 'Type', flex: 1 },
    { field: 'startDate', headerName: 'From', flex: 1, valueGetter: p => new Date(p.row.startDate).toLocaleDateString() },
    { field: 'endDate', headerName: 'To', flex: 1, valueGetter: p => new Date(p.row.endDate).toLocaleDateString() },
    { field: 'status', headerName: 'Status', flex: 1 },
    {
      field: 'actions', headerName: 'Actions', flex: 1, renderCell: (params) => (
        <>
          <Button size="small" onClick={() => setConfirm({ open: true, id: params.row.id, action: 'APPROVE' })} disabled={params.row.status!=='PENDING'}>Approve</Button>
          <Button size="small" onClick={() => setConfirm({ open: true, id: params.row.id, action: 'REJECT' })} disabled={params.row.status!=='PENDING'}>Reject</Button>
        </>
      )
    }
  ];

  return (
    <Box sx={{ p: 3, display:'grid', gap: 2 }}>
      <Card>
        <CardContent sx={{ display:'flex', alignItems:'center', gap:2 }}>
          <Typography variant="h6">All Leave Requests</Typography>
          <TextField select size="small" label="Status Filter" value={status} onChange={e=>setStatus(e.target.value)} sx={{ width: 180, ml: 'auto' }}>
            <MenuItem value="">All</MenuItem>
            {['PENDING','APPROVED','REJECTED','CANCELLED'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <div style={{ height: 520, width: '100%' }}>
            <DataGrid rows={rows} columns={cols} disableRowSelectionOnClick />
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirm.open}
        title={`${confirm.action === 'APPROVE' ? 'Approve' : 'Reject'} Request`}
        text="Are you sure?"
        onClose={() => setConfirm({ open:false, id:null, action:null })}
        onConfirm={() => { decide(confirm.id, confirm.action); setConfirm({ open:false, id:null, action:null }); }}
      />
    </Box>
  );
}
