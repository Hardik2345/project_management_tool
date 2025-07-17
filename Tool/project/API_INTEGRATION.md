# API Integration Documentation

This project now includes comprehensive API integration based on the Project Management Tool backend. The integration includes authentication, user management, project management, task management, and client management.

## API Services Overview

### 1. Authentication Service (`AuthService`)

The authentication service handles all user authentication operations:

```typescript
import { AuthService } from '../services';

// Sign up a new user
const signUpData = {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
  passwordConfirm: 'password123'
};
const response = await AuthService.signUp(signUpData);

// Sign in an existing user
const signInData = {
  email: 'john@example.com',
  password: 'password123'
};
const response = await AuthService.signIn(signInData);

// Sign out current user
await AuthService.signOut();

// Get current user profile
const userProfile = await AuthService.getCurrentUser();

// Update user profile
const formData = new FormData();
formData.append('name', 'John Smith');
formData.append('email', 'john.smith@example.com');
await AuthService.updateProfile(formData);

// Password management
await AuthService.forgotPassword({ email: 'john@example.com' });
await AuthService.resetPassword('token', { 
  password: 'newpassword', 
  passwordConfirm: 'newpassword' 
});
await AuthService.updatePassword({
  passwordCurrent: 'oldpassword',
  password: 'newpassword',
  passwordConfirm: 'newpassword'
});
```

### 2. User Service (`UserService`)

Manages user CRUD operations (Admin only):

```typescript
import { UserService } from '../services';

// Get all users (admin only)
const users = await UserService.getAllUsers();

// Get user by ID
const user = await UserService.getUserById('user-id');

// Create new user (admin only)
const newUser = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  role: 'team member'
};
await UserService.createUser(newUser);

// Update user
await UserService.updateUser('user-id', { role: 'manager' });

// Delete user
await UserService.deleteUser('user-id');

// Get user's tasks and projects
const userTasks = await UserService.getUserTasks('user-id');
const userProjects = await UserService.getUserProjects('user-id');
```

### 3. Project Service (`ProjectService`)

Handles project management operations:

```typescript
import { ProjectService } from '../services';

// Get all projects
const projects = await ProjectService.getAllProjects();

// Get project by ID
const project = await ProjectService.getProjectById('project-id');

// Create new project
const newProject = {
  name: 'Website Redesign',
  description: 'Complete overhaul of the company website',
  createdBy: 'user-id',
  priority: 'high',
  status: 'In Progress',
  deadline: '2025-12-31T00:00:00.000Z'
};
await ProjectService.createProject(newProject);

// Update project
await ProjectService.updateProject('project-id', { 
  status: 'Completed',
  priority: 'low'
});

// Delete project
await ProjectService.deleteProject('project-id');

// Filter projects
const filteredProjects = await ProjectService.getProjectsWithQuery({
  status: 'In Progress',
  priority: 'high'
});

// Get project statistics
const stats = await ProjectService.getProjectStats('project-id');
```

### 4. Task Service (`TaskService`)

Manages task operations:

```typescript
import { TaskService } from '../services';

// Get all tasks
const tasks = await TaskService.getAllTasks();

// Get task by ID
const task = await TaskService.getTaskById('task-id');

// Create new task
const newTask = {
  title: 'Create homepage mockup',
  description: 'Design a mockup for the new homepage',
  status: 'todo',
  priority: 'high',
  dueDate: '2025-08-15T00:00:00.000Z',
  assignedTo: 'user-id',
  project: 'project-id',
  estimatedHours: 8
};
await TaskService.createTask(newTask);

// Update task
await TaskService.updateTask('task-id', { 
  status: 'in-progress',
  priority: 'medium'
});

// Update task status specifically
await TaskService.updateTaskStatus('task-id', 'done');

// Delete task
await TaskService.deleteTask('task-id');

// Get tasks by project
const projectTasks = await TaskService.getTasksByProject('project-id');

// Get tasks by user
const userTasks = await TaskService.getTasksByUser('user-id');

// Filter tasks
const filteredTasks = await TaskService.getTasksWithQuery({
  status: 'in-progress',
  priority: 'high',
  assignedTo: 'user-id'
});

// Bulk update tasks
await TaskService.bulkUpdateTasks(['task-id-1', 'task-id-2'], {
  status: 'review',
  priority: 'medium'
});
```

### 5. Client Service (`ClientService`)

Handles client management:

```typescript
import { ClientService } from '../services';

// Get all clients
const clients = await ClientService.getAllClients();

// Get client by ID
const client = await ClientService.getClientById('client-id');

// Create new client
const newClient = {
  name: 'Acme Corporation',
  email: 'contact@acme.com',
  phone: '1234567890',
  company: 'Acme Inc.'
};
await ClientService.createClient(newClient);

// Update client
await ClientService.updateClient('client-id', { 
  email: 'new-contact@acme.com',
  phone: '0987654321'
});

// Delete client
await ClientService.deleteClient('client-id');

// Filter clients
const filteredClients = await ClientService.getClientsWithQuery({
  company: 'Acme Inc.'
});

// Get client statistics
const stats = await ClientService.getClientStats('client-id');
```

## Custom Hooks

### useApiAuth Hook

A comprehensive authentication hook that works with the API:

```typescript
import { useApiAuth } from '../hooks/useApiAuth';

function MyComponent() {
  const { 
    user, 
    loading, 
    error, 
    signIn, 
    signUp, 
    signOut, 
    updateProfile,
    clearError,
    isAuthenticated 
  } = useApiAuth();

  const handleSignIn = async () => {
    const result = await signIn({
      email: 'user@example.com',
      password: 'password123'
    });
    
    if (result.success) {
      console.log('Signed in successfully');
    } else {
      console.error('Sign in failed:', result.error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.name}!</p>
          <button onClick={signOut}>Sign Out</button>
        </div>
      ) : (
        <button onClick={handleSignIn}>Sign In</button>
      )}
    </div>
  );
}
```

### Enhanced useAuth Hook

The existing Supabase authentication hook has been enhanced to support API integration:

```typescript
import { useAuth } from '../hooks/useAuth';

function MyComponent() {
  const { user, profile, loading, signIn, signUp, signOut } = useAuth();

  // This hook now automatically sets up API tokens when users authenticate
  // It maintains compatibility with existing Supabase authentication
  // while adding support for the backend API integration
}
```

## Environment Configuration

Add these environment variables to your `.env` file:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api/v1

# Supabase Configuration (existing)
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Error Handling

All API services include comprehensive error handling:

```typescript
try {
  const projects = await ProjectService.getAllProjects();
  console.log('Projects:', projects);
} catch (error) {
  console.error('Failed to fetch projects:', error);
  // Error object includes:
  // - message: Human-readable error message
  // - status: HTTP status code
  // - data: Additional error data from server
}
```

## API Response Format

All API responses follow a consistent format:

```typescript
interface ApiResponse<T> {
  status: string;          // 'success' or 'error'
  data?: T;               // Response data
  token?: string;         // JWT token (for auth endpoints)
  results?: number;       // Number of results (for list endpoints)
  message?: string;       // Success/error message
}
```

## Authentication Flow

1. User authenticates via Supabase (existing flow)
2. Enhanced `useAuth` hook automatically checks for API tokens
3. If API token exists, it's set for subsequent API calls
4. API services can be used with proper authentication
5. Token is cleared when user logs out

## Usage in Components

```typescript
import React, { useEffect, useState } from 'react';
import { ProjectService, TaskService } from '../services';
import { ApiProject, ApiTask } from '../types';

function ProjectDashboard() {
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [tasks, setTasks] = useState<ApiTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsResponse, tasksResponse] = await Promise.all([
          ProjectService.getAllProjects(),
          TaskService.getAllTasks()
        ]);
        
        setProjects(projectsResponse.data?.projects || []);
        setTasks(tasksResponse.data?.tasks || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Projects: {projects.length}</h1>
      <h2>Tasks: {tasks.length}</h2>
      {/* Render your dashboard */}
    </div>
  );
}
```

## Backend Integration

Make sure your backend server is running on `http://localhost:3000` or update the `VITE_API_BASE_URL` environment variable accordingly.

The backend should support all the endpoints documented in the swagger documentation:
- Authentication endpoints (`/users/signup`, `/users/login`, etc.)
- User management endpoints (`/users/*`)
- Project endpoints (`/projects/*`)
- Task endpoints (`/tasks/*`)
- Client endpoints (`/clients/*`)

## Type Safety

All services are fully typed with TypeScript interfaces that match the swagger documentation. This ensures type safety throughout your application and provides excellent IDE support with autocomplete and error checking.
