import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import { format, subHours, parseISO } from 'date-fns';
import { tasks } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Assignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAssignmentsAndReminders = async () => {
    try {
      const [assignmentsResponse, remindersResponse] = await Promise.all([
        tasks.getAssignments(),
        tasks.getReminders(),
      ]);
      if (Array.isArray(assignmentsResponse.data)) {
        setAssignments(assignmentsResponse.data);
      } else {
        setError('Invalid response format from assignments endpoint');
      }
      if (Array.isArray(remindersResponse.data)) {
        setReminders(remindersResponse.data);
      } else {
        setError('Invalid response format from reminders endpoint');
      }
    } catch (error) {
      setError('Failed to fetch assignments or reminders');
    }
  };

  useEffect(() => {
    fetchAssignmentsAndReminders();
  }, []);

  // Add a sample assignment with deadline in 1 minute
  const sampleAssignment = {
    id: 1,
    course: 'SAMPLE101: Sample Course',
    name: 'Sample Assignment (1 minute from now)',
    deadline: new Date(Date.now() + 1 * 60 * 1000).toISOString(),
    points_possible: 100,
    plannable_id: 1, // Event ID is 1 for the sample assignment
  };

  const allAssignments = [sampleAssignment, ...assignments];

  const handleScheduleNotification = async (assignment) => {
    setSelectedAssignment(assignment);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedAssignment(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const isSample = selectedAssignment && selectedAssignment.id === 1;
    const taskData = {
      course_name: selectedAssignment.course || '',
      assignment_name: selectedAssignment.name || '',
      deadline: isSample
        ? new Date(Date.now() + 1 * 60 * 1000).toISOString()
        : selectedAssignment.deadline,
      grade: selectedAssignment.points_possible,
      plannable_id: selectedAssignment.plannable_id,
    };
    try {
      if (isSample) {
        await tasks.sendFakeNotification(taskData);
      } else {
        await tasks.scheduleNotification(taskData);
      }
      setSuccess('Notification scheduled successfully');
      fetchAssignmentsAndReminders();
      handleClose();
    } catch (error) {
      setError('Failed to schedule notification');
    }
  };

  const handleDeleteReminder = async (task_id) => {
    try {
      await tasks.deleteReminder(task_id);
      // Refresh reminders after deletion
      fetchAssignmentsAndReminders();
    } catch (error) {
      setError('Failed to delete reminder');
    }
  };

  if (user && !user.is_verified) {
    return (
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Account Not Verified
          </Typography>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Please verify your email address to access assignments and reminders.
          </Alert>
        </Paper>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Upcoming Assignments
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

      <TableContainer component={Paper} sx={{ mt: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Event ID</TableCell>
              <TableCell>Course</TableCell>
              <TableCell>Assignment</TableCell>
              <TableCell>Deadline</TableCell>
              <TableCell>Points Possible</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {allAssignments && allAssignments.length > 0 ? (
              allAssignments.map((assignment, index) => (
                <TableRow key={assignment.id || index}>
                  <TableCell>{assignment.plannable_id ?? 'N/A'}</TableCell>
                  <TableCell>{assignment.course || 'N/A'}</TableCell>
                  <TableCell>{assignment.name || 'N/A'}</TableCell>
                  <TableCell>
                    {assignment.deadline 
                      ? format(new Date(assignment.deadline), 'PPp')
                      : 'N/A'}
                  </TableCell>
                  <TableCell>{assignment.points_possible ?? 'N/A'}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleScheduleNotification(assignment)}
                    >
                      Schedule Notification
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No assignments found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Reminders Table */}
      <Typography variant="h5" component="h2" sx={{ mt: 6, mb: 2 }}>
        Active Reminders
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Event ID</TableCell>
              <TableCell>Course</TableCell>
              <TableCell>Assignment</TableCell>
              <TableCell>Deadline</TableCell>
              <TableCell>Task ID</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reminders && reminders.length > 0 ? (
              reminders.map((reminder, idx) => (
                <TableRow key={reminder.task_id || idx}>
                  <TableCell>{reminder.plannable_id ?? 'N/A'}</TableCell>
                  <TableCell>{reminder.course_name ?? 'N/A'}</TableCell>
                  <TableCell>{reminder.assignment_name ?? 'N/A'}</TableCell>
                  <TableCell>
                    {reminder.deadline
                      ? format(new Date(reminder.deadline), 'PPp')
                      : 'N/A'}
                  </TableCell>
                  <TableCell>{reminder.task_id ?? 'N/A'}</TableCell>
                  <TableCell>
                    <Button variant="outlined" color="error" onClick={() => handleDeleteReminder(reminder.task_id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No active reminders
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Schedule Notification</DialogTitle>
          <DialogContent>
            <Typography>
              {selectedAssignment && selectedAssignment.deadline ? (
                <>You will get notification at: <b>{format(subHours(parseISO(selectedAssignment.deadline), 1), 'PPpp')}</b></>
              ) : (
                'No deadline set.'
              )}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Schedule
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default Assignments; 