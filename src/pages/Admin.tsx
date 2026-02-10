import { useEffect, useState } from 'react';
import api from '../lib/axios';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

interface UserData {
    id: number;
    employee_id: string;
    full_name: string;
    email: string;
    designation: string;
    role: string;
    idea_pdf_url: string | null;
    created_at: string;
}

const Admin = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data);
        } catch (err) {
            console.error(err);
            alert('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleExportPDF = async () => {
        try {
            const response = await api.get('/admin/export-pdf', {
                responseType: 'blob', // Important for file download
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'users_export.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Export failed', err);
            alert('Failed to export PDF');
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0e27] text-slate-200 p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
                    <div className="flex gap-4">
                        <Button onClick={() => navigate('/dashboard')} variant="outline" className="text-slate-300 border-slate-700">
                            Back to Dashboard
                        </Button>
                        <Button onClick={handleExportPDF} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                            Export PDF
                        </Button>
                    </div>
                </div>

                <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[#1f2937] text-slate-300 uppercase font-medium">
                                <tr>
                                    <th className="px-6 py-4">Emp ID</th>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Designation</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Idea Uploaded</th>
                                    <th className="px-6 py-4">Reg. Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-slate-500">Loading users...</td>
                                    </tr>
                                ) : users.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 text-white font-medium">{user.employee_id}</td>
                                        <td className="px-6 py-4">{user.full_name}</td>
                                        <td className="px-6 py-4 text-slate-400">{user.designation}</td>
                                        <td className="px-6 py-4 text-slate-400">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400' : 'bg-slate-700 text-slate-300'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.idea_pdf_url ? (
                                                <span className="text-green-400 flex items-center gap-1">
                                                    Yes
                                                </span>
                                            ) : (
                                                <span className="text-slate-600">No</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {!loading && users.length === 0 && (
                        <div className="p-8 text-center text-slate-500">No registered users found.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Admin;
