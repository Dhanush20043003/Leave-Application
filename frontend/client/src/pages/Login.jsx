import { Box, Button, Card, CardContent, TextField, Typography, Alert } from "@mui/material";
import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const { login, loading, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter both email and password");
      return;
    }

    const res = await login(email, password);
    if (!res.ok) {
      setError(res.message);
    } else {
      // Navigation will be handled by the useEffect above
      console.log('Login successful, redirecting...');
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 2 }}>
      <Card sx={{ width: 380 }}>
        <CardContent component="form" onSubmit={onSubmit}>
          <Typography variant="h5" mb={2}>Sign in</Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(""); // Clear error when user types
            }}
            required
          />
          
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(""); // Clear error when user types
            }}
            required
          />
          
          <Button 
            type="submit" 
            fullWidth 
            sx={{ mt: 2 }} 
            disabled={loading} 
            variant="contained"
          >
            {loading ? "Signing in..." : "Login"}
          </Button>
          
          <Typography variant="body2" mt={2} textAlign="center">
            Don't have an account? <Link to="/register">Register here</Link>
          </Typography>
          
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="caption" display="block" gutterBottom>
              <strong>Test Accounts:</strong>
            </Typography>
            <Typography variant="caption" display="block">
              Admin: admin@leo.com / admin123
            </Typography>
            <Typography variant="caption" display="block">
              (Create admin first using seed-admin endpoint)
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}