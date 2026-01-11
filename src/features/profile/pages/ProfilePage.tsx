import { useProfile } from "../hooks/useProfile";
import { LoadingState, EmptyState } from "../components/ProfileStates";
import { ProfileSidebar } from "../components/ProfileSidebar";
import { ProfileInfoForm } from "../components/ProfileInfoForm";
import { PasswordChangeForm } from "../components/PasswordChangeForm";

export default function ProfilePage() {
    const {
        profile,
        loading,
        updating,
        changingPassword,
        name,
        setName,
        photoUrl,
        currentPassword,
        setCurrentPassword,
        newPassword,
        setNewPassword,
        confirmPassword,
        setConfirmPassword,
        fileInputRef,
        updateProfile,
        changePassword,
        uploadPhoto,
        triggerFileInput,
    } = useProfile();

    if (loading) {
        return <LoadingState />;
    }

    if (!profile) {
        return <EmptyState />;
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateProfile();
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        await changePassword();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await uploadPhoto(file);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
            <div className="container max-w-6xl py-8 px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="mb-8 text-center lg:text-left">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                        Profil Saya
                    </h1>
                    <p className="text-slate-600 mt-2 text-lg">
                        Kelola informasi profil dan keamanan akun Anda
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left Sidebar - Profile Summary */}
                    <div className="lg:col-span-1">
                        <ProfileSidebar
                            profile={profile}
                            photoUrl={photoUrl}
                            onAvatarClick={triggerFileInput}
                            fileInputRef={fileInputRef}
                            onFileChange={handleFileChange}
                        />
                    </div>

                    {/* Right Content - Forms */}
                    <div className="lg:col-span-2 space-y-6">
                        <ProfileInfoForm
                            name={name}
                            email={profile.email}
                            updating={updating}
                            onNameChange={setName}
                            onSubmit={handleUpdateProfile}
                        />

                        <PasswordChangeForm
                            currentPassword={currentPassword}
                            newPassword={newPassword}
                            confirmPassword={confirmPassword}
                            changingPassword={changingPassword}
                            onCurrentPasswordChange={setCurrentPassword}
                            onNewPasswordChange={setNewPassword}
                            onConfirmPasswordChange={setConfirmPassword}
                            onSubmit={handleChangePassword}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
