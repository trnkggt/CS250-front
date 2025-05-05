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
  IconButton,
  Stack,
} from '@mui/material';
import { format, subHours, parseISO } from 'date-fns';
import { tasks } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import CloseIcon from '@mui/icons-material/Close';

const Assignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAssignmentsAndReminders = async () => {
    let assignmentsData = [];
    let remindersData = [];
    let errorMsg = '';
    try {
      const assignmentsResponse = await tasks.getAssignments();
      if (assignmentsResponse.data && Array.isArray(assignmentsResponse.data)) {
        assignmentsData = assignmentsResponse.data;
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        errorMsg = 'Token is not set.';
      }
    }
    try {
      const remindersResponse = await tasks.getReminders();
      if (remindersResponse.data && Array.isArray(remindersResponse.data)) {
        remindersData = remindersResponse.data;
      } else {
        errorMsg += (errorMsg ? ' ' : '') + 'Invalid response format from reminders endpoint.';
      }
    } catch (error) {
      errorMsg += (errorMsg ? ' ' : '') + 'Failed to fetch reminders.';
    }
    setAssignments(assignmentsData);
    setReminders(remindersData);
    setError(errorMsg.trim());
  };

  useEffect(() => {
    fetchAssignmentsAndReminders();
  }, []);

  const sampleAssignment = {
    id: 1,
    course: 'SAMPLE101: Sample Course',
    name: 'Sample Assignment (1 minute from now)',
    deadline: new Date(Date.now() + 1 * 60 * 1000).toISOString(),
    points_possible: 100,
    plannable_id: 1,
  };

  const sampleInReminders = reminders.some(r => r.plannable_id === sampleAssignment.plannable_id);
  const assignmentsWithoutSample = assignments.filter(a => a.plannable_id !== sampleAssignment.plannable_id);
  const allAssignments = [sampleAssignment, ...assignmentsWithoutSample];
  const isAssignmentInReminders = (plannable_id) => reminders.some(r => r.plannable_id === plannable_id);

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
      const reminderToDelete = reminders.find(r => r.task_id === task_id);
      await tasks.deleteReminder(task_id);
      if (reminderToDelete && reminderToDelete.plannable_id === sampleAssignment.plannable_id) {
        setAssignments(prev => [...prev, sampleAssignment]);
      }
      fetchAssignmentsAndReminders();
    } catch (error) {
      setError('Failed to delete reminder');
    }
  };

  if (user && !user.is_verified) {
    return (
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, mt: { xs: 4, sm: 8 } }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom sx={{ fontSize: { xs: '1.25rem', sm: '2rem' } }}>
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
    <Container maxWidth="lg" sx={{ px: { xs: 0.5, sm: 2 } }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
        Upcoming Assignments
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ mt: 4, overflowX: 'auto' }}>
        <Table size="small">
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
                      sx={{ minWidth: { xs: 32, sm: 120 }, fontSize: { xs: '0.75rem', sm: '1rem' }, px: { xs: 1, sm: 2 } }}
                      disabled={isAssignmentInReminders(assignment.plannable_id)}
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

      <Typography variant="h5" component="h2" sx={{ mt: 6, mb: 2, fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>
        Active Reminders
      </Typography>
      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table size="small">
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
                    <IconButton aria-label="delete" color="error" onClick={() => handleDeleteReminder(reminder.task_id)}>
                      <CloseIcon />
                    </IconButton>
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

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
        <form onSubmit={handleSubmit}>
          <DialogTitle>Schedule Notification</DialogTitle>
          <DialogContent>
            <Typography sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              {selectedAssignment && selectedAssignment.deadline ? (
                <>You will get notification at: <b>{format(subHours(parseISO(selectedAssignment.deadline), 1), 'PPpp')}</b></>
              ) : (
                'No deadline set.'
              )}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: '100%' }}>
              <Button onClick={handleClose} fullWidth>Cancel</Button>
              <Button type="submit" variant="contained" color="primary" fullWidth>
                Schedule
              </Button>
            </Stack>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default Assignments; 