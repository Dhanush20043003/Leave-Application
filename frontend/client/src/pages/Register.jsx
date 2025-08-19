import { Box, Button, Card, CardContent, MenuItem, TextField, Typography, Alert } from "@mui/material";
import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    role: "EMPLOYEE" // default role
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); // Clear error when user types
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Client-side validation
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError("Please fill in all required fields");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    const result = await register(form);
    
    if (result.ok) {
      setSuccess(result.message);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } else {
      setError(result.message);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 2 }}>
      <Card sx={{ width: 420 }}>
        <CardContent component="form" onSubmit={submit}>
          <Typography variant="h5" mb={2}>
            Register
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <TextField 
            name="name" 
            label="Full Name *" 
            value={form.name} 
            onChange={handleChange} 
            fullWidth 
            margin="normal"
            required
          />
          
          <TextField 
            name="email" 
            label="Email *" 
            type="email" 
            value={form.email} 
            onChange={handleChange} 
            fullWidth 
            margin="normal"
            required
          />
          
          <TextField 
            name="password" 
            label="Password *" 
            type="password" 
            value={form.password} 
            onChange={handleChange} 
            fullWidth 
            margin="normal"
            required
            helperText="Minimum 6 characters"
          />
          
          <TextField 
            name="department" 
            label="Department" 
            value={form.department} 
            onChange={handleChange} 
            fullWidth 
            margin="normal"
            placeholder="e.g., IT, HR, Finance"
          />

          <TextField
            select
            name="role"
            label="Role"
            value={form.role}
            onChange={handleChange}
            fullWidth
            margin="normal"
          >
            <MenuItem value="EMPLOYEE">Employee</MenuItem>
            <MenuItem value="MANAGER">Manager</MenuItem>
            <MenuItem value="ADMIN">Admin</MenuItem>
          </TextField>

          <Button 
            type="submit" 
            fullWidth 
            sx={{ mt: 2 }} 
            variant="contained"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </Button>
          
          <Typography variant="body2" mt={2} textAlign="center">
            Already have an account? <Link to="/login">Login here</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}