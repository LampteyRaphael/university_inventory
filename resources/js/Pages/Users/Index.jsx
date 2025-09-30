import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    Chip,
    IconButton,
    Menu,
    MenuItem,
    TextField,
    InputAdornment,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    Switch,
    FormControlLabel,
    Paper,
    Alert,
    Stack,
} from '@mui/material';
import {
    DataGrid,
    GridToolbar,
    gridClasses,
    gridPageCountSelector,
    gridPageSelector,
    useGridApiContext,
    useGridSelector,
} from '@mui/x-data-grid';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    MoreVert as MoreVertIcon,
    Search as SearchIcon,
    ImportExport as ImportExportIcon,
    Person as PersonIcon,
    Group as GroupIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
} from '@mui/icons-material';
import { Pagination } from '@mui/material';

function CustomPagination() {
    const apiRef = useGridApiContext();
    const page = useGridSelector(apiRef, gridPageSelector);
    const pageCount = useGridSelector(apiRef, gridPageCountSelector);

    return (
        <Pagination
            color="primary"
            count={pageCount}
            page={page + 1}
            onChange={(event, value) => apiRef.current.setPage(value - 1)}
        />
    );
}

export default function UserIndex({ users, filters, roles, universities, departments }) {
    const [search, setSearch] = useState(filters.search || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || '');
    const [activeFilter, setActiveFilter] = useState(filters.is_active || '');
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [actionMenu, setActionMenu] = useState({ anchor: null, user: null });

    const { data, setData, post, processing } = useForm({
        search: filters.search || '',
        role: filters.role || '',
        is_active: filters.is_active || '',
    });

    const handleSearch = () => {
        router.get('/users', {
            search: data.search,
            role: data.role,
            is_active: data.is_active,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleReset = () => {
        setData({
            search: '',
            role: '',
            is_active: '',
        });
        router.get('/users');
    };

    const handleDelete = (user) => {
        setSelectedUser(user);
        setDeleteDialog(true);
    };

    const confirmDelete = () => {
        router.delete(route('users.destroy', selectedUser.user_id), {
            onSuccess: () => setDeleteDialog(false),
        });
    };

    const handleAssignRole = (userId, newRole) => {
        router.post(route('users.assign-role', userId), { role: newRole });
    };

    const columns = [
        {
            field: 'employee_id',
            headerName: 'Employee ID',
            width: 130,
            renderCell: (params) => params.value || '-',
        },
        {
            field: 'name',
            headerName: 'Username',
            width: 150,
        },
        {
            field: 'full_name',
            headerName: 'Full Name',
            width: 200,
            valueGetter: (params) => {
                const user = params.row;
                return user.first_name && user.last_name 
                    ? `${user.first_name} ${user.last_name}`
                    : user.name;
            },
        },
        {
            field: 'email',
            headerName: 'Email',
            width: 250,
        },
        {
            field: 'role',
            headerName: 'Role',
            width: 180,
            renderCell: (params) => (
                <Chip
                    label={params.value.replace(/_/g, ' ')}
                    color={
                        params.value === 'super_admin' ? 'error' :
                        params.value === 'inventory_manager' ? 'warning' :
                        params.value === 'department_head' ? 'info' : 'default'
                    }
                    size="small"
                />
            ),
        },
        {
            field: 'position',
            headerName: 'Position',
            width: 150,
            renderCell: (params) => params.value || '-',
        },
        {
            field: 'is_active',
            headerName: 'Status',
            width: 120,
            renderCell: (params) => (
                <Chip
                    icon={params.value ? <CheckCircleIcon /> : <CancelIcon />}
                    label={params.value ? 'Active' : 'Inactive'}
                    color={params.value ? 'success' : 'error'}
                    variant="outlined"
                    size="small"
                />
            ),
        },
        {
            field: 'last_login_at',
            headerName: 'Last Login',
            width: 180,
            renderCell: (params) => params.value 
                ? new Date(params.value).toLocaleDateString()
                : 'Never',
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 120,
            sortable: false,
            renderCell: (params) => {
                const user = params.row;
                return (
                    <IconButton
                        size="small"
                        onClick={(e) => setActionMenu({ anchor: e.currentTarget, user })}
                    >
                        <MoreVertIcon />
                    </IconButton>
                );
            },
        },
    ];

    const stats = [
        {
            label: 'Total Users',
            value: users.total,
            icon: <GroupIcon />,
            color: 'primary.main',
        },
        {
            label: 'Active Users',
            value: users.data.filter(u => u.is_active).length,
            icon: <CheckCircleIcon />,
            color: 'success.main',
        },
        {
            label: 'Admin Users',
            value: users.data.filter(u => u.role === 'super_admin').length,
            icon: <PersonIcon />,
            color: 'warning.main',
        },
        {
            label: 'Inactive Users',
            value: users.data.filter(u => !u.is_active).length,
            icon: <CancelIcon />,
            color: 'error.main',
        },
    ];

    return (
        <>
            <Head title="User Management" />

            <Box sx={{ flexGrow: 1, p: 3 }}>
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" gutterBottom fontWeight="bold">
                        User Management
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage system users, roles, and permissions
                    </Typography>
                </Box>

                {/* Quick Stats */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {stats?.map((stat, index) => (
                        <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
                            <Card sx={{ bgcolor: stat.color, color: 'white' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Box>
                                            <Typography variant="h3" fontWeight="bold">
                                                {stat.value}
                                            </Typography>
                                            <Typography variant="body2">
                                                {stat.label}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ fontSize: 40, opacity: 0.8 }}>
                                            {stat.icon}
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* Filters and Actions */}
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Grid container spacing={2} alignItems="center">
                            <Grid size={{ xs: 12, md: 3 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Search users..."
                                    value={data.search}
                                    onChange={(e) => setData('search', e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 2 }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Role</InputLabel>
                                    <Select
                                        value={data.role}
                                        label="Role"
                                        onChange={(e) => setData('role', e.target.value)}
                                    >
                                        <MenuItem value="">All Roles</MenuItem>
                                        {roles.map((role) => (
                                            <MenuItem key={role} value={role}>
                                                {role.replace(/_/g, ' ')}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, md: 2 }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        value={data.is_active}
                                        label="Status"
                                        onChange={(e) => setData('is_active', e.target.value)}
                                    >
                                        <MenuItem value="">All Status</MenuItem>
                                        <MenuItem value="active">Active</MenuItem>
                                        <MenuItem value="inactive">Inactive</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, md: 5 }} sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                <Button
                                    variant="outlined"
                                    startIcon={<ImportExportIcon />}
                                    onClick={() => document.getElementById('import-file').click()}
                                >
                                    Import
                                </Button>
                                <input
                                    type="file"
                                    id="import-file"
                                    style={{ display: 'none' }}
                                    onChange={(e) => {
                                        if (e.target.files[0]) {
                                            router.post(route('users.import'), {
                                                file: e.target.files[0],
                                            }, {
                                                forceFormData: true,
                                            });
                                        }
                                    }}
                                />
                                <Button
                                    variant="outlined"
                                    startIcon={<ImportExportIcon />}
                                    onClick={() => window.open(route('users.export'))}
                                >
                                    Export
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={() => router.get(route('users.create'))}
                                >
                                    Add User
                                </Button>
                                <Button variant="outlined" onClick={handleSearch}>
                                    Apply
                                </Button>
                                <Button variant="text" onClick={handleReset}>
                                    Reset
                                </Button>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Data Grid */}
                <Card>
                    <CardContent sx={{ p: 0 }}>
                        <Box sx={{ height: 600, width: '100%' }}>
                            <DataGrid
                                rows={users.data}
                                columns={columns}
                                pagination
                                pageSize={10}
                                rowsPerPageOptions={[10, 25, 50]}
                                components={{
                                    Toolbar: GridToolbar,
                                    Pagination: CustomPagination,
                                }}
                                componentsProps={{
                                    toolbar: {
                                        showQuickFilter: true,
                                        quickFilterProps: { debounceMs: 500 },
                                    },
                                }}
                                sx={{
                                    border: 0,
                                    [`& .${gridClasses.cell}:focus, & .${gridClasses.cell}:focus-within`]: {
                                        outline: 'none',
                                    },
                                    [`& .${gridClasses.columnHeader}:focus, & .${gridClasses.columnHeader}:focus-within`]: {
                                        outline: 'none',
                                    },
                                }}
                            />
                        </Box>
                    </CardContent>
                </Card>
            </Box>

            {/* Action Menu */}
            <Menu
                anchorEl={actionMenu.anchor}
                open={Boolean(actionMenu.anchor)}
                onClose={() => setActionMenu({ anchor: null, user: null })}
            >
                <MenuItem
                    onClick={() => {
                        router.get(route('users.edit', actionMenu.user.user_id));
                        setActionMenu({ anchor: null, user: null });
                    }}
                >
                    <EditIcon sx={{ mr: 1 }} /> Edit
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        handleDelete(actionMenu.user);
                        setActionMenu({ anchor: null, user: null });
                    }}
                >
                    <DeleteIcon sx={{ mr: 1 }} /> Delete
                </MenuItem>
            </Menu>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete user "{selectedUser?.name}"? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}