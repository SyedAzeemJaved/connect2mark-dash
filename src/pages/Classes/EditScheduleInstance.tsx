import React, { useState, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { AuthContext } from '@context';

import { fireToast } from '@hooks';
import { Breadcrumb } from '@components';

import { constants } from '@constants';

import { FireToastEnum } from '@enums';
import type {
    AcademicUserProps,
    LocationProps,
    UserContextProps,
} from '@types';

type EditScheduleInstanceProps = {
    teacher_id: number;
    location_id: number;
};

export default function EditScheduleInstance() {
    const { id } = useParams();

    const { user, setLoading } = useContext(AuthContext) as UserContextProps;

    const [currentScheduleInstance, setCurrentScheduleInstance] =
        useState<EditScheduleInstanceProps>({
            teacher_id: 0,
            location_id: 0,
        });
    const [allTeachers, setAllTeachers] = useState<AcademicUserProps[]>([]);
    const [allLocations, setAllLocations] = useState<LocationProps[]>([]);

    const handleSubmit = async (e: React.MouseEvent) => {
        try {
            e.preventDefault();

            if (
                !currentScheduleInstance.teacher_id ||
                !currentScheduleInstance.location_id
            ) {
                throw new Error('Please fill all input fields');
            }

            setLoading(true);

            let body: EditScheduleInstanceProps = {
                teacher_id: currentScheduleInstance.teacher_id,
                location_id: currentScheduleInstance.location_id,
            };

            const res = await fetch(`${constants.SCHEDULE_INSTANCES}/${id}`, {
                method: 'PUT',
                headers: {
                    accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.accessToken}`,
                },
                body: JSON.stringify(body),
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
                'Class edited successfully',
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

    const fetchScheduleInstance = async (id: number) => {
        try {
            const res = await fetch(`${constants.SCHEDULE_INSTANCES}/${id}`, {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.accessToken}`,
                },
            });

            const response = await res.json();

            if (!res.ok)
                throw new Error(
                    typeof response?.detail === 'string'
                        ? response.detail
                        : 'Something went wrong',
                );

            setCurrentScheduleInstance({
                teacher_id: response.teacher.id,
                location_id: response.location.id,
            });
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

    const fetchAllTeachers = async () => {
        try {
            const res = await fetch(
                constants.USERS + '/academic?only_students=no',
                {
                    method: 'GET',
                    headers: {
                        accept: 'application/json',
                        Authorization: `Bearer ${user.accessToken}`,
                    },
                },
            );

            const response = await res.json();

            if (!res.ok)
                throw new Error(
                    typeof response?.detail === 'string'
                        ? response.detail
                        : 'Something went wrong',
                );

            const teachersArr: AcademicUserProps[] = response.items.map(
                (teacher: AcademicUserProps) => {
                    return {
                        id: teacher.id,
                        full_name: teacher.full_name,
                        email: teacher.email,
                        additional_details: {
                            phone: teacher.additional_details.phone,
                            department: teacher.additional_details.department,
                            designation: teacher.additional_details.designation,
                        },
                        created_at_in_utc: teacher.created_at_in_utc,
                        updated_at_in_utc: teacher.updated_at_in_utc,
                    };
                },
            );

            setAllTeachers(teachersArr);
        } catch (err: any) {
            fireToast(
                'There seems to be a problem',
                err.message,
                FireToastEnum.DANGER,
            );
        }
    };

    const fetchAllLocations = async () => {
        try {
            const res = await fetch(constants.LOCATIONS, {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                    Authorization: `Bearer ${user.accessToken}`,
                },
            });

            const response = await res.json();

            if (!res.ok)
                throw new Error(
                    typeof response?.detail === 'string'
                        ? response.detail
                        : 'Something went wrong',
                );

            const locationArr: LocationProps[] = response.items.map(
                (item: LocationProps) => {
                    return {
                        id: item.id,
                        title: item.title,
                        bluetooth_address: item.bluetooth_address,
                        coordinates: item.coordinates,
                        created_at_in_utc: item.created_at_in_utc,
                        updated_at_in_utc: item.updated_at_in_utc,
                    };
                },
            );

            setAllLocations(locationArr);
        } catch (err: any) {
            fireToast(
                'There seems to be a problem',
                err.message,
                FireToastEnum.DANGER,
            );
        }
    };

    useEffect(() => {
        if (id) {
            fetchScheduleInstance(parseInt(id));
            fetchAllTeachers();
            fetchAllLocations();
        }

        return () => {};
    }, [id]);

    return (
        <>
            <Breadcrumb pageName="Edit Class" />
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                    <h3 className="font-medium text-black dark:text-white">
                        Class Information
                    </h3>
                </div>
                <div className="p-6.5">
                    <form action="#">
                        <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                            <div className="w-full">
                                <label className="mb-2.5 block text-black dark:text-white">
                                    Teacher{' '}
                                    <span className="text-meta-1">*</span>
                                </label>
                                <div className="relative z-20 bg-transparent dark:bg-meta-4">
                                    <select
                                        className="relative z-20 w-full appearance-none rounded border border-stroke bg-gray px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-meta-4 dark:focus:border-primary"
                                        name="teacher_id"
                                        id="teacher_id"
                                        value={
                                            currentScheduleInstance.teacher_id
                                        }
                                        onChange={(e) => {
                                            setCurrentScheduleInstance(
                                                (prev) => ({
                                                    ...prev,
                                                    teacher_id: parseInt(
                                                        e.target.value,
                                                    ),
                                                }),
                                            );
                                        }}
                                    >
                                        <option value="0">
                                            Select teacher
                                        </option>
                                        {allTeachers.map(
                                            (teacher: AcademicUserProps) => {
                                                return (
                                                    <option
                                                        key={teacher.id}
                                                        value={teacher.id}
                                                    >
                                                        {teacher.full_name}
                                                    </option>
                                                );
                                            },
                                        )}
                                    </select>
                                    <span className="absolute right-4 top-1/2 z-30 -translate-y-1/2">
                                        <svg
                                            className="fill-current"
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <g opacity="0.8">
                                                <path
                                                    fillRule="evenodd"
                                                    clipRule="evenodd"
                                                    d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                                                    fill=""
                                                ></path>
                                            </g>
                                        </svg>
                                    </span>
                                </div>
                            </div>
                            <div className="w-full">
                                <label className="mb-2.5 block text-black dark:text-white">
                                    Location{' '}
                                    <span className="text-meta-1">*</span>
                                </label>
                                <div className="relative z-20 bg-transparent dark:bg-meta-4">
                                    <select
                                        className="relative z-20 w-full appearance-none rounded border border-stroke bg-gray px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-meta-4 dark:focus:border-primary"
                                        name="location_id"
                                        id="location_id"
                                        value={
                                            currentScheduleInstance.location_id
                                        }
                                        onChange={(e) => {
                                            setCurrentScheduleInstance(
                                                (prev) => ({
                                                    ...prev,
                                                    location_id: parseInt(
                                                        e.target.value,
                                                    ),
                                                }),
                                            );
                                        }}
                                    >
                                        <option value="0">
                                            Select location
                                        </option>
                                        {allLocations.map(
                                            (location: LocationProps) => {
                                                return (
                                                    <option
                                                        key={location.id}
                                                        value={location.id}
                                                    >
                                                        {location.title}
                                                    </option>
                                                );
                                            },
                                        )}
                                    </select>
                                    <span className="absolute right-4 top-1/2 z-30 -translate-y-1/2">
                                        <svg
                                            className="fill-current"
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <g opacity="0.8">
                                                <path
                                                    fillRule="evenodd"
                                                    clipRule="evenodd"
                                                    d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                                                    fill=""
                                                ></path>
                                            </g>
                                        </svg>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4.5">
                            <button
                                className="flex justify-center rounded border border-stroke px-6 py-2 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                                type="button"
                            >
                                Cancel
                            </button>
                            <button
                                className="flex justify-center rounded bg-primary px-6 py-2 font-medium text-gray hover:shadow-1"
                                type="button"
                                onClick={handleSubmit}
                            >
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
