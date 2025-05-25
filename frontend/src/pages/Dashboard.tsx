import React, { useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartOptions,
} from 'chart.js';
import axios from 'axios';
import {Bar} from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [selectedAlert, setSelectedAlert] = useState<any>(null);
    const [selectedCamera, setSelectedCamera] = useState<string>('');
    const [cameras, setCameras] = useState<any[]>([]);
    const [alerts, setAlerts] = useState<any[]>([]);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const [chartData, setChartData] = useState({
        labels: [] as string[],
        datasets: [{
            label: 'Detections Today',
            data: [] as number[],
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }],
    });
    const [feedOpen, setFeedOpen] = useState(false);

    const chartOptions: ChartOptions<'bar'> = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Detection Statistics' },
        },
    };

    // Fetch cameras and initial data
    useEffect(() => {
        axios.get('http://localhost:8000/cameras/').then((response) => {
            setCameras(response.data);
            if (response.data.length > 0) {
                setSelectedCamera(response.data[0].id.toString());
            }
            setChartData({
                labels: response.data.map((cam: any) => cam.name),
                datasets: [{
                    label: 'Detections Today',
                    data: response.data.map(() => 0),
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }],
            });
        });
    }, []);

    const handleOpen = (alert: any) => {
        setSelectedAlert(alert);
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    const handleFeedOpen = () => {
        if (selectedCamera) {
            setFeedOpen(true);
            // Trigger YOLO detection
            const camera = cameras.find((cam) => cam.id.toString() === selectedCamera);
            if (camera) {
                axios.post('http://localhost:8000/cameras/detect/', { camera_id: parseInt(selectedCamera) }).then((response) => {
                    setProcessedImage(response.data.image);
                    if (response.data.detections.length > 0) {
                        const newAlerts = response.data.detections.map((det: any, index: number) => ({
                            id: alerts.length + index + 1,
                            time: new Date().toISOString(),
                            camera: response.data.camera_name,
                            type: det.label,
                            details: `Confidence: ${det.confidence}`,
                        }));
                        setAlerts([...newAlerts, ...alerts]);
                        setChartData((prev) => {
                            const newData = [...prev.datasets[0].data];
                            const index = cameras.findIndex((cam) => cam.id.toString() === selectedCamera);
                            if (index !== -1) newData[index] = (newData[index] || 0) + response.data.total;
                            return { ...prev, datasets: [{ ...prev.datasets[0], data: newData }] };
                        });
                    }
                }).catch((error) => {
                    console.error('Detection error:', error);
                });
            }
        }
    };

    const handleFeedClose = () => {
        setFeedOpen(false);
        setProcessedImage(null);
    };

    return (
        <Container maxWidth="lg" style={{ marginTop: '2rem' }}>
            <Typography variant="h4" gutterBottom>
                Poacher Detection Dashboard
            </Typography>

            <Box display="flex" flexWrap="wrap" gap={3}>
                {/* Camera Selection */}
                <Box flex="1 1 30%">
                    <Card elevation={3}>
                        <CardContent>
                            <FormControl fullWidth style={{ marginBottom: '1rem' }}>
                                <InputLabel id="camera-select-label">Select Camera</InputLabel>
                                <Select
                                    labelId="camera-select-label"
                                    value={selectedCamera}
                                    label="Select Camera"
                                    onChange={(e) => setSelectedCamera(e.target.value as string)}
                                >
                                    {cameras.map((camera) => (
                                        <MenuItem key={camera.id} value={camera.id.toString()}>
                                            {camera.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Button variant="contained" fullWidth onClick={handleFeedOpen} disabled={!selectedCamera}>
                                View Feed
                            </Button>
                        </CardContent>
                    </Card>
                </Box>

                {/* Recent Alerts */}
                <Box flex="1 1 30%">
                    <Card elevation={3}>
                        <CardContent>
                            <Typography variant="h6">Recent Alerts</Typography>
                            {alerts.map((alert) => (
                                <div key={alert.id} style={{ marginBottom: '1rem', padding: '0.5rem', borderBottom: '1px solid #eee' }}>
                                    <Typography variant="body1">
                                        {new Date(alert.time).toLocaleString()} - {alert.camera}: {alert.type}
                                    </Typography>
                                    <Button variant="outlined" size="small" onClick={() => handleOpen(alert)}>
                                        View Details
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </Box>

                {/* Detection Statistics */}
                <Box flex="1 1 30%">
                    <Card elevation={3}>
                        <CardContent>
                            <Bar data={chartData} options={chartOptions} />
                        </CardContent>
                    </Card>
                </Box>
            </Box>

            {/* Modal for Alert Details */}
            <Modal open={open} onClose={handleClose}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 400,
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: 4,
                        borderRadius: '8px',
                    }}
                >
                    {selectedAlert && (
                        <>
                            <Typography variant="h6">{selectedAlert.type}</Typography>
                            <Typography variant="body1">Time: {new Date(selectedAlert.time).toLocaleString()}</Typography>
                            <Typography variant="body1">Camera: {selectedAlert.camera}</Typography>
                            <Typography variant="body2" sx={{ mt: 2 }}>
                                Details: {selectedAlert.details}
                            </Typography>
                            <Button variant="contained" onClick={handleClose} sx={{ mt: 2 }}>
                                Close
                            </Button>
                        </>
                    )}
                </Box>
            </Modal>

            {/* Modal for Camera Feed */}
            <Modal open={feedOpen} onClose={handleFeedClose}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '80%',
                        maxWidth: '1200px',
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: 4,
                        borderRadius: '8px',
                    }}
                >
                    {selectedCamera && (
                        <>
                            <Typography variant="h5" gutterBottom>
                                {cameras.find((cam) => cam.id.toString() === selectedCamera)?.name} Feed
                            </Typography>
                            {processedImage ? (
                                <img
                                    src={processedImage}
                                    alt="Processed Camera Feed"
                                    style={{ width: '100%', height: 'auto', borderRadius: '4px' }}
                                />
                            ) : (
                                <Typography>Loading detection results...</Typography>
                            )}
                            <Button variant="contained" onClick={handleFeedClose} sx={{ mt: 2 }}>
                                Close
                            </Button>
                        </>
                    )}
                </Box>
            </Modal>
        </Container>
    );
};

export default Dashboard;