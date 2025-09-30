import React from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Switch,
    FormControlLabel,
    Alert,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Save as SaveIcon,
} from '@mui/icons-material';

export default function UserEdit({ user, roles, universities, departments }) {
    const { data, setData, errors, processing, put } = useForm({
        university_id: user.university_id || '',
        department_id: user.department_id || '',
        employee_id: user.employee_id || '',
        username: user.username || '',
        email: user.email || '',
        name: user.name || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        position: user.position || '',
        role: user.role || 'staff',
        is_active: user.is_active ?? true,
        hire_date: user.hire_date || '',
        termination_date: user.termination_date || '',
        timezone: user.timezone || 'UTC',
        language: user.language || 'en',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('users.update', user.user_id));
    };

    return (
        <>
            <Head title={`Edit ${user.name}`} />

            <Box sx={{ flexGrow: 1, p: 3 }}>
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => router.get(route('users.index'))}
                        sx={{ mb: 2 }}
                    >
                        Back to Users
                    </Button>
                    <Typography variant="h4" gutterBottom fontWeight="bold">
                        Edit User: {user.name}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Update user information and permissions
                    </Typography>
                </Box>

                <Card>
                    <CardContent>
                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={3}>
                                {/* Basic Information */}
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="h6" gutterBottom sx={{ borderBottom: 1, borderColor: 'divider', pb: 1 }}>
                                        Basic Information
                                    </Typography>
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Username *"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        error={!!errors.name}
                                        helperText={errors.name}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Email *"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        error={!!errors.email}
                                        helperText={errors.email}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="First Name"
                                        value={data.first_name}
                                        onChange={(e) => setData('first_name', e.target.value)}
                                        error={!!errors.first_name}
                                        helperText={errors.first_name}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Last Name"
                                        value={data.last_name}
                                        onChange={(e) => setData('last_name', e.target.value)}
                                        error={!!errors.last_name}
                                        helperText={errors.last_name}
                                    />
                                </Grid>

                                {/* Employment Information */}
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="h6" gutterBottom sx={{ borderBottom: 1, borderColor: 'divider', pb: 1, mt: 2 }}>
                                        Employment Information
                                    </Typography>
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Employee ID"
                                        value={data.employee_id}
                                        onChange={(e) => setData('employee_id', e.target.value)}
                                        error={!!errors.employee_id}
                                        helperText={errors.employee_id}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Position"
                                        value={data.position}
                                        onChange={(e) => setData('position', e.target.value)}
                                        error={!!errors.position}
                                        helperText={errors.position}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <FormControl fullWidth>
                                        <InputLabel>University</InputLabel>
                                        <Select
                                            value={data.university_id}
                                            label="University"
                                            onChange={(e) => setData('university_id', e.target.value)}
                                        >
                                            <MenuItem value="">Select University</MenuItem>
                                            {universities.map((uni) => (
                                                <MenuItem key={uni.university_id} value={uni.university_id}>
                                                    {uni.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <FormControl fullWidth>
                                        <InputLabel>Department</InputLabel>
                                        <Select
                                            value={data.department_id}
                                            label="Department"
                                            onChange={(e) => setData('department_id', e.target.value)}
                                        >
                                            <MenuItem value="">Select Department</MenuItem>
                                            {departments.map((dept) => (
                                                <MenuItem key={dept.department_id} value={dept.department_id}>
                                                    {dept.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {/* Security & Role */}
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="h6" gutterBottom sx={{ borderBottom: 1, borderColor: 'divider', pb: 1, mt: 2 }}>
                                        Security & Role
                                    </Typography>
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <FormControl fullWidth>
                                        <InputLabel>Role *</InputLabel>
                                        <Select
                                            value={data.role}
                                            label="Role *"
                                            onChange={(e) => setData('role', e.target.value)}
                                            error={!!errors.role}
                                        >
                                            {roles.map((role) => (
                                                <MenuItem key={role} value={role}>
                                                    {role.replace(/_/g, ' ')}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={data.is_active}
                                                onChange={(e) => setData('is_active', e.target.checked)}
                                            />
                                        }
                                        label="Active User"
                                        sx={{ mt: 2 }}
                                    />
                                </Grid>

                                {/* Additional Information */}
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="h6" gutterBottom sx={{ borderBottom: 1, borderColor: 'divider', pb: 1, mt: 2 }}>
                                        Additional Information
                                    </Typography>
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Phone"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        error={!!errors.phone}
                                        helperText={errors.phone}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Hire Date"
                                        type="date"
                                        InputLabelProps={{ shrink: true }}
                                        value={data.hire_date}
                                        onChange={(e) => setData('hire_date', e.target.value)}
                                        error={!!errors.hire_date}
                                        helperText={errors.hire_date}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Termination Date"
                                        type="date"
                                        InputLabelProps={{ shrink: true }}
                                        value={data.termination_date}
                                        onChange={(e) => setData('termination_date', e.target.value)}
                                        error={!!errors.termination_date}
                                        helperText={errors.termination_date}
                                    />
                                </Grid>

                                {/* Actions */}
                                <Grid size={{ xs: 12 }} sx={{ mt: 3 }}>
                                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                        <Button
                                            variant="outlined"
                                            onClick={() => router.get(route('users.index'))}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            startIcon={<SaveIcon />}
                                            disabled={processing}
                                        >
                                            Update User
                                        </Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </form>
                    </CardContent>
                </Card>
            </Box>
        </>
    );
}