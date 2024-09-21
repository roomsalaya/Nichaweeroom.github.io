import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Row, Col, Card, Button, Spin, message } from 'antd'; // นำเข้าส่วนประกอบจาก Ant Design
import Navbar from './Navbar';
import './AdminUser.css'; // นำเข้าไฟล์ CSS ของคุณสำหรับการจัดรูปแบบ

// กำหนดประเภทของผู้ใช้พร้อมสถานะห้อง
interface User {
    id: string;
    name: string;
    room: string; // ตรวจสอบให้แน่ใจว่าฟิลด์นี้สามารถเปรียบเทียบได้ตามตัวเลขหรือปรับการเปรียบเทียบหากจำเป็น
    email: string;
    phone: string;
    rental: string;
    water: number;
    electricity: number;
    roomStatus: 'available' | 'occupied'; // เพิ่ม roomStatus เป็น 'available' หรือ 'occupied'
}

// กำหนดประเภทสำหรับการอัปเดตบางส่วน
type PartialUserUpdate = Partial<Omit<User, 'id'>>;

const AdminUser: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [updatedUser, setUpdatedUser] = useState<PartialUserUpdate | null>(null);
    const [loading, setLoading] = useState<boolean>(false); // เพิ่มสถานะ loading
    const auth = getAuth();
    const db = getFirestore();
    const admin = auth.currentUser;

    useEffect(() => {
        if (admin) {
            const fetchUsers = async () => {
                setLoading(true); // เริ่มการโหลด
                try {
                    const usersCollection = collection(db, 'users');
                    const usersSnapshot = await getDocs(usersCollection);
                    const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[];
                    
                    // เรียงลำดับผู้ใช้ตามหมายเลขห้อง
                    usersList.sort((a, b) => {
                        const roomA = parseInt(a.room, 10);
                        const roomB = parseInt(b.room, 10);
                        return roomA - roomB;
                    });

                    setUsers(usersList);
                } catch (error) {
                    console.error("Error fetching users:", error);
                    message.error('เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้');
                } finally {
                    setLoading(false); // สิ้นสุดการโหลด
                }
            };

            fetchUsers();
        }
    }, [admin, db]);

    const handleUserClick = (user: User) => {
        if (selectedUser?.id === user.id) {
            // ยกเลิกการเลือกหากคลิกผู้ใช้เดิมอีกครั้ง
            setSelectedUser(null);
            setUpdatedUser(null);
        } else {
            // เลือกผู้ใช้ใหม่
            setSelectedUser(user);
            setUpdatedUser({ ...user });
        }
    };

    const handleUpdate = async () => {
        if (updatedUser && selectedUser) {
            setLoading(true); // เริ่มการโหลด
            try {
                const userDoc = doc(db, 'users', selectedUser.id);
                // ส่งเฉพาะฟิลด์ที่ได้รับการอัปเดต
                await updateDoc(userDoc, updatedUser as any); // Cast เป็น any เพื่อให้ตรงตามการตรวจสอบประเภท
                setSelectedUser(null);
                setUpdatedUser(null);
                
                // แสดงข้อความอัปเดตสำเร็จ
                message.success('อัปเดตข้อมูลสำเร็จ');

                // อัปเดตข้อมูลผู้ใช้ใหม่เพื่อสะท้อนการเปลี่ยนแปลง
                const usersCollection = collection(db, 'users');
                const usersSnapshot = await getDocs(usersCollection);
                const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[];
                
                // เรียงลำดับผู้ใช้ตามหมายเลขห้อง
                usersList.sort((a, b) => {
                    const roomA = parseInt(a.room, 10);
                    const roomB = parseInt(b.room, 10);
                    return roomA - roomB;
                });

                setUsers(usersList);
            } catch (error) {
                console.error("Error updating user:", error);
                message.error('เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
            } finally {
                setLoading(false); // สิ้นสุดการโหลด
            }
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
        field: keyof User
    ) => {
        setUpdatedUser(prevUser => (prevUser ? {
            ...prevUser,
            [field]: e.target.value
        } : {}));
    };

    return (
        <>
            <Navbar />
            <div className="admin-container">
                <h2>จัดการข้อมูลผู้ใช้</h2>
                {loading ? (
                    <Spin size="large" /> // แสดงการโหลด
                ) : (
                    <>
                        <div className="user-list">
                            <Row gutter={[16, 8]}>
                                {users.map(user => (
                                    <Col span={12} key={user.id}>
                                        <Card
                                            title={user.room}
                                            onClick={() => handleUserClick(user)}
                                            hoverable
                                            className={`user-card ${selectedUser?.id === user.id ? 'selected' : ''}`}
                                        >
                                            <p>{user.email}</p>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </div>
                        {selectedUser && (
                            <div className="user-details">
                                <h3>ข้อมูลผู้ใช้</h3>
                                <form>
                                    {/* ฟิลด์ฟอร์มสำหรับการอัปเดตผู้ใช้ */}
                                    <label>
                                        ชื่อ:
                                        <input
                                            type="text"
                                            value={updatedUser?.name || ''}
                                            onChange={(e) => handleInputChange(e, 'name')}
                                        />
                                    </label>
                                    <label>
                                        ห้อง:
                                        <input
                                            type="text"
                                            value={updatedUser?.room || ''}
                                            onChange={(e) => handleInputChange(e, 'room')}
                                        />
                                    </label>
                                    <label>
                                        อีเมล:
                                        <input
                                            type="text"
                                            value={updatedUser?.email || ''}
                                            onChange={(e) => handleInputChange(e, 'email')}
                                        />
                                    </label>
                                    <label>
                                        เบอร์โทรศัพท์:
                                        <input
                                            type="text"
                                            value={updatedUser?.phone || ''}
                                            onChange={(e) => handleInputChange(e, 'phone')}
                                        />
                                    </label>
                                    <label>
                                        สัญญาเช่า:
                                        <input
                                            type="text"
                                            value={updatedUser?.rental || ''}
                                            onChange={(e) => handleInputChange(e, 'rental')}
                                        />
                                    </label>
                                    <label>
                                        ค่าน้ำ:
                                        <input
                                            type="number"
                                            value={updatedUser?.water || ''}
                                            onChange={(e) => handleInputChange(e, 'water')}
                                        />
                                    </label>
                                    <label>
                                        ค่าไฟ หน่วยละ:
                                        <input
                                            type="number"
                                            value={updatedUser?.electricity || ''}
                                            onChange={(e) => handleInputChange(e, 'electricity')}
                                        />
                                    </label>
                                    <label>
                                        สถานะห้อง:
                                        <select
                                            value={updatedUser?.roomStatus || 'occupied'}
                                            onChange={(e) => handleInputChange(e, 'roomStatus' as keyof User)} // จัดการการเปลี่ยนแปลงสถานะ
                                        >
                                            <option value="available">ว่าง</option>
                                            <option value="occupied">ไม่ว่าง</option>
                                        </select>
                                    </label>
                                    <Button type="primary" onClick={handleUpdate}>อัปเดตข้อมูล</Button>
                                </form>
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
};

export default AdminUser;
