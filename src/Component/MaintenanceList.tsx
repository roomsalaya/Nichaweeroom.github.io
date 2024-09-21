import React, { useEffect, useState } from 'react';
import { getDocs, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import Navbar from './Navbar';
import { Button, List, Spin, message, Modal } from 'antd';
import './MaintenanceList.css';
interface MaintenanceReportData {
    id: string;
    issueDescription: string;
    location: string;
    urgency: string;
    imageUrl?: string;
    timestamp: any;
    status?: string; // เพิ่มฟิลด์สถานะ
}

const MaintenanceList: React.FC = () => {
    const [reports, setReports] = useState<MaintenanceReportData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [selectedReport, setSelectedReport] = useState<MaintenanceReportData | null>(null);

    useEffect(() => {
        const fetchMaintenanceReports = async () => {
            setLoading(true);
            try {
                const querySnapshot = await getDocs(collection(db, 'maintenanceReports'));
                const fetchedReports: MaintenanceReportData[] = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data() as Omit<MaintenanceReportData, 'id'>
                }));
                setReports(fetchedReports);
            } catch (error) {
                console.error('Error fetching maintenance reports:', error);
                message.error('เกิดข้อผิดพลาดในการดึงข้อมูล');
            } finally {
                setLoading(false);
            }
        };

        fetchMaintenanceReports();
    }, []);

    const showModal = (report: MaintenanceReportData) => {
        setSelectedReport(report);
        setIsModalVisible(true);
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        setSelectedReport(null);
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'maintenanceReports', id));
            message.success('ลบรายการเรียบร้อย');
            setReports(reports.filter(report => report.id !== id));
        } catch (error) {
            console.error('Error deleting report:', error);
            message.error('เกิดข้อผิดพลาดในการลบรายการ');
        } finally {
            handleModalCancel();
        }
    };

    const handleUpdateStatus = async (id: string) => {
        if (!selectedReport) return;
        const newStatus = selectedReport.status === 'ซ่อมแซมแล้ว' ? 'รอดำเนินการ' : 'ซ่อมแซมแล้ว';

        try {
            await updateDoc(doc(db, 'maintenanceReports', id), { status: newStatus });
            message.success('อัปเดตสถานะเรียบร้อย');
            setReports(reports.map(report => report.id === id ? { ...report, status: newStatus } : report));
        } catch (error) {
            console.error('Error updating status:', error);
            message.error('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
        }
    };

    return (
        <>
            <Navbar />
            <div className="maintenance-list-container">
                <h3>รายการแจ้งซ่อมแซม</h3>
                {loading ? (
                    <div className="loading-container">
                        <Spin size="large" />
                    </div>
                ) : (
                    <List
                        itemLayout="vertical"
                        size="large"
                        dataSource={reports}
                        renderItem={(report) => (
                            <List.Item key={report.id} onClick={() => showModal(report)} style={{ cursor: 'pointer' }}>
                                <List.Item.Meta title={`สถานที่: ${report.location}`} />
                                <p>{`รายละเอียด: ${report.issueDescription}`}</p>
                            </List.Item>
                        )}
                    />
                )}
            </div>
            <Modal
                title={`รายละเอียดการแจ้งซ่อม: ${selectedReport?.location}`}
                visible={isModalVisible}
                onCancel={handleModalCancel}
                footer={null}
            >
                {selectedReport && (
                    <>
                        <p>{`รายละเอียด: ${selectedReport.issueDescription}`}</p>
                        {selectedReport.imageUrl && (
                            <img
                                src={selectedReport.imageUrl}
                                alt="ปัญหา"
                                style={{ maxWidth: '100%', maxHeight: '300px' }}
                            />
                        )}
                        <p>{`วันที่แจ้ง: ${new Date(selectedReport.timestamp.seconds * 1000).toLocaleString()}`}</p>
                        <p>{`สถานะ: ${selectedReport.status || 'ยังไม่ได้ระบุ'}`}</p>
                        <Button
                            onClick={() => handleUpdateStatus(selectedReport.id)}
                            style={{ marginRight: '10px' }}
                        >
                            {selectedReport.status === 'ซ่อมแซมแล้ว' ? 'เปลี่ยนเป็นรอดำเนินการ' : 'เปลี่ยนเป็นซ่อมแซมแล้ว'}
                        </Button>
                        <Button danger onClick={() => handleDelete(selectedReport.id)}>
                            ลบรายการ
                        </Button>
                    </>
                )}
            </Modal>
        </>
    );
};

export default MaintenanceList;
