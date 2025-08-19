import { Box, Button, Card, CardContent, MenuItem, TextField, Typography } from "@mui/material";
import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    role: "EMPLOYEE" // default role
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", form);
      alert("Registration successful! Please log in.");
      navigate("/login");
    } catch (e) {
      setError(e.response?.data?.message || "Failed to register");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 2 }}>
      <Card sx={{ width: 420 }}>
        <CardContent component="form" onSubmit={submit}>
          <Typography variant="h5" mb={2}>
            Register
          </Typography>
          <TextField name="name" label="Full Name" value={form.name} onChange={handleChange} fullWidth margin="normal" />
          <TextField name="email" label="Email" type="email" value={form.email} onChange={handleChange} fullWidth margin="normal" />
          <TextField name="password" label="Password" type="password" value={form.password} onChange={handleChange} fullWidth margin="normal" />
          <TextField name="department" label="Department" value={form.department} onChange={handleChange} fullWidth margin="normal" />

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
            <MenuItem value="ADMIN">Admin</MenuItem>
          </TextField>

          {error && (
            <Typography color="error" variant="body2" mt={1}>
              {error}
            </Typography>
          )}
          <Button type="submit" fullWidth sx={{ mt: 2 }} variant="contained">
            Register
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
