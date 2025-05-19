import { useState, useContext } from 'react';

import { AuthContext } from '@context';

import { fireToast } from '@hooks';
import { Breadcrumb } from '@components';

import { constants } from '@constants';

import { FireToastEnum, AcademicUserTypeEnum } from '@enums';

import type { UserContextProps } from '@types';
import type { CreatePageProps } from './types';

type CreateUserProps = {
    full_name: string | undefined;
    email: string | undefined;
    password: string | undefined;
    confirmationPassword: string | undefined;
};

export default function AddAcademicUser(props: CreatePageProps) {
    const { user, setLoading } = useContext(AuthContext) as UserContextProps;

    const [data, setData] = useState<CreateUserProps>({
        full_name: undefined,
        email: undefined,
        password: undefined,
        confirmationPassword: undefined,
    });

    const handleSubmit = async (e: React.MouseEvent) => {
        try {
            e.preventDefault();

            if (
                !data?.full_name ||
                !data?.email ||
                !data?.password ||
                !data?.confirmationPassword
            ) {
                throw new Error('Please fill all input fields');
            }

            if (data.password !== data.confirmationPassword) {
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
                    full_name: data.full_name,
                    email: data.email,
                    password: data.password,
                    is_admin: false,
                    is_student: props?.type === AcademicUserTypeEnum.STUDENT,
                }),
            });

            const response = await res.json();

            if (!res.ok)
                throw new Error(
                    typeof response?.detail === 'string'
                        ? response.detail
                        : 'Something went wrong',
                );

            fireToast(
                'Success',
                `${props?.type === AcademicUserTypeEnum.STUDENT ? 'Student' : 'Teacher'} added successfully`,
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
            <Breadcrumb
                pageName={`Add ${props?.type === AcademicUserTypeEnum.STUDENT ? 'Student' : 'Teacher'}`}
            />
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
                    <h3 className="font-medium text-black dark:text-white">
                        Add a new{' '}
                        {props?.type === AcademicUserTypeEnum.STUDENT
                            ? 'student'
                            : 'teacher'}{' '}
                        to SafeCheck
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
                                    setData((prev) => ({
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
                                    setData((prev) => ({
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
                                    setData((prev) => ({
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
                                    setData((prev) => ({
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
