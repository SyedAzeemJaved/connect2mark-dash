import { useState, useContext } from 'react';

import { AuthContext } from '@context';
import { UserContextProps } from '@types';

import { fireToast } from '@hooks';
import { Breadcrumb } from '@components';

import { FireToastEnum } from '@types';
import { constants } from '@constants';

type CreateStaffProps = {
    full_name: string;
    email: string;
    password: string;
    confirmationPassword: string;
};

export default function AddStaff() {
    const { user, setLoading } = useContext(AuthContext) as UserContextProps;

    const [staff, setStaff] = useState<CreateStaffProps>({
        full_name: '',
        email: '',
        password: '',
        confirmationPassword: '',
    });

    const handleSubmit = async (e: React.MouseEvent) => {
        try {
            e.preventDefault();

            if (!staff.full_name || !staff.email || !staff.password) {
                throw new Error('Please fill all input fields');
            }

            if (staff.password !== staff.confirmationPassword) {
                throw new Error('Passwords do not match');
            }

            setLoading(true);

            const res = await fetch(`${constants.USERS}`, {
                method: 'POST',
                headers: {
                    accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.accessToken}`,
                },
                body: JSON.stringify({
                    full_name: staff.full_name,
                    email: staff.email,
                    password: staff.password,
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
                'Staff member added successfully',
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
            <Breadcrumb pageName="Add Staff Member" />
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
                    <h3 className="font-medium text-black dark:text-white">
                        Add a new staff member to Connect2Mark
                    </h3>
                </div>
                <form action="#">
                    <div className="p-6.5">
                        <div className="mb-4.5">
                            <label className="mb-2.5 block text-black dark:text-white">
                                Full name <span className="text-meta-1">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Enter their full name"
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                onChange={(e) => {
                                    setStaff((prev) => ({
                                        ...prev,
                                        full_name: e.target.value,
                                    }));
                                }}
                            />
                        </div>

                        <div className="mb-4.5">
                            <label className="mb-2.5 block text-black dark:text-white">
                                Email <span className="text-meta-1">*</span>
                            </label>
                            <input
                                type="email"
                                placeholder="Enter their email address"
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                onChange={(e) => {
                                    setStaff((prev) => ({
                                        ...prev,
                                        email: e.target.value,
                                    }));
                                }}
                            />
                        </div>

                        <div className="mb-4.5">
                            <label className="mb-2.5 block text-black dark:text-white">
                                Password <span className="text-meta-1">*</span>
                            </label>
                            <input
                                type="password"
                                placeholder="Enter password"
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                onChange={(e) => {
                                    setStaff((prev) => ({
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
                                    setStaff((prev) => ({
                                        ...prev,
                                        confirmationPassword: e.target.value,
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
        </>
    );
}
