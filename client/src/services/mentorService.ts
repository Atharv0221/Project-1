import { useAuthStore } from '@/store/authStore';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const authHeaders = (isFormData: boolean = false) => {
    const headers: any = {
        Authorization: `Bearer ${useAuthStore.getState().token}`
    };
    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }
    return headers;
};

export interface Mentor {
    id: string;
    name: string;
    email: string;
    profilePicture?: string;
    youtubeChannel?: string;
    boards: string[];
    languages: string[];
    standards: string[];
    playlists?: { title: string, url: string, category?: string }[];
    bio?: string;
    isActive: boolean;
    avgRating: number | null;
    totalRatings: number;
    ratings: { rating: number; comment?: string; userId: string; createdAt: string }[];
    createdAt: string;
}

export const getMentors = async (filters?: { board?: string; standard?: string; language?: string }): Promise<Mentor[]> => {
    const params = new URLSearchParams();
    if (filters?.board) params.append('board', filters.board);
    if (filters?.standard) params.append('standard', filters.standard);
    if (filters?.language) params.append('language', filters.language);
    const res = await fetch(`${API_BASE}/mentors?${params}`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch mentors');
    return res.json();
};

export const getMentorById = async (id: string): Promise<Mentor> => {
    const res = await fetch(`${API_BASE}/mentors/${id}`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch mentor');
    return res.json();
};

export const createMentor = async (data: FormData): Promise<Mentor> => {
    const res = await fetch(`${API_BASE}/mentors`, {
        method: 'POST',
        headers: authHeaders(true),
        body: data
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
    return res.json();
};

export const updateMentor = async (id: string, data: FormData | Partial<Mentor>): Promise<Mentor> => {
    const isFormData = data instanceof FormData;
    const res = await fetch(`${API_BASE}/mentors/${id}`, {
        method: 'PUT',
        headers: authHeaders(isFormData),
        body: isFormData ? data : JSON.stringify(data)
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
    return res.json();
};

export const deleteMentor = async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/mentors/${id}`, { method: 'DELETE', headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to delete mentor');
};

export const requestMeeting = async (mentorId: string, message: string): Promise<{ message: string }> => {
    const res = await fetch(`${API_BASE}/mentors/${mentorId}/request`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ message })
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
    return res.json();
};

export const rateMentor = async (mentorId: string, rating: number, comment?: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/mentors/${mentorId}/rate`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ rating, comment })
    });
    if (!res.ok) throw new Error('Failed to submit rating');
};
