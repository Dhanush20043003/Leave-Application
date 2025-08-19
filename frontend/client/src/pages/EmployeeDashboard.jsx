import { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Alert } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import api from '../api/axios';
import ApplyLeave from './ApplyLeave';

export default function EmployeeDashboard() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get('/leaves/me');
      console.log('Loaded leave data:', data);
      
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
  }, []);

  const cols = [
    { 
      field: 'type', 
      headerName: 'Type', 
      flex: 1 
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
          <Box sx={{ 
            color: `${color}.main`,
            fontWeight: 'bold',
            textTransform: 'capitalize'
          }}>
            {status}
          </Box>
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
      field: 'comments', 
      headerName: 'Comments', 
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
    }
  ];

  return (
    <Box sx={{ p: 3, display: 'grid', gap: 3 }}>
      <ApplyLeave onSubmitted={load} />
      
      {error && (
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            My Leave Requests ({rows.length})
          </Typography>
          <div style={{ height: 420, width: '100%' }}>
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
    </Box>
  );
}