import React, { useState } from 'react';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { addDoc, collection } from 'firebase/firestore';
import { db, storage } from './firebaseConfig';
import Navbar from './Navbar';
import { Spin, message } from 'antd';
import './maintenance.css';

function MaintenanceReport() {
    const [issueDescription, setIssueDescription] = useState<string>('');
    const [location, setLocation] = useState<string>('');
    const [image, setImage] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const trimmedIssueDescription = issueDescription.trim();
        const trimmedLocation = location.trim();

        if (!trimmedIssueDescription || !trimmedLocation ) {
            message.warning("กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }

        setIsSubmitting(true);
        setLoading(true);

        try {
            let imageUrl = '';
            if (image) {
                const imageRef = ref(storage, `maintenance/${image.name}`);
                await uploadBytes(imageRef, image);
                imageUrl = await getDownloadURL(imageRef);
            }

            await addDoc(collection(db, 'maintenanceReports'), {
                issueDescription: trimmedIssueDescription,
                location: trimmedLocation,
                imageUrl,
                timestamp: new Date(),
            });

            // Create a notification for admin
            await addDoc(collection(db, 'notifications'), {
                userId: 'adminUserId', // Replace with actual admin user ID or use a dynamic approach
                message: `แจ้งรายการแซ่มแซม: ${trimmedIssueDescription}`,
                timestamp: new Date(),
            });

            message.success('บันทึกข้อมูลสำเร็จ');
            setIssueDescription('');
            setLocation('');
            setImage(null);
            (document.getElementById('imageInput') as HTMLInputElement).value = '';
        } catch (error) {
            console.error('Error saving maintenance report:', error);
            message.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        } finally {
            setIsSubmitting(false);
            setLoading(false);
        }
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setImage(event.target.files[0]);
        }
    };

    return (
        <>
            <Navbar />
            {loading && (
                <div className="loading-container">
                    <Spin size="large" />
                </div>
            )}
            <h3>แจ้งซ่อมแซม</h3>
            <form onSubmit={handleSubmit} className="maintenance-form">
                <div>
                    <label htmlFor="issueDescription">รายละเอียดปัญหา :</label>
                    <textarea
                        id="issueDescription"
                        value={issueDescription}
                        onChange={(e) => setIssueDescription(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="location">สถานที่ :</label>
                    <input
                        id="location"
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="imageInput">รูปภาพปัญหา (ถ้ามี):</label>
                    <input
                        id="imageInput"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                </div>
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
            </form>
        </>
    );
}

export default MaintenanceReport;
