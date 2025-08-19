import { Box, Button, Card, CardContent, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { Link } from "react-router-dom";

export default function Login() {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    const res = await login(email, password);
    if (!res.ok) setError(res.message);
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 2 }}>
      <Card sx={{ width: 380 }}>
        <CardContent component="form" onSubmit={onSubmit}>
          <Typography variant="h5" mb={2}>Sign in</Typography>
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <Typography color="error" variant="body2" mt={1}>{error}</Typography>}
          <Button type="submit" fullWidth sx={{ mt: 2 }} disabled={loading} variant="contained">
            Login
          </Button>
          <Typography variant="body2" mt={2}>
            Don’t have an account? <Link to="/register">Register here</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
