import React, { useState, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { AuthContext } from '@context';
import {
    StaffProps,
    LocationProps,
    FireToastEnum,
    UserContextProps,
} from '@types';

import { fireToast } from '@hooks';
import { Breadcrumb } from '@components';

import { constants } from '@constants';

import { convertTo24HourUTC, convertToUTCDate } from '@utils';

type EditScheduleProps = {
    id: number;
    title: string;
    start_time_in_utc: string;
    end_time_in_utc: string;
    is_reoccurring: boolean;

    staff_member_id: number;
    location_id: number;

    date: string | null;
    day:
        | 'monday'
        | 'tuesday'
        | 'wednesday'
        | 'thursday'
        | 'friday'
        | 'saturday'
        | 'sunday'
        | null;
};

export default function EditSchedule() {
    const { id } = useParams();

    const { user, setLoading } = useContext(AuthContext) as UserContextProps;

    const [currentSchedule, setCurrentSchedule] = useState<EditScheduleProps>({
        id: 0,
        title: '',
        start_time_in_utc: '',
        end_time_in_utc: '',
        is_reoccurring: false,

        staff_member_id: 0,
        location_id: 0,

        date: null,
        day: 'monday',
    });
    const [allStaff, setAllStaff] = useState<StaffProps[]>([]);
    const [allLocations, setAllLocations] = useState<LocationProps[]>([]);

    const handleStartOrEndTime = (e: React.ChangeEvent<HTMLInputElement>) => {
        const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9] [APap][mM]$/; // Regular expression pattern
        const inputValue = e.target.value;

        if (!inputValue) {
            return;
        }

        if (timeRegex.test(inputValue)) {
            setCurrentSchedule({
                ...currentSchedule,
                [e.target.name]: convertTo24HourUTC(inputValue),
            });
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
        setCurrentSchedule({
            ...currentSchedule,
            [e.target.name]: convertToUTCDate(inputDate),
        });
    };

    const handleSubmit = async (e: React.MouseEvent) => {
        try {
            e.preventDefault();

            if (
                !currentSchedule.title ||
                !currentSchedule.start_time_in_utc ||
                !currentSchedule.end_time_in_utc ||
                !currentSchedule.staff_member_id ||
                !currentSchedule.location_id
            ) {
                throw new Error('Please fill all input fields');
            }

            if (currentSchedule.is_reoccurring) {
                if (!currentSchedule.day) {
                    throw new Error('Reoccurring schedules must have a day');
                }
            } else {
                if (!currentSchedule.date) {
                    throw new Error(
                        'Non-reoccurring schedules must have a date',
                    );
                }
            }

            setLoading(true);

            let url = currentSchedule.is_reoccurring
                ? '/reoccurring'
                : '/non-reoccurring';
            let body: EditScheduleProps = {
                id: currentSchedule.id,
                title: currentSchedule.title,
                start_time_in_utc: currentSchedule.start_time_in_utc,
                end_time_in_utc: currentSchedule.end_time_in_utc,
                is_reoccurring: currentSchedule.is_reoccurring,
                staff_member_id: currentSchedule.staff_member_id,
                location_id: currentSchedule.location_id,
                day: null,
                date: null,
            };
            if (currentSchedule.is_reoccurring) {
                body.day = currentSchedule.day;
            } else {
                body.date = currentSchedule.date;
            }

            const res = await fetch(`${constants.SCHEDULES + url}/${id}`, {
                method: 'PUT',
                headers: {
                    accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.accessToken}`,
                },
                body: JSON.stringify(body),
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
                'Schedule edited successfully',
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

    const fetchSchedule = async (id: number) => {
        try {
            const res = await fetch(`${constants.SCHEDULES}/${id}`, {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.accessToken}`,
                },
            });

            const response = await res.json();

            if (res.status !== 200)
                throw new Error(
                    typeof response?.detail === 'string'
                        ? response.detail
                        : 'Something went wrong',
                );

            setCurrentSchedule({
                id: response.id,
                title: response.title,
                start_time_in_utc: response.start_time_in_utc,
                end_time_in_utc: response.end_time_in_utc,
                is_reoccurring: response.is_reoccurring,

                staff_member_id: response.staff_member.id,
                location_id: response.location.id,

                date: response.date,
                day: response.day,
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

    const fetchAllStaff = async () => {
        try {
            const res = await fetch(constants.USERS + '/staff', {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                    Authorization: `Bearer ${user.accessToken}`,
                },
            });

            const response = await res.json();

            if (res.status !== 200)
                throw new Error(
                    typeof response?.detail === 'string'
                        ? response.detail
                        : 'Something went wrong',
                );

            const staffArr: StaffProps[] = response.items.map(
                (staff: StaffProps) => {
                    return {
                        id: staff.id,
                        full_name: staff.full_name,
                        email: staff.email,
                        additional_details: {
                            phone: staff.additional_details.phone,
                            department: staff.additional_details.department,
                            designation: staff.additional_details.designation,
                        },
                        created_at_in_utc: staff.created_at_in_utc,
                        updated_at_in_utc: staff.updated_at_in_utc,
                    };
                },
            );

            setAllStaff(staffArr);
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

            if (res.status !== 200)
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
            fetchSchedule(parseInt(id));
            fetchAllStaff();
            fetchAllLocations();
        }

        return () => {};
    }, [id]);

    return (
        <>
            <Breadcrumb pageName="Edit Schedule" />
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                    <h3 className="font-medium text-black dark:text-white">
                        Schedule Information
                    </h3>
                </div>
                <div className="p-6.5">
                    <form action="#">
                        <div className="mb-4.5">
                            <label
                                className="mb-2.5 block text-sm font-medium text-black dark:text-white"
                                htmlFor="title"
                            >
                                Title
                            </label>
                            <input
                                className="w-full rounded border border-stroke bg-gray px-5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                                type="text"
                                name="title"
                                id="title"
                                placeholder="Enter schedule title"
                                value={currentSchedule.title}
                                onChange={(e) => {
                                    setCurrentSchedule({
                                        ...currentSchedule,
                                        [e.target.name]: e.target.value,
                                    });
                                }}
                            />
                        </div>

                        <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                            <div className="w-full sm:w-1/2">
                                <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
                                    Start time
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Enter schedule start time [HH:MM: AM/PM]"
                                        className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                                        pattern="^(0?[1-9]|1[0-2]):[0-5][0-9] [APap][mM]$"
                                        name="start_time_in_utc"
                                        id="start_time_in_utc"
                                        defaultValue={
                                            currentSchedule.start_time_in_utc
                                        }
                                        onBlur={handleStartOrEndTime}
                                    />
                                </div>
                            </div>

                            <div className="w-full sm:w-1/2">
                                <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
                                    End time
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Enter schedule end time [HH:MM: AM/PM]"
                                        className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                                        pattern="^(0?[1-9]|1[0-2]):[0-5][0-9] [APap][mM]$"
                                        name="end_time_in_utc"
                                        id="end_time_in_utc"
                                        defaultValue={
                                            currentSchedule.end_time_in_utc
                                        }
                                        onBlur={handleStartOrEndTime}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                            <div className="w-full">
                                <label className="mb-2.5 block text-black dark:text-white">
                                    Staff member{' '}
                                    <span className="text-meta-1">*</span>
                                </label>
                                <div className="relative z-20 bg-transparent dark:bg-meta-4">
                                    <select
                                        className="relative z-20 w-full appearance-none rounded border border-stroke bg-gray px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-meta-4 dark:focus:border-primary"
                                        name="staff_member_id"
                                        id="staff_member_id"
                                        value={currentSchedule.staff_member_id}
                                        onChange={(e) => {
                                            setCurrentSchedule((prev) => ({
                                                ...prev,
                                                staff_member_id: parseInt(
                                                    e.target.value,
                                                ),
                                            }));
                                        }}
                                    >
                                        <option value="0">
                                            Select staff member
                                        </option>
                                        {allStaff.map((staff: StaffProps) => {
                                            return (
                                                <option
                                                    key={staff.id}
                                                    value={staff.id}
                                                >
                                                    {staff.full_name}
                                                </option>
                                            );
                                        })}
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
                                        value={currentSchedule.location_id}
                                        onChange={(e) => {
                                            setCurrentSchedule((prev) => ({
                                                ...prev,
                                                location_id: parseInt(
                                                    e.target.value,
                                                ),
                                            }));
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
                                        currentSchedule.is_reoccurring &&
                                        'custom-btn-group-selected'
                                    }`}
                                    onClick={(e) =>
                                        setCurrentSchedule((prev) => ({
                                            ...prev,
                                            is_reoccurring: true,
                                            date: null,
                                        }))
                                    }
                                >
                                    Reoccurring
                                </button>
                                <button
                                    type="button"
                                    className={`custom-btn-group w-1/2 rounded-e-lg border border-b border-l-0 border-t px-5 py-3 font-medium ${
                                        !currentSchedule.is_reoccurring &&
                                        'custom-btn-group-selected'
                                    }`}
                                    onClick={(e) =>
                                        setCurrentSchedule((prev) => ({
                                            ...prev,
                                            is_reoccurring: false,
                                            day: null,
                                        }))
                                    }
                                >
                                    Non-reoccurring
                                </button>
                            </div>
                        </div>

                        <div
                            className={`mb-4.5 ${
                                !currentSchedule.is_reoccurring && 'hidden'
                            }`}
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
                                        currentSchedule.day === 'monday' &&
                                        'custom-btn-group-selected'
                                    }`}
                                    onClick={(e) =>
                                        setCurrentSchedule((prev) => ({
                                            ...prev,
                                            day: 'monday',
                                        }))
                                    }
                                >
                                    Monday
                                </button>
                                <button
                                    type="button"
                                    className={`custom-btn-group w-50 border border-b border-r-0 border-t px-5 py-3 font-medium ${
                                        currentSchedule.day === 'tuesday' &&
                                        'custom-btn-group-selected'
                                    }`}
                                    onClick={(e) =>
                                        setCurrentSchedule((prev) => ({
                                            ...prev,
                                            day: 'tuesday',
                                        }))
                                    }
                                >
                                    Tuesday
                                </button>
                                <button
                                    type="button"
                                    className={`custom-btn-group w-50 border border-b border-r-0 border-t px-5 py-3 font-medium ${
                                        currentSchedule.day === 'wednesday' &&
                                        'custom-btn-group-selected'
                                    }`}
                                    onClick={(e) =>
                                        setCurrentSchedule((prev) => ({
                                            ...prev,
                                            day: 'wednesday',
                                        }))
                                    }
                                >
                                    Wednesday
                                </button>
                                <button
                                    type="button"
                                    className={`custom-btn-group w-50 border border-b border-r-0 border-t px-5 py-3 font-medium ${
                                        currentSchedule.day === 'thursday' &&
                                        'custom-btn-group-selected'
                                    }`}
                                    onClick={(e) =>
                                        setCurrentSchedule((prev) => ({
                                            ...prev,
                                            day: 'thursday',
                                        }))
                                    }
                                >
                                    Thursday
                                </button>
                                <button
                                    type="button"
                                    className={`custom-btn-group w-50 border border-b border-r-0 border-t px-5 py-3 font-medium ${
                                        currentSchedule.day === 'friday' &&
                                        'custom-btn-group-selected'
                                    }`}
                                    onClick={(e) =>
                                        setCurrentSchedule((prev) => ({
                                            ...prev,
                                            day: 'friday',
                                        }))
                                    }
                                >
                                    Friday
                                </button>
                                <button
                                    type="button"
                                    className={`custom-btn-group w-50 border border-b border-r-0 border-t px-5 py-3 font-medium ${
                                        currentSchedule.day === 'saturday' &&
                                        'custom-btn-group-selected'
                                    }`}
                                    onClick={(e) =>
                                        setCurrentSchedule((prev) => ({
                                            ...prev,
                                            day: 'saturday',
                                        }))
                                    }
                                >
                                    Saturaday
                                </button>
                                <button
                                    type="button"
                                    className={`custom-btn-group w-50 rounded-e-lg border border-b border-r-0 border-t px-5 py-3 font-medium ${
                                        currentSchedule.day === 'sunday' &&
                                        'custom-btn-group-selected'
                                    }`}
                                    onClick={(e) =>
                                        setCurrentSchedule((prev) => ({
                                            ...prev,
                                            day: 'sunday',
                                        }))
                                    }
                                >
                                    Sunday
                                </button>
                            </div>
                        </div>

                        <div
                            className={`mb-4.5 ${currentSchedule.is_reoccurring && 'hidden'}`}
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
                                defaultValue={currentSchedule.date ?? ''}
                                onBlur={handleDate}
                            />
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
