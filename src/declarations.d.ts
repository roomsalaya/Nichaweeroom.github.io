declare module '@blackbox-vision/react-qr-reader' {
    import { ComponentType } from 'react';
    
    export interface QrReaderProps {
        delay?: number;
        onError?: (error: any) => void;
        onScan?: (data: string | null) => void;
        style?: React.CSSProperties;
    }
    
    const QrReader: ComponentType<QrReaderProps>;
    export default QrReader;
}
