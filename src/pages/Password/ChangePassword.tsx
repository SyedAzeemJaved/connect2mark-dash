import { useState, useContext } from 'react';
import { useParams } from 'react-router-dom';

import { AuthContext } from '@context';

import { fireToast } from '@hooks';
import { Breadcrumb } from '@components';

import { constants } from '../../constants';

import { FireToastEnum } from '@enums';

import type { UserContextProps } from '@types';

type EditUserPassword = {
    password: string;
    confirmationPassword: string;
};

export default function ChangePassword() {
    const { id } = useParams();

    const { user, setLoading } = useContext(AuthContext) as UserContextProps;

    const [currentUserPasswords, setCurrentUserPasswords] =
        useState<EditUserPassword>({
            password: '',
            confirmationPassword: '',
        });

    const handleSubmit = async (e: React.MouseEvent) => {
        try {
            e.preventDefault;

            if (
                !currentUserPasswords.password ||
                !currentUserPasswords.confirmationPassword
            ) {
                throw new Error('Please fill all required input fields');
            }

            if (
                currentUserPasswords.password !==
                currentUserPasswords.confirmationPassword
            ) {
                throw new Error('Passwords do not match');
            }

            setLoading(true);

            const res = await fetch(`${constants.USERS}/password/${id}`, {
                method: 'PATCH',
                headers: {
                    accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.accessToken}`,
                },
                body: JSON.stringify({
                    new_password: currentUserPasswords.password,
                }),
            });

            const response = await res.json();

            if (res.status !== 200)
                throw new Error(
                    typeof response?.detail === 'string'
                        ? response.detail
                        : 'Something went wrong',
                );

            fireToast(
                'Success',
                'Password changed successfully',
                FireToastEnum.SUCCESS,
            );
        } catch (err: any) {
            fireToast(
                'There seems to be a problem',
                err.message,
                FireToastEnum.DANGER,
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="mx-auto max-w-270">
                <Breadcrumb pageName="Edit User Password" />

                <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                    <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
                        <h3 className="font-medium text-black dark:text-white">
                            User Credentials
                        </h3>
                    </div>
                    <form action="#">
                        <div className="p-6.5">
                            <div className="mb-4.5">
                                <label className="mb-2.5 block text-black dark:text-white">
                                    Password{' '}
                                    <span className="text-meta-1">*</span>
                                </label>
                                <input
                                    type="password"
                                    placeholder="Enter new password"
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                    onChange={(e) => {
                                        setCurrentUserPasswords((prev) => ({
                                            ...prev,
                                            password: e.target.value,
                                        }));
                                    }}
                                />
                            </div>

                            <div className="mb-5.5">
                                <label className="mb-2.5 block text-black dark:text-white">
                                    Re-type Password
                                </label>
                                <input
                                    type="password"
                                    placeholder="Re-enter password"
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                    onChange={(e) => {
                                        setCurrentUserPasswords((prev) => ({
                                            ...prev,
                                            confirmationPassword:
                                                e.target.value,
                                        }));
                                    }}
                                />
                            </div>

                            <button
                                onClick={handleSubmit}
                                className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray"
                            >
                                Submit
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
