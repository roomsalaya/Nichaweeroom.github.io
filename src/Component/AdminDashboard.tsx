import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import Navbar from './Navbar';
import './AdminDashboard.css';
import { Row, Col, Card, Progress, Spin, message as AntMessage } from 'antd'; // Import message from Ant Design
import { PieChart, Pie, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';

interface RoomStatus {
    available: number;
    occupied: number;
}

const AdminDashboard: React.FC = () => {
    const [userCount, setUserCount] = useState<number>(0);
    const [roomStatus, setRoomStatus] = useState<RoomStatus>({ available: 0, occupied: 0 });
    const [loading, setLoading] = useState<boolean>(false);
    const auth = getAuth();
    const db = getFirestore();
    const admin = auth.currentUser;

    useEffect(() => {
        if (admin?.uid) { // Use optional chaining
            const fetchUserCount = async () => {
                setLoading(true);
                try {
                    const usersCollection = collection(db, 'users');
                    const usersSnapshot = await getDocs(usersCollection);
                    setUserCount(usersSnapshot.size);

                    let availableCount = 0;
                    let occupiedCount = 0;

                    usersSnapshot.forEach((doc) => {
                        const data = doc.data();
                        if (data.roomStatus === 'available') {
                            availableCount += 1;
                        } else if (data.roomStatus === 'occupied') {
                            occupiedCount += 1;
                        }
                    });

                    setRoomStatus({ available: availableCount, occupied: occupiedCount });
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    AntMessage.error('เกิดข้อผิดพลาดในการดึงข้อมูล'); // Use Ant Design's message for error
                } finally {
                    setLoading(false);
                }
            };

            fetchUserCount();
        }
    }, [admin, db]);

    const roomData = [
        { name: 'ห้องว่าง', value: roomStatus.available },
        { name: 'ห้องไม่ว่าง', value: roomStatus.occupied },
    ];

    const COLORS = ['#6495ED', '#FF7F50'];
    const totalRooms = 100; // Adjust this based on your actual total room count
    const userPercentage = (userCount / totalRooms) * 100;

    return (
        <>
            <Navbar />
            <div className="dashboard-container">
                <h2>แดชบอร์ด</h2>
                {loading ? (
                    <div className="loading-container">
                        <Spin size="large" />
                    </div>
                ) : (
                    <Row gutter={[16, 16]}>
                        <Col xs={24} md={12}>
                            <Card title="จำนวนห้อง">
                                <Progress
                                    percent={userPercentage}
                                    format={() => `${userCount} ห้อง`}
                                    status="active"
                                />
                            </Card>
                        </Col>

                        <Col xs={24} md={12}>
                            <Card title="สถานะห้อง">
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={roomData}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                            label
                                        >
                                            {roomData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Card>
                        </Col>
                    </Row>
                )}
            </div>
        </>
    );
};

export default AdminDashboard;
