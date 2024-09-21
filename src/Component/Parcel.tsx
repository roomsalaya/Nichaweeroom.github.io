import React, { useState } from 'react';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { addDoc, collection } from 'firebase/firestore';
import { db, storage } from './firebaseConfig';
import Navbar from './Navbar';
import { Spin, message } from 'antd'; // นำเข้า Spin และ message จาก Ant Design
import './parcel.css';

function Parcel() {
    const [recipient, setRecipient] = useState<string>(''); 
    const [trackingNumber, setTrackingNumber] = useState<string>(''); 
    const [parcelType, setParcelType] = useState<string[]>([]); 
    const [image, setImage] = useState<File | null>(null); 
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false); // เพิ่มสถานะ loading

    const handleParcelTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = event.target;
        if (checked) {
            setParcelType([...parcelType, value]); 
        } else {
            setParcelType(parcelType.filter((type) => type !== value)); 
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!recipient || !trackingNumber || parcelType.length === 0 || !image) {
            message.info("กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }        

        setIsSubmitting(true); // Set submitting state
        setLoading(true); // เริ่มการโหลด

        try {
            // Upload image to Firebase Storage
            const imageRef = ref(storage, `parcels/${image.name}`);
            await uploadBytes(imageRef, image);
            const imageUrl = await getDownloadURL(imageRef); // Get image URL after upload

            // Save parcel data to Firestore
            await addDoc(collection(db, 'parcels'), {
                recipient,
                trackingNumber,
                parcelType,
                imageUrl, // Save the uploaded image URL
                timestamp: new Date(),
            });

            message.success('บันทึกข้อมูลสำเร็จ');
            // Reset form fields
            setRecipient('');
            setTrackingNumber('');
            setParcelType([]);
            setImage(null);
            (document.getElementById('imageInput') as HTMLInputElement).value = ''; // Reset file input
        } catch (error) {
            console.error('Error saving parcel data:', error);
            message.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        } finally {
            setIsSubmitting(false); // Reset submitting state
            setLoading(false); // สิ้นสุดการโหลด
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
            <form onSubmit={handleSubmit} className="parcel-form">
                <div>
                    <label>ผู้รับ :</label>
                    <input
                        type="text"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>เลขพัสดุ :</label>
                    <input
                        type="text"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>ประเภทพัสดุ:</label>
                    <div className="checkbox-group">
                        {['กล่องเล็ก', 'กล่องกลาง', 'กล่องใหญ่', 'ซองเล็ก', 'ซองกลาง', 'ซองใหญ่', 'ห่อเล็ก', 'ห่อกลาง', 'ห่อใหญ่', 'อื่นๆ'].map(type => (
                            <label key={type}>
                                <input
                                    type="checkbox"
                                    value={type}
                                    checked={parcelType.includes(type)}
                                    onChange={handleParcelTypeChange}
                                />
                                <i className={`fas fa-${type.includes('กล่อง') ? 'box' : type.includes('ซอง') ? 'envelope' : 'gift'} fa-fw`}></i> {type}
                            </label>
                        ))}
                    </div>
                </div>
                <div>
                    <label>รูปภาพพัสดุ:</label>
                    <input id="imageInput" type="file" onChange={handleImageChange} required />
                </div>
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
            </form>
        </>
    );
}

export default Parcel;
