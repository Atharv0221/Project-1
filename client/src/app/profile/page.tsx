'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import PhotoCropModal from '../../components/PhotoCropModal';
import { getProfile, updateProfile, uploadPhotoBase64 } from '../../services/profileService';
import { User, Save, Camera } from 'lucide-react';

export default function ProfilePage() {
    const { user, login } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [showCropModal, setShowCropModal] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        gender: '',
        age: '',
        classStandard: '',
        schoolName: '',
        board: 'Maharashtra State Board',
        profilePhoto: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            const token = useAuthStore.getState().token;
            if (!token) return;

            try {
                const data = await getProfile();
                if (data) {
                    login(data, token);
                }
            } catch (error: any) {
                if (error.response?.status !== 401) {
                    console.error('Failed to fetch profile:', error);
                }
            }
        };

        fetchProfile();
    }, []);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                gender: user.gender || '',
                age: user.age ? user.age.toString() : '',
                classStandard: user.classStandard || '',
                schoolName: user.schoolName || '',
                board: user.board || 'Maharashtra State Board',
                profilePhoto: user.profilePhoto || ''
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePhotoSave = async (croppedImageUrl: string) => {
        try {
            const data = await uploadPhotoBase64(croppedImageUrl);
            setFormData({ ...formData, profilePhoto: data.photoUrl });
            setMessage('Photo uploaded! Remember to click "Save Profile" to keep it.');
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Failed to upload photo.';
            setMessage(errorMsg);
            console.error(error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const data = await updateProfile(formData);

            if (data.user) {
                const token = useAuthStore.getState().token;
                login(data.user, token!);
                setMessage('Profile updated successfully!');
            } else {
                setMessage('Update successful, but no user data received.');
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Failed to update profile. Please try again.';
            setMessage(errorMsg);
            console.error('Update Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B1120] text-white">
            <Sidebar />
            <Header />

            <main className="ml-0 lg:ml-64 pt-16 p-8 transition-all">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                        <User className="text-cyan-400" size={32} />
                        My Profile
                    </h1>

                    <div className="bg-[#151B2D] rounded-3xl p-8 border border-gray-800">
                        {message && (
                            <div className={`mb-6 p-4 rounded-xl ${message.includes('success') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                {message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Photo Section */}
                            <div className="flex flex-col items-center mb-8">
                                <div
                                    onClick={() => setShowCropModal(true)}
                                    className="w-24 h-24 rounded-full bg-[#1A2333] border-2 border-dashed border-gray-600 flex items-center justify-center relative overflow-hidden group cursor-pointer hover:border-cyan-500 transition"
                                >
                                    {formData.profilePhoto ? (
                                        <img src={formData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={40} className="text-gray-500" />
                                    )}
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                        <Camera size={24} className="text-white" />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Click to upload and crop photo</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full bg-[#0B1120] border border-gray-700 rounded-xl px-4 py-3 focus:border-cyan-500 outline-none transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Age</label>
                                    <input
                                        type="number"
                                        name="age"
                                        value={formData.age}
                                        onChange={handleChange}
                                        className="w-full bg-[#0B1120] border border-gray-700 rounded-xl px-4 py-3 focus:border-cyan-500 outline-none transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Gender</label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className="w-full bg-[#0B1120] border border-gray-700 rounded-xl px-4 py-3 focus:border-cyan-500 outline-none transition text-gray-300"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Standard / Class</label>
                                    <input
                                        type="text"
                                        name="classStandard"
                                        value={formData.classStandard}
                                        onChange={handleChange}
                                        placeholder="e.g. 10th"
                                        className="w-full bg-[#0B1120] border border-gray-700 rounded-xl px-4 py-3 focus:border-cyan-500 outline-none transition"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">School Name</label>
                                    <input
                                        type="text"
                                        name="schoolName"
                                        value={formData.schoolName}
                                        onChange={handleChange}
                                        className="w-full bg-[#0B1120] border border-gray-700 rounded-xl px-4 py-3 focus:border-cyan-500 outline-none transition"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Board</label>
                                    <select
                                        name="board"
                                        value={formData.board}
                                        onChange={handleChange}
                                        className="w-full bg-[#0B1120] border border-gray-700 rounded-xl px-4 py-3 focus:border-cyan-500 outline-none transition text-gray-300"
                                    >
                                        <option value="Maharashtra State Board">Maharashtra State Board</option>
                                        <option value="CBSE">CBSE</option>
                                        <option value="ICSE">ICSE</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-cyan-500/20"
                                >
                                    <Save size={18} />
                                    {loading ? 'Saving...' : 'Save Profile'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>

            <PhotoCropModal
                isOpen={showCropModal}
                onClose={() => setShowCropModal(false)}
                onSave={handlePhotoSave}
            />
        </div>
    );
}
