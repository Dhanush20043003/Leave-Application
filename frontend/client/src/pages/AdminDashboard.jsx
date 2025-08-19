import { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, MenuItem, TextField, Typography, Alert, Chip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import api from '../api/axios';
import ConfirmDialog from '../components/ConfirmDialog';

export default function AdminDashboard() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('');
  const [confirm, setConfirm] = useState({ open: false, id: null, action: null });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get(`/leaves${status ? `?status=${status}` : ''}`);
      console.log('Loaded admin leave data:', data);
      
      // Ensure data is an array and properly format it
      const formattedData = Array.isArray(data) ? data.map(item => ({
        id: item._id,
        type: item.type || 'CASUAL',
        startDate: item.startDate,
        endDate: item.endDate,
        startDateFormatted: item.startDate ? new Date(item.startDate).toLocaleDateString() : '',
        endDateFormatted: item.endDate ? new Date(item.endDate).toLocaleDateString() : '',
        status: item.status || 'PENDING',
        reason: item.reason || '',
        comments: item.comments || '',
        employeeName: item.employee?.name || 'Unknown',
        employeeDepartment: item.employee?.department || '-',
        employee: item.employee,
        approver: item.approver,
        createdAt: item.createdAt
      })) : [];
      
      setRows(formattedData);
    } catch (err) {
      console.error('Error loading leaves:', err);
      setError(err.response?.data?.message || 'Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [status]);

  const decide = async (id, action) => {
    try {
      setError('');
      await api.post(`/leaves/${id}/decision`, { action });
      load();
      setConfirm({ open: false, id: null, action: null });
    } catch (err) {
      console.error('Error making decision:', err);
      setError(err.response?.data?.message || 'Failed to process decision');
    }
  };

  const cols = [
    { 
      field: 'employeeName', 
      headerName: 'Employee', 
      flex: 1
    },
    { 
      field: 'employeeDepartment', 
      headerName: 'Department', 
      flex: 1
    },
    { 
      field: 'type', 
      headerName: 'Type', 
      flex: 1,
      renderCell: (params) => (
        <Chip 
          label={params.value || 'CASUAL'} 
          size="small" 
          variant="outlined"
          color={
            params.value === 'SICK' ? 'error' :
            params.value === 'CASUAL' ? 'primary' :
            params.value === 'EARNED' ? 'success' : 'default'
          }
        />
      )
    },
    { 
      field: 'startDateFormatted', 
      headerName: 'From', 
      flex: 1
    },
    { 
      field: 'endDateFormatted', 
      headerName: 'To', 
      flex: 1
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      flex: 1,
      renderCell: (params) => {
        const status = params.value || 'PENDING';
        const color = status === 'APPROVED' ? 'success' : 
                     status === 'REJECTED' ? 'error' : 
                     status === 'PENDING' ? 'warning' : 'default';
        
        return (
          <Chip 
            label={status} 
            size="small" 
            color={color}
            variant={status === 'PENDING' ? 'filled' : 'outlined'}
          />
        );
      }
    },
    { 
      field: 'reason', 
      headerName: 'Reason', 
      flex: 2,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ 
          overflow: 'hidden', 
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '100%'
        }}>
          {params.value || '-'}
        </Typography>
      )
    },
    {
      field: 'actions', 
      headerName: 'Actions', 
      flex: 1, 
      sortable: false,
      renderCell: (params) => {
        const isPending = params.row?.status === 'PENDING';
        return (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              size="small" 
              variant="contained"
              color="success"
              onClick={() => setConfirm({ open: true, id: params.row?.id, action: 'APPROVE' })} 
              disabled={!isPending}
            >
              Approve
            </Button>
            <Button 
              size="small" 
              variant="contained"
              color="error"
              onClick={() => setConfirm({ open: true, id: params.row?.id, action: 'REJECT' })} 
              disabled={!isPending}
            >
              Reject
            </Button>
          </Box>
        );
      }
    }
  ];

  return (
    <Box sx={{ p: 3, display: 'grid', gap: 2 }}>
      <Card>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6">All Leave Requests ({rows.length})</Typography>
          <TextField 
            select 
            size="small" 
            label="Status Filter" 
            value={status} 
            onChange={(e) => setStatus(e.target.value)} 
            sx={{ width: 180, ml: 'auto' }}
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="PENDING">Pending</MenuItem>
            <MenuItem value="APPROVED">Approved</MenuItem>
            <MenuItem value="REJECTED">Rejected</MenuItem>
            <MenuItem value="CANCELLED">Cancelled</MenuItem>
          </TextField>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <div style={{ height: 520, width: '100%' }}>
            <DataGrid 
              rows={rows} 
              columns={cols} 
              loading={loading}
              disableRowSelectionOnClick 
              initialState={{
                sorting: {
                  sortModel: [{ field: 'createdAt', sort: 'desc' }],
                },
              }}
              sx={{
                '& .MuiDataGrid-cell': {
                  alignItems: 'center',
                  display: 'flex'
                }
              }}
            />
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirm.open}
        title={`${confirm.action === 'APPROVE' ? 'Approve' : 'Reject'} Leave Request`}
        text={`Are you sure you want to ${confirm.action?.toLowerCase()} this leave request?`}
        onClose={() => setConfirm({ open: false, id: null, action: null })}
        onConfirm={() => decide(confirm.id, confirm.action)}
      />
    </Box>
  );
}