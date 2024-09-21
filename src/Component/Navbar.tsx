import React, { useEffect, useState } from 'react';
import { Layout, Menu, Button, Modal, List, Badge } from 'antd';
import {
    LoginOutlined, UserOutlined, DashboardOutlined,
    HomeOutlined, BellOutlined, InboxOutlined, FileSyncOutlined,
    AlertOutlined, ToolOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, query, where, getDocs, writeBatch, deleteDoc } from 'firebase/firestore';
import './Navbar.css';
import { Timestamp } from 'firebase/firestore';

const { Header } = Layout;

interface Notification {
    id: string;
    message: string;
    timestamp: Date;
    read: boolean;
    userImage?: string;
}

const Navbar: React.FC = () => {
    const [role, setRole] = useState<'admin' | 'user' | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const auth = getAuth();
    const db = getFirestore();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserRoleAndNotifications = async () => {
            const user = auth.currentUser;
            if (user) {
                const userDoc = doc(db, 'users', user.uid);
                const docSnap = await getDoc(userDoc);
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    const userRole = userData.role || null;
                    setRole(userRole);

                    let notificationsQuery;
                    if (userRole === 'admin') {
                        notificationsQuery = query(collection(db, 'notifications'));
                    } else if (userRole === 'user') {
                        notificationsQuery = query(
                            collection(db, 'notifications'),
                            where('userId', '==', user.uid)
                        );
                    }

                    if (notificationsQuery) {
                        const notificationsSnap = await getDocs(notificationsQuery);
                        const userNotifications: Notification[] = notificationsSnap.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data() as Omit<Notification, 'id'>
                        }));
                        setNotifications(userNotifications);
                    }
                } else {
                    setRole(null);
                }
            } else {
                setRole(null);
            }
        };

        fetchUserRoleAndNotifications();
    }, [auth, db]);

    const handleLogout = () => {
        signOut(auth)
            .then(() => {
                navigate('/login');
            })
            .catch((error) => {
                console.error('Error signing out: ', error);
            });
    };

    const handleNotificationClick = () => {
        setIsModalVisible(true);
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
    };

    const markAsRead = async () => {
        const user = auth.currentUser;
        if (user) {
            const unreadNotifications = notifications.filter(notification => !notification.read);
            const batch = writeBatch(db);
            unreadNotifications.forEach(notification => {
                const notificationRef = doc(db, 'notifications', notification.id);
                batch.update(notificationRef, { read: true });
            });

            try {
                await batch.commit();
                setNotifications(prevNotifications =>
                    prevNotifications.map(notification => ({
                        ...notification,
                        read: true
                    }))
                );
            } catch (error) {
                console.error('Error updating notifications: ', error);
            }
        }
    };

    const handleDeleteNotification = async (id: string) => {
        const user = auth.currentUser;
        if (user) {
            try {
                await deleteDoc(doc(db, 'notifications', id));
                setNotifications(prevNotifications =>
                    prevNotifications.filter(notification => notification.id !== id)
                );
            } catch (error) {
                console.error('Error deleting notification: ', error);
            }
        }
    };

    const unreadNotifications = notifications.filter(notification => !notification.read);

    const menuItems = [
        {
            key: 'home',
            icon: <HomeOutlined />,
            label: <Link to="/">หน้าหลัก</Link>,
        },
        role === 'admin' && {
            key: 'dashboard',
            icon: <DashboardOutlined />,
            label: <Link to="/adminDashboard">แดชบอร์ด</Link>,
        },
        role === 'admin' && {
            key: 'adminusers',
            icon: <FileSyncOutlined />,
            label: <Link to="/adminusers">แก้ไขข้อมูลผู้เช่า</Link>,
        },
        role === 'admin' && {
            key: 'parcel',
            icon: <InboxOutlined />,
            label: <Link to="/parcel">เพิ่มพัสดุ</Link>,
        },
        role === 'admin' && {
            key: 'adminparcels',
            icon: <AlertOutlined />,
            label: <Link to="/MaintenanceReport">แจ้งซ่อม</Link>,
        },
        role === 'admin' && {
            key: 'maintenanceHistory',
            icon: <ToolOutlined />,
            label: <Link to="/MaintenanceList">ประวัติแจ้งซ่อมแซม</Link>,
        },
        role === 'user' && {
            key: 'profile',
            icon: <UserOutlined />,
            label: <Link to="/profile">โปรไฟล์</Link>,
        },
        role && {
            key: 'logout',
            icon: <LoginOutlined />,
            label: 'ออกจากระบบ',
            onClick: handleLogout,
        },
    ].filter(Boolean) as { key: string; icon: JSX.Element; label: JSX.Element; onClick?: (() => void) | undefined }[];

    return (
        <Header style={{ background: '#fff', padding: 0 }}>
            <div className="logo" style={{ float: 'left', marginLeft: '20px' }}>
                <h2>หอพักณิชชาวีร์</h2>
            </div>

            <Menu
                theme="light"
                mode="horizontal"
                defaultSelectedKeys={['home']}
                style={{ lineHeight: '64px', float: 'right' }}
                items={menuItems}
            />

            <Badge count={unreadNotifications.length} className="notification-badge">
                <BellOutlined
                    className="notification-icon"
                    onClick={handleNotificationClick}
                />
            </Badge>

            {role === null && (
                <Button
                    type="primary"
                    icon={<LoginOutlined />}
                    style={{ marginRight: '20px', float: 'right' }}
                    onClick={() => navigate('/login')}
                >
                    เข้าสู่ระบบ
                </Button>
            )}

            <Modal
                title="การแจ้งเตือน"
                visible={isModalVisible}
                onCancel={handleModalClose}
                className="notification-modal"
                footer={[
                    <Button key="markAsRead" type="primary" onClick={markAsRead}>
                        ทำเครื่องหมายว่าอ่านแล้ว
                    </Button>
                ]}
            >
                <List
                    dataSource={notifications}
                    renderItem={item => (
                        <List.Item
                            className={`notification-list-item ${item.read ? 'read' : 'unread'}`}
                            key={item.id}
                        >
                            <List.Item.Meta
                                avatar={item.userImage ? <img src={item.userImage} alt="User" className="notification-avatar" /> : null}
                                title={<span className={`notification-list-title ${item.read ? 'read-title' : 'unread-title'}`}>{item.message}</span>}
                                description={
                                    <span className={`notification-list-description ${item.read ? 'read-description' : 'unread-description'}`}>
                                        {`${item.timestamp instanceof Timestamp ? item.timestamp.toDate().toLocaleDateString() : new Date(item.timestamp).toLocaleDateString()} เวลา: ${item.timestamp instanceof Timestamp ? item.timestamp.toDate().toLocaleTimeString() : new Date(item.timestamp).toLocaleTimeString()}`}
                                        <Button
                                            type="link"
                                            danger
                                            onClick={() => handleDeleteNotification(item.id)}
                                            style={{ marginLeft: '10px' }}
                                        >
                                            ลบ
                                        </Button>
                                    </span>
                                }
                            />
                        </List.Item>
                    )}
                />
            </Modal>
        </Header>
    );
};

export default Navbar;
