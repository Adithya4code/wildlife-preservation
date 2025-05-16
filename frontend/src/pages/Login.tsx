import React from 'react';
import { Container, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
    const navigate = useNavigate();

    const handleSignIn = () => {
        // Add any auth logic here if needed
        navigate('/dashboard');
    };

    return (
        <Container maxWidth="sm" style={{ marginTop: '2rem' }}>
            <Typography variant="h4" gutterBottom>
                Login
            </Typography>
            <Button variant="contained" color="primary" onClick={handleSignIn}>
                Sign In
            </Button>
        </Container>
    );
};

export default Login;
