import { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Spin, message } from 'antd'; // นำเข้า Spin และ message จาก Ant Design
import './ParcelList.css';

interface ParcelData {
    id?: string;
    recipient: string;
    trackingNumber: string;
    parcelType: string[];
    imageUrl: string;
    timestamp: {
        seconds: number;
    };
    status?: string;
    signature?: string;
}

function ParcelList() {
    const [parcelData, setParcelData] = useState<ParcelData[]>([]);
    const [selectedParcel, setSelectedParcel] = useState<ParcelData | null>(null);
    const [signature, setSignature] = useState<string>(''); // State to hold the signature input
    const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
    const [loading, setLoading] = useState<boolean>(false); // เพิ่มสถานะ loading
    const [signing, setSigning] = useState<boolean>(false); // เพิ่มสถานะ signing

    // Fetch parcel data from Firestore
    useEffect(() => {
        const fetchParcelData = async () => {
            setLoading(true); // เริ่มการโหลด
            try {
                const querySnapshot = await getDocs(collection(db, 'parcels'));
                const parcels: ParcelData[] = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as ParcelData[];
                setParcelData(parcels);
            } catch (error) {
                console.error('Error fetching parcel data:', error);
                message.error('เกิดข้อผิดพลาดในการดึงข้อมูลพัสดุ');
            } finally {
                setLoading(false); // สิ้นสุดการโหลด
            }
        };
        fetchParcelData();
    }, []);

    // Open modal for signing
    const openModal = (parcel: ParcelData) => {
        setSelectedParcel(parcel);
        setSignature(''); // Clear signature input
        setIsModalOpen(true);
    };

    // Close modal
    const closeModal = () => {
        setSelectedParcel(null);
        setSignature('');
        setIsModalOpen(false);
    };

    // Handle signing and updating the parcel status
    const handleSignParcel = async () => {
        if (selectedParcel && selectedParcel.id) {
            setSigning(true); // เริ่มการเซ็น
            try {
                const parcelRef = doc(db, 'parcels', selectedParcel.id);
                await updateDoc(parcelRef, {
                    status: 'รับพัสดุแล้ว',
                    signature: signature,
                });

                // Update local state to reflect the changes
                setParcelData((prevData) =>
                    prevData.map((parcel) =>
                        parcel.id === selectedParcel.id
                            ? { ...parcel, status: 'รับพัสดุแล้ว', signature }
                            : parcel
                    )
                );
                message.success('เซ็นรับพัสดุสำเร็จ');
                closeModal(); // Close modal after signing
            } catch (error) {
                console.error('Error signing parcel:', error);
                message.error('เกิดข้อผิดพลาดในการเซ็นรับพัสดุ');
            } finally {
                setSigning(false); // สิ้นสุดการเซ็น
            }
        }
    };

    return (
        <div className="parcel-list">
            <h2>รายการพัสดุ</h2>
            {loading ? (
                <div className="loading-container">
                    <Spin size="large" />
                </div>
            ) : parcelData.length > 0 ? (
                <div className="table-container">
                    <table className="parcel-table">
                        <thead>
                            <tr>
                                <th>ชื่อผู้รับ</th>
                                <th>เลขพัสดุ</th>
                                <th>ประเภทพัสดุ</th>
                                <th>รูปภาพ</th>
                                <th>วันที่บันทึก</th>
                                <th>สถานะ</th>
                                <th>เซ็นรับพัสดุ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {parcelData.map((parcel) => (
                                <tr key={parcel.id}>
                                    <td>{parcel.recipient}</td>
                                    <td>{parcel.trackingNumber}</td>
                                    <td>{parcel.parcelType.join(', ')}</td>
                                    <td>
                                        {parcel.imageUrl ? (
                                            <img
                                                src={parcel.imageUrl}
                                                alt="พัสดุ"
                                                className="parcel-image"
                                                onClick={() => openModal(parcel)}
                                            />
                                        ) : (
                                            'ไม่มีรูปภาพ'
                                        )}
                                    </td>
                                    <td>{new Date(parcel.timestamp.seconds * 1000).toLocaleDateString('th-TH')}</td>
                                    <td>{parcel.status || 'รอการรับพัสดุ'}</td>
                                    <td>
                                        {parcel.status !== 'รับพัสดุแล้ว' && (
                                            <button onClick={() => openModal(parcel)}>เซ็นรับ</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p>ไม่มีข้อมูลพัสดุ</p>
            )}

            {/* Modal for Signing Parcel */}
            {isModalOpen && selectedParcel && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <span className="close-button" onClick={closeModal}>
                            &times;
                        </span>
                        <h3>เซ็นรับพัสดุสำหรับ {selectedParcel.recipient}</h3>
                        <p>เลขพัสดุ: {selectedParcel.trackingNumber}</p>
                        <img
                            src={selectedParcel.imageUrl}
                            alt="พัสดุขนาดใหญ่"
                            className="modal-image"
                        />
                        <input
                            type="text"
                            placeholder="กรอกชื่อผู้เซ็น"
                            value={signature}
                            onChange={(e) => setSignature(e.target.value)}
                        />
                        <button onClick={handleSignParcel} disabled={signing}>
                            {signing ? 'กำลังเซ็นรับ...' : 'ยืนยันการเซ็นรับ'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ParcelList;
