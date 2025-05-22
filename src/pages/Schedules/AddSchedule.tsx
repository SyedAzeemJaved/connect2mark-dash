import React, { useState, useEffect, useContext } from 'react';

import { AuthContext } from '@context';

import { fireToast } from '@hooks';
import { Breadcrumb } from '@components';

import { constants } from '@constants';

import { convertTo24HourUTC, convertToUTCDate } from '@utils';

import { FireToastEnum } from '@enums';

import type {
    AcademicUserProps,
    LocationProps,
    UserContextProps,
} from '@types';

type CreateScheduleProps = {
    title: string | undefined;

    start_time_in_utc: string | undefined;
    end_time_in_utc: string | undefined;

    is_reoccurring: boolean;

    location_id: number | undefined;
    teacher_id: number | undefined;

    students: number[];

    date: string | null | undefined;
    day:
        | 'monday'
        | 'tuesday'
        | 'wednesday'
        | 'thursday'
        | 'friday'
        | 'saturday'
        | 'sunday'
        | undefined
        | null;
};

export default function AddSchedule() {
    const { user, setLoading } = useContext(AuthContext) as UserContextProps;

    const [data, setData] = useState<{
        locations: LocationProps[];
        teachers: AcademicUserProps[];
        students: AcademicUserProps[];
        schedule: CreateScheduleProps;
    }>({
        locations: [],
        teachers: [],
        students: [],
        schedule: {
            title: undefined,
            start_time_in_utc: undefined,
            end_time_in_utc: undefined,
            is_reoccurring: true,
            location_id: undefined,
            teacher_id: undefined,
            date: undefined,
            day: undefined,
            students: [],
        },
    });

    const handleStartOrEndTime = (e: React.ChangeEvent<HTMLInputElement>) => {
        const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9] [APap][mM]$/; // Regular expression pattern
        const inputValue = e.target.value;

        if (!inputValue) {
            return;
        }

        if (timeRegex.test(inputValue)) {
            setData((prev) => ({
                ...prev,
                schedule: {
                    ...prev.schedule,
                    [e.target.name]: convertTo24HourUTC(inputValue),
                },
            }));
        } else {
            e.target.value = '';
            fireToast(
                'Invalid time format',
                'Please enter time in HH:MM AM/PM format',
                FireToastEnum.WARNING,
            );
        }
    };

    const handleDate = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        const inputDate = e.target.value;

        if (!inputDate) {
            return;
        }

        // If the format doesn't match 'YYYY-MM-DD'
        if (!dateRegex.test(inputDate)) {
            e.target.value = '';

            fireToast(
                'Invalid date format',
                'Please enter date in YYYY-MM-DD format',
                FireToastEnum.WARNING,
            );
            return;
        }

        // If it's an invalid date (e.g., February 31)
        const dateParts = inputDate.split('-');
        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed in JavaScript (0 - 11)
        const day = parseInt(dateParts[2]);

        const dateObject = new Date(year, month, day);

        if (
            dateObject.getFullYear() !== year ||
            dateObject.getMonth() !== month ||
            dateObject.getDate() !== day
        ) {
            e.target.value = '';

            fireToast(
                'Invalid date format',
                'Please enter date in YYYY-MM-DD format',
                FireToastEnum.WARNING,
            );
            return;
        }

        // All checks were true
        setData((prev) => ({
            ...prev,
            schedule: {
                ...prev.schedule,
                [e.target.name]: convertToUTCDate(inputDate),
            },
        }));
    };

    const handleSubmit = async (e: React.MouseEvent) => {
        try {
            e.preventDefault();

            if (
                !data?.schedule?.title ||
                !data?.schedule?.start_time_in_utc ||
                !data?.schedule?.end_time_in_utc ||
                !data?.schedule?.location_id ||
                !data?.schedule?.teacher_id
            ) {
                throw new Error('Please fill all input fields');
            }

            if (data?.schedule?.is_reoccurring) {
                if (!data?.schedule?.day) {
                    throw new Error('Reoccurring schedules must have a day');
                }
            } else {
                if (!data?.schedule?.date) {
                    throw new Error(
                        'Non-reoccurring schedules must have a date',
                    );
                }
            }

            setLoading(true);

            let url = data?.schedule?.is_reoccurring
                ? '/reoccurring'
                : '/non-reoccurring';

            let body: CreateScheduleProps = {
                title: data?.schedule.title,
                start_time_in_utc: data?.schedule?.start_time_in_utc,
                end_time_in_utc: data?.schedule?.end_time_in_utc,
                is_reoccurring: data?.schedule?.is_reoccurring,
                location_id: data?.schedule?.location_id,
                teacher_id: data?.schedule?.teacher_id,
                students: data?.schedule?.students,
                day: null,
                date: null,
            };

            if (data?.schedule?.is_reoccurring) {
                body.day = data?.schedule?.day;
            } else {
                body.date = data?.schedule?.date;
            }

            const res = await fetch(constants.SCHEDULES + url, {
                method: 'POST',
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
                'Schedule added successfully',
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

            const academicUsers: AcademicUserProps[] = response.items.map(
                (academicUser: AcademicUserProps) => {
                    return {
                        id: academicUser.id,
                        full_name: academicUser.full_name,
                        email: academicUser.email,
                        additional_details: {
                            phone: academicUser.additional_details.phone,
                            department:
                                academicUser.additional_details.department,
                            designation:
                                academicUser.additional_details.designation,
                        },
                        created_at_in_utc: academicUser.created_at_in_utc,
                        updated_at_in_utc: academicUser.updated_at_in_utc,
                    };
                },
            );

            setData((prev) => ({
                ...prev,
                teachers: academicUsers,
            }));
        } catch (err: any) {
            fireToast(
                'There seems to be a problem',
                err.message,
                FireToastEnum.DANGER,
            );
        }
    };

    const fetchAllStudents = async () => {
        try {
            const res = await fetch(
                constants.USERS + '/academic?only_students=yes',
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

            const academicUsers: AcademicUserProps[] = response.items.map(
                (academicUser: AcademicUserProps) => {
                    return {
                        id: academicUser.id,
                        full_name: academicUser.full_name,
                        email: academicUser.email,
                        additional_details: {
                            phone: academicUser.additional_details.phone,
                            department:
                                academicUser.additional_details.department,
                            designation:
                                academicUser.additional_details.designation,
                        },
                        created_at_in_utc: academicUser.created_at_in_utc,
                        updated_at_in_utc: academicUser.updated_at_in_utc,
                    };
                },
            );

            setData((prev) => ({
                ...prev,
                students: academicUsers,
            }));
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

            setData((prev) => ({
                ...prev,
                locations: locationArr,
            }));
        } catch (err: any) {
            fireToast(
                'There seems to be a problem',
                err.message,
                FireToastEnum.DANGER,
            );
        }
    };

    useEffect(() => {
        fetchAllTeachers();
        fetchAllStudents();
        fetchAllLocations();

        return () => {};
    }, []);

    return (
        <>
            <Breadcrumb pageName="Add Schedule" />

            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
                    <h3 className="font-medium text-black dark:text-white">
                        Add a new schedule to SafeCheck
                    </h3>
                </div>
                <form action="#">
                    <div className="p-6.5">
                        <div className="mb-4.5">
                            <label className="mb-2.5 block text-black dark:text-white">
                                Title <span className="text-meta-1">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Enter schedule title"
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                name="title"
                                id="title"
                                onChange={(e) => {
                                    setData((prev) => ({
                                        ...prev,
                                        schedule: {
                                            ...prev.schedule,
                                            [e.target.name]: e.target.value,
                                        },
                                    }));
                                }}
                            />
                        </div>

                        <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                            <div className="w-full">
                                <label className="mb-2.5 block text-black dark:text-white">
                                    Start time{' '}
                                    <span className="text-meta-1">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter schedule start time [HH:MM AM/PM]"
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                    pattern="^(0?[1-9]|1[0-2]):[0-5][0-9] [APap][mM]$"
                                    name="start_time_in_utc"
                                    id="start_time_in_utc"
                                    onBlur={handleStartOrEndTime}
                                />
                            </div>
                            <div className="w-full">
                                <label className="mb-2.5 block text-black dark:text-white">
                                    End time{' '}
                                    <span className="text-meta-1">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter schedule end time [HH:MM AM/PM]"
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                    pattern="^(0?[1-9]|1[0-2]):[0-5][0-9] [APap][mM]$"
                                    name="end_time_in_utc"
                                    id="end_time_in_utc"
                                    onBlur={handleStartOrEndTime}
                                />
                            </div>
                        </div>

                        <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                            <div className="w-full">
                                <label className="mb-2.5 block text-black dark:text-white">
                                    Teacher{' '}
                                    <span className="text-meta-1">*</span>
                                </label>
                                <div className="relative z-20">
                                    <select
                                        className="w-full appearance-none rounded border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                        onChange={(e) => {
                                            setData((prev) => ({
                                                ...prev,
                                                schedule: {
                                                    ...prev.schedule,
                                                    teacher_id: parseInt(
                                                        e.target.value,
                                                    ),
                                                },
                                            }));
                                        }}
                                    >
                                        <option value="0">
                                            Select teacher
                                        </option>
                                        {data?.teachers?.map(
                                            (
                                                academicUser: AcademicUserProps,
                                            ) => {
                                                return (
                                                    <option
                                                        key={academicUser.id}
                                                        value={academicUser.id}
                                                    >
                                                        {academicUser.full_name}
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
                                <div className="relative z-20">
                                    <select
                                        className="w-full appearance-none rounded border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                        onChange={(e) => {
                                            setData((prev) => ({
                                                ...prev,
                                                schedule: {
                                                    ...prev.schedule,
                                                    location_id: parseInt(
                                                        e.target.value,
                                                    ),
                                                },
                                            }));
                                        }}
                                    >
                                        <option value="0">
                                            Select location
                                        </option>
                                        {data?.locations?.map(
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

                        <div className="mb-4.5">
                            <label className="mb-2.5 block text-black dark:text-white">
                                Students <span className="text-meta-1">*</span>
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {data?.students?.map(
                                    (academicUser: AcademicUserProps) => {
                                        const isSelected =
                                            data.schedule.students.includes(
                                                academicUser.id,
                                            );
                                        return (
                                            <button
                                                type="button"
                                                key={academicUser.id}
                                                onClick={() => {
                                                    setData((prev) => {
                                                        const selected =
                                                            prev.schedule
                                                                .students;
                                                        const already =
                                                            selected.includes(
                                                                academicUser.id,
                                                            );
                                                        return {
                                                            ...prev,
                                                            schedule: {
                                                                ...prev.schedule,
                                                                students:
                                                                    already
                                                                        ? selected.filter(
                                                                              (
                                                                                  id,
                                                                              ) =>
                                                                                  id !==
                                                                                  academicUser.id,
                                                                          )
                                                                        : [
                                                                              ...selected,
                                                                              academicUser.id,
                                                                          ],
                                                            },
                                                        };
                                                    });
                                                }}
                                                className={`rounded border px-4 py-2 transition 
                        ${
                            isSelected
                                ? 'border-primary bg-primary text-white'
                                : 'border-stroke bg-white text-black dark:border-form-strokedark dark:bg-form-input dark:text-white'
                        }
                        hover:bg-primary hover:text-white`}
                                            >
                                                {academicUser.full_name}
                                                {isSelected && (
                                                    <span className="text-green-400 ml-2 font-bold">
                                                        &#10003;
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    },
                                )}
                            </div>
                            <div className="text-gray-500 mt-2 text-xs">
                                {data.schedule.students.length === 0
                                    ? 'No students selected'
                                    : `${data.schedule.students.length} selected`}
                            </div>
                        </div>

                        <div className="mb-4.5">
                            <label className="mb-2.5 block text-black dark:text-white">
                                Status <span className="text-meta-1">*</span>
                            </label>
                            <div
                                className="text-gray-900 inline-flex w-full rounded-md text-sm shadow-sm"
                                role="group"
                            >
                                <button
                                    type="button"
                                    className={`custom-btn-group w-1/2 rounded-s-lg border border-b border-r-0 border-t px-5 py-3 font-medium ${
                                        data?.schedule?.is_reoccurring &&
                                        'custom-btn-group-selected'
                                    }`}
                                    onClick={(e) =>
                                        setData((prev) => ({
                                            ...prev,
                                            schedule: {
                                                ...prev.schedule,
                                                is_reoccurring: true,
                                                date: null,
                                            },
                                        }))
                                    }
                                >
                                    Reoccurring
                                </button>
                                <button
                                    type="button"
                                    className={`custom-btn-group w-1/2 rounded-e-lg border border-b border-l-0 border-t px-5 py-3 font-medium ${
                                        !data?.schedule?.is_reoccurring &&
                                        'custom-btn-group-selected'
                                    }`}
                                    onClick={(e) =>
                                        setData((prev) => ({
                                            ...prev,
                                            schedule: {
                                                ...prev.schedule,
                                                is_reoccurring: false,
                                                day: null,
                                            },
                                        }))
                                    }
                                >
                                    Non-reoccurring
                                </button>
                            </div>
                        </div>

                        <div
                            className={`mb-4.5 ${!data?.schedule?.is_reoccurring && 'hidden'}`}
                        >
                            <label className="mb-2.5 block text-black dark:text-white">
                                Day
                                <span className="text-meta-1">*</span>
                            </label>
                            <div
                                className="text-gray-900 inline-flex w-full rounded-md text-sm shadow-sm"
                                role="group"
                            >
                                <button
                                    type="button"
                                    className={`custom-btn-group w-50 rounded-s-lg border border-b border-r-0 border-t px-5 py-3 font-medium ${
                                        data?.schedule.day === 'monday' &&
                                        'custom-btn-group-selected'
                                    }`}
                                    onClick={(e) =>
                                        setData((prev) => ({
                                            ...prev,
                                            schedule: {
                                                ...prev.schedule,
                                                day: 'monday',
                                            },
                                        }))
                                    }
                                >
                                    Monday
                                </button>
                                <button
                                    type="button"
                                    className={`custom-btn-group w-50 border border-b border-r-0 border-t px-5 py-3 font-medium ${
                                        data?.schedule.day === 'tuesday' &&
                                        'custom-btn-group-selected'
                                    }`}
                                    onClick={(e) =>
                                        setData((prev) => ({
                                            ...prev,
                                            schedule: {
                                                ...prev.schedule,
                                                day: 'tuesday',
                                            },
                                        }))
                                    }
                                >
                                    Tuesday
                                </button>
                                <button
                                    type="button"
                                    className={`custom-btn-group w-50 border border-b border-r-0 border-t px-5 py-3 font-medium ${
                                        data?.schedule.day === 'wednesday' &&
                                        'custom-btn-group-selected'
                                    }`}
                                    onClick={(e) =>
                                        setData((prev) => ({
                                            ...prev,
                                            schedule: {
                                                ...prev.schedule,
                                                day: 'wednesday',
                                            },
                                        }))
                                    }
                                >
                                    Wednesday
                                </button>
                                <button
                                    type="button"
                                    className={`custom-btn-group w-50 border border-b border-r-0 border-t px-5 py-3 font-medium ${
                                        data?.schedule.day === 'thursday' &&
                                        'custom-btn-group-selected'
                                    }`}
                                    onClick={(e) =>
                                        setData((prev) => ({
                                            ...prev,
                                            schedule: {
                                                ...prev.schedule,
                                                day: 'thursday',
                                            },
                                        }))
                                    }
                                >
                                    Thursday
                                </button>
                                <button
                                    type="button"
                                    className={`custom-btn-group w-50 border border-b border-r-0 border-t px-5 py-3 font-medium ${
                                        data?.schedule.day === 'friday' &&
                                        'custom-btn-group-selected'
                                    }`}
                                    onClick={(e) =>
                                        setData((prev) => ({
                                            ...prev,
                                            schedule: {
                                                ...prev.schedule,
                                                day: 'friday',
                                            },
                                        }))
                                    }
                                >
                                    Friday
                                </button>
                                <button
                                    type="button"
                                    className={`custom-btn-group w-50 border border-b border-r-0 border-t px-5 py-3 font-medium ${
                                        data?.schedule.day === 'saturday' &&
                                        'custom-btn-group-selected'
                                    }`}
                                    onClick={(e) =>
                                        setData((prev) => ({
                                            ...prev,
                                            schedule: {
                                                ...prev.schedule,
                                                day: 'saturday',
                                            },
                                        }))
                                    }
                                >
                                    Saturaday
                                </button>
                                <button
                                    type="button"
                                    className={`custom-btn-group w-50 rounded-e-lg border border-b border-r-0 border-t px-5 py-3 font-medium ${
                                        data?.schedule.day === 'sunday' &&
                                        'custom-btn-group-selected'
                                    }`}
                                    onClick={(e) =>
                                        setData((prev) => ({
                                            ...prev,
                                            schedule: {
                                                ...prev.schedule,
                                                day: 'sunday',
                                            },
                                        }))
                                    }
                                >
                                    Sunday
                                </button>
                            </div>
                        </div>

                        <div
                            className={`mb-4.5 ${data?.schedule.is_reoccurring && 'hidden'}`}
                        >
                            <label className="mb-2.5 block text-black dark:text-white">
                                Date
                                <span className="text-meta-1">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Enter schedule date [YYYY-MM-DD]"
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                name="date"
                                id="date"
                                pattern="\d{4}-\d{2}-\d{2}"
                                onBlur={handleDate}
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
