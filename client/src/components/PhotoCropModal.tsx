'use client';

import { useState, useRef } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X, Upload } from 'lucide-react';

interface PhotoCropModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (croppedImageUrl: string) => void;
}

export default function PhotoCropModal({ isOpen, onClose, onSave }: PhotoCropModalProps) {
    const [imgSrc, setImgSrc] = useState('');
    const [crop, setCrop] = useState<Crop>({
        unit: '%',
        width: 50,
        height: 50,
        x: 25,
        y: 25
    });
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const imgRef = useRef<HTMLImageElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener('load', () =>
                setImgSrc(reader.result?.toString() || '')
            );
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const getCroppedImg = (): string | null => {
        if (!completedCrop || !imgRef.current) return null;

        const canvas = document.createElement('canvas');
        const image = imgRef.current;
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        canvas.width = completedCrop.width;
        canvas.height = completedCrop.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) return null;

        ctx.drawImage(
            image,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            completedCrop.width,
            completedCrop.height
        );

        return canvas.toDataURL('image/jpeg', 0.9);
    };

    const handleSave = () => {
        const croppedImage = getCroppedImg();
        if (croppedImage) {
            onSave(croppedImage);
            handleClose();
        }
    };

    const handleClose = () => {
        setImgSrc('');
        setCrop({ unit: '%', width: 50, height: 50, x: 25, y: 25 });
        setCompletedCrop(undefined);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#151B2D] rounded-3xl border border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Upload & Crop Photo</h2>
                    <button onClick={handleClose} className="text-gray-400 hover:text-white transition">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {!imgSrc ? (
                        <div className="text-center">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={onSelectFile}
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl flex items-center gap-3 mx-auto transition-all shadow-lg"
                            >
                                <Upload size={20} />
                                Select Photo
                            </button>
                            <p className="text-gray-400 text-sm mt-4">Choose an image to upload and crop</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <ReactCrop
                                crop={crop}
                                onChange={(c) => setCrop(c)}
                                onComplete={(c) => setCompletedCrop(c)}
                                aspect={1}
                                circularCrop
                            >
                                <img
                                    ref={imgRef}
                                    src={imgSrc}
                                    alt="Crop preview"
                                    className="max-w-full h-auto"
                                />
                            </ReactCrop>

                            <div className="flex gap-4 justify-end">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-6 py-2 bg-[#1A2333] hover:bg-[#232D42] text-white font-semibold rounded-xl border border-gray-700 transition"
                                >
                                    Choose Different Photo
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={!completedCrop}
                                    className="px-8 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Save Photo
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
