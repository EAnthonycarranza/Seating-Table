// File: components/GuestEditor.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Snackbar,
  Stack
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

function GuestEditor() {
  const [guests, setGuests] = useState([]);
  const [csvFile, setCsvFile] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newTableNumber, setNewTableNumber] = useState(1);

  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = () => {
    axios.get('/api/guests')
      .then(res => setGuests(res.data))
      .catch(err => console.error(err));
  };

  const handleAddGuest = () => {
    axios.post('/api/guests', {
      firstName: newFirstName.trim(),
      lastName: newLastName.trim(),
      tableNumber: newTableNumber
    })
      .then(() => {
        fetchGuests();
        setSnackbar({ open: true, message: 'Guest added' });
        setNewFirstName('');
        setNewLastName('');
        setNewTableNumber(1);
      })
      .catch(err => console.error(err));
  };

  const handleImport = () => {
    if (!csvFile) return;
    const form = new FormData();
    form.append('file', csvFile);
    axios.post('/api/guests/import-csv', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(res => {
        fetchGuests();
        setSnackbar({ open: true, message: `Imported ${res.data.count} guests` });
      })
      .catch(err => console.error(err));
  };

  // Updated export to download via blob and avoid navigating away
  const handleExport = () => {
    axios.get('/api/guests/export-csv', { responseType: 'blob' })
      .then((res) => {
        const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'guests.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch(err => console.error('Export failed:', err));
  };

  const handleFieldChange = (id, field, value) => {
    setGuests(prev => prev.map(g => g._id === id ? { ...g, [field]: value } : g));
  };

  const handleSaveAll = () => {
    const promises = guests.map(guest =>
      axios.put(`/api/guests/${guest._id}`, {
        firstName: guest.firstName,
        lastName: guest.lastName,
        tableNumber: guest.tableNumber
      })
    );
    Promise.all(promises)
      .then(() => {
        fetchGuests();
        setSnackbar({ open: true, message: 'All changes saved!' });
      })
      .catch(err => {
        console.error(err);
        setSnackbar({ open: true, message: 'Error saving changes' });
      });
  };

  const handleDelete = (id) => {
    axios.delete(`/api/guests/${id}`)
      .then(() => {
        fetchGuests();
        setSnackbar({ open: true, message: 'Guest deleted' });
      })
      .catch(err => console.error(err));
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Guest Manager</Typography>

      {/* New Guest Form */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Add New Guest</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="First Name"
            value={newFirstName}
            onChange={e => setNewFirstName(e.target.value)}
            variant="outlined"
          />
          <TextField
            label="Last Name"
            value={newLastName}
            onChange={e => setNewLastName(e.target.value)}
            variant="outlined"
          />
          <TextField
            label="Table #"
            type="number"
            value={newTableNumber}
            onChange={e => setNewTableNumber(Math.max(1, parseInt(e.target.value, 10) || 1))}
            variant="outlined"
            inputProps={{ min: 1 }}
            sx={{ width: 100 }}
          />
          <Button
            variant="contained"
            onClick={handleAddGuest}
            disabled={!newFirstName.trim() || !newLastName.trim()}
          >Add Guest</Button>
        </Stack>
      </Paper>

      {/* CSV Controls */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3}>
        <Button variant="outlined" component="label">
          Upload CSV
          <input
            type="file"
            accept=".csv"
            hidden
            onChange={e => setCsvFile(e.target.files[0])}
          />
        </Button>
        <Button
          variant="contained"
          onClick={handleImport}
          disabled={!csvFile}
        >Import</Button>
        <Button variant="outlined" onClick={handleExport}>Export CSV</Button>
      </Stack>

      {/* Save All Changes */}
      <Button variant="contained" color="primary" onClick={handleSaveAll} sx={{ mb: 2 }}>
        Save All Changes
      </Button>

      {/* Guests Table */}
      <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>First Name</TableCell>
              <TableCell>Last Name</TableCell>
              <TableCell>Table #</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {guests.map(guest => (
              <TableRow key={guest._id} hover>
                <TableCell>
                  <TextField
                    value={guest.firstName}
                    onChange={e => handleFieldChange(guest._id, 'firstName', e.target.value)}
                    variant="standard"
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    value={guest.lastName}
                    onChange={e => handleFieldChange(guest._id, 'lastName', e.target.value)}
                    variant="standard"
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={guest.tableNumber}
                    onChange={e => handleFieldChange(guest._id, 'tableNumber', parseInt(e.target.value, 10) || '')}
                    variant="standard"
                    inputProps={{ min: 1 }}
                    sx={{ width: 80 }}
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton color="error" onClick={() => handleDelete(guest._id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        message={snackbar.message}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Box>
  );
}

export default GuestEditor;