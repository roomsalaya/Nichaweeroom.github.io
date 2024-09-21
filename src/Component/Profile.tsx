import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import Navbar from './Navbar';
import './Profile.css'; // Import the CSS file

const Profile: React.FC = () => {
    const [userData, setUserData] = useState<any>(null);
    const auth = getAuth();
    const db = getFirestore();
    const user = auth.currentUser;

    useEffect(() => {
        if (user) {
            const fetchUserData = async () => {
                const userDoc = doc(db, 'users', user.uid); // ใช้ UID ของผู้ใช้เพื่อดึงข้อมูล
                const docSnap = await getDoc(userDoc);

                if (docSnap.exists()) {
                    setUserData(docSnap.data());
                } else {
                    console.log('No such document!');
                }
            };

            fetchUserData();
        }
    }, [user, db]);

    if (!user) {
        return <p>โปรดเข้าสู่ระบบ</p>;
    }

    return (
        <>
            <Navbar />
            <div className="container">
                <h2>ข้อมูลโปรไฟล์</h2>
                {userData ? (
                    <table className="profile-table">
                        <tbody>
                            <tr>
                                <th>ชื่อ :</th>
                                <td>{userData.name}</td>
                            </tr>
                            <tr>
                                <th>ห้อง :</th>
                                <td>{userData.room}</td>
                            </tr>
                            <tr>
                                <th>อีเมล :</th>
                                <td>{user.email}</td>
                            </tr>
                            <tr>
                                <th>เบอร์โทรศัพท์ :</th>
                                <td>{userData.phone}</td>
                            </tr>
                            <tr>
                                <th>สัญญาเช่า :</th>
                                <td>{userData.rental}</td>
                            </tr>
                            <tr>
                                <th>ค่าน้ำ :</th>
                                <td>{userData.water} บาท</td>
                            </tr>
                            <tr>
                                <th>ค่าไฟ หน่วยละ :</th>
                                <td>{userData.electricity} บาท</td>
                            </tr>
                            {/* เพิ่มข้อมูลอื่น ๆ ที่ต้องการแสดง */}
                        </tbody>
                    </table>
                ) : (
                    <p className="loading-message">กำลังโหลดข้อมูล...</p>
                )}
            </div>
        </>
    );
};

export default Profile;
