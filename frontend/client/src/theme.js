import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: { fontFamily: 'Inter, Roboto, Helvetica, Arial, sans-serif' },
  shape: { borderRadius: 10 }
  // You can extend palette if you want a custom brand look
});

export default theme;
