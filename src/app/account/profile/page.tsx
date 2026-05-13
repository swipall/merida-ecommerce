import type {Metadata} from 'next';
import { getAuthToken } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getCurrentCustomer } from '@/lib/swipall/rest-adapter';

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

    let customer = null;
    let currentEmail = '';
    try {
        const user = await getCurrentCustomer({ useAuthToken: true });
        customer = {
            firstName: user.first_name,
            lastName: user.last_name,
        };
        currentEmail = user.email ?? '';
    } catch {
        // continue with empty defaults
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold">Mi perfil</h1>
                <p className="text-white/50 mt-2">
                    Administra la información de tu cuenta
                </p>
            </div>

            <EditProfileForm customer={customer} />

            <EditEmailForm currentEmail={currentEmail} />

            <ChangePasswordForm />
        </div>
    );
}
