import { MessageSquare } from 'lucide-react';

export const PageHeader = () => {
    return (
        <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent flex items-center gap-3">
                <MessageSquare className="h-10 w-10 text-blue-600" />
                Template WhatsApp
            </h1>
            <p className="text-slate-600 mt-2 text-lg">
                Kelola template notifikasi WhatsApp sistem
            </p>
        </div>
    );
};
