import type {Metadata} from 'next';
import { getAuthToken } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
    title: 'Profile',
};
import { ChangePasswordForm } from './change-password-form';
import { EditProfileForm } from './edit-profile-form';
import { EditEmailForm } from './edit-email-form';

export default async function ProfilePage(_props: PageProps<'/account/profile'>) {
    const authToken = await getAuthToken();
    if (!authToken) {
        redirect('/sign-in');
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold">Mi perfil</h1>
                <p className="text-white/50 mt-2">
                    Administra la información de tu cuenta
                </p>
            </div>

            <EditProfileForm customer={null} />

            <EditEmailForm currentEmail={''} />

            <ChangePasswordForm />
        </div>
    );
}
