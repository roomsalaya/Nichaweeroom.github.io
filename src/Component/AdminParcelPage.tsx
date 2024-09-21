import { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import Navbar from './Navbar';
import './adminParcel.css';

interface ParcelData {
    id: string;
    recipient: string;
    trackingNumber: string;
    parcelType: string[];
    imageUrl: string;
    timestamp: any;
}

function AdminParcelPage() {
    const [parcels, setParcels] = useState<ParcelData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Fetch parcel data from Firestore
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const querySnapshot = await getDocs(collection(db, 'parcels'));
                const parcelList: ParcelData[] = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as ParcelData[];
                setParcels(parcelList);
            } catch (error) {
                console.error('Error fetching parcels:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Handle delete parcel
    const handleDelete = async (id: string) => {
        if (window.confirm('คุณต้องการลบข้อมูลนี้หรือไม่?')) {
            try {
                await deleteDoc(doc(db, 'parcels', id));
                setParcels(parcels.filter((parcel) => parcel.id !== id));
                alert('ลบข้อมูลสำเร็จ');
            } catch (error) {
                console.error('Error deleting parcel:', error);
                alert('เกิดข้อผิดพลาดในการลบข้อมูล');
            }
        }
    };

    return (
        <>
            <Navbar />
            <div className="admin-parcel-page">
                <h2>ข้อมูลพัสดุ</h2>
                {loading ? (
                    <p>กำลังโหลดข้อมูล...</p>
                ) : parcels.length === 0 ? (
                    <p>ไม่มีข้อมูลพัสดุที่บันทึกไว้</p>
                ) : (
                    <table className="parcel-table">
                        <thead>
                            <tr>
                                <th>ผู้รับ</th>
                                <th>เลขพัสดุ</th>
                                <th>ประเภทพัสดุ</th>
                                <th>รูปภาพ</th>
                                <th>วันที่ส่ง</th>
                                <th>ลบข้อมูล</th>
                            </tr>
                        </thead>
                        <tbody>
                            {parcels.map((parcel) => (
                                <tr key={parcel.id}>
                                    <td>{parcel.recipient}</td>
                                    <td>{parcel.trackingNumber}</td>
                                    <td>{parcel.parcelType.join(', ')}</td>
                                    <td>
                                        <img
                                            src={parcel.imageUrl}
                                            alt="รูปพัสดุ"
                                            className="parcel-image"
                                        />
                                    </td>
                                    <td>{new Date(parcel.timestamp.seconds * 1000).toLocaleString()}</td>
                                    <td>
                                        <button onClick={() => handleDelete(parcel.id)} className="delete-button">
                                            ลบ
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </>
    );
}

export default AdminParcelPage;
