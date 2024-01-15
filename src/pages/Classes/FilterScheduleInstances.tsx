import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { AuthContext } from '@context';
import {
    ScheduleProps,
    ApiResponse,
    FireToastEnum,
    UserContextProps,
} from '@types';

import { fireToast } from '@hooks';
import { Breadcrumb, Pagination } from '@components';

import { constants } from '@constants';

import { getCurrentDayString, TimestampConverter } from '../../utils/time';

type FilterSelectedProps = {
    filter: 'date' | 'day' | 'today';
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

export default function FilterSchedules() {
    const { user } = useContext(AuthContext) as UserContextProps;

    const [AllSchedules, setAllSchedules] = useState<ScheduleProps[] | []>([]);
    const [selectedFilter, setSelectedFilter] = useState<FilterSelectedProps>({
        filter: 'today',
        date: null,
        day: getCurrentDayString(new Date().getDay()),
    });
    const [pageNumber, setPageNumber] = useState(1);
    const [apiResponse, setApiResponse] = useState<ApiResponse>({
        total: 0,
        page: 0,
        size: constants.RESULTS_PER_PAGE,
        pages: 0,
        items: [],
    });

    const navigate = useNavigate();

    const isDateValidRegex = (inputDate: string) => {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        // If the format doesn't match 'YYYY-MM-DD'
        if (dateRegex.test(inputDate)) {
            return true;
        }
        // fireToast(
        //   'Invalid date format',
        //   'Please enter date in YYYY-MM-DD format',
        //   FireToastEnum.WARNING,
        // );
        return false;
    };

    const isDateValid = (inputDate: string) => {
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
            fireToast(
                'Invalid date',
                'Please enter a valid date in YYYY-MM-DD format',
                FireToastEnum.WARNING,
            );
            return false;
        }
        return true;
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // All checks were true
        setSelectedFilter({
            ...selectedFilter,
            [e.target.name]: e.target.value,
        });
    };

    const handleSelectedFilterChange: React.MouseEventHandler<
        HTMLButtonElement
    > = (e) => {
        setAllSchedules([]);
        setSelectedFilter({
            ...selectedFilter,
            filter: e.currentTarget.name,
        });
    };

    const handleEditClick = (id: number) => {
        navigate(`/schedules/${id}`);
    };

    const handleDeleteClick = async (id: number) => {
        let r = confirm('Are you sure you want to delete this schedule?');
        if (r === true) {
            try {
                const res = await fetch(`${constants.SCHEDULES}/${id}`, {
                    method: 'DELETE',
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

                fireToast(
                    'Success',
                    'Schedule deleted successfully',
                    FireToastEnum.SUCCESS,
                );
            } catch (err: any) {
                fireToast(
                    'There seems to be a problem',
                    err.message,
                    FireToastEnum.DANGER,
                );
            } finally {
                fetchSchedules();
            }
        }
    };

    const fetchSchedules = async () => {
        try {
            setApiResponse({
                total: 0,
                page: 0,
                size: constants.RESULTS_PER_PAGE,
                pages: 0,
                items: [],
            });

            if (selectedFilter.filter === 'day') {
                if (selectedFilter.day === null) {
                    return;
                }
            } else if (selectedFilter.filter === 'date') {
                if (
                    selectedFilter.date === '' ||
                    selectedFilter.date === null
                ) {
                    return;
                }
                if (!isDateValidRegex(selectedFilter.date)) {
                    return;
                }
                if (!isDateValid(selectedFilter.date)) {
                    return;
                }
            }

            const url =
                selectedFilter.filter === 'today'
                    ? `${constants.SCHEDULES}/today`
                    : selectedFilter.filter === 'date'
                      ? `${constants.SCHEDULES}/date/${selectedFilter.date}`
                      : `${constants.SCHEDULES}/day/${selectedFilter.day}`;

            const res = await fetch(
                `${url}?page=${pageNumber}&size=${constants.RESULTS_PER_PAGE}`,
                {
                    method: 'GET',
                    headers: {
                        accept: 'application/json',
                        Authorization: `Bearer ${user.accessToken}`,
                    },
                },
            );

            const response = await res.json();

            if (res.status !== 200)
                throw new Error(
                    typeof response?.detail === 'string'
                        ? response.detail
                        : 'Something went wrong',
                );

            const scheduleArr: ScheduleProps[] = response.items.map(
                (schedule: ScheduleProps) => {
                    return {
                        id: schedule.id,
                        title: schedule.title,
                        start_time_in_utc: schedule.start_time_in_utc,
                        end_time_in_utc: schedule.end_time_in_utc,
                        is_reoccurring: schedule.is_reoccurring,
                        staff_member: {
                            id: schedule.staff_member.id,
                            full_name: schedule.staff_member.full_name,
                            email: schedule.staff_member.email,
                            additional_details: {
                                phone: schedule.staff_member.additional_details
                                    .phone,
                                department:
                                    schedule.staff_member.additional_details
                                        .department,
                                designation:
                                    schedule.staff_member.additional_details
                                        .designation,
                            },
                            created_at: schedule.staff_member.created_at,
                            updated_at: schedule.staff_member.updated_at,
                        },
                        location: {
                            id: schedule.location.id,
                            title: schedule.location.title,
                            bluetooth_address:
                                schedule.location.bluetooth_address,
                            coordinates: schedule.location.coordinates,
                            created_at: schedule.location.created_at,
                            updated_at: schedule.location.updated_at,
                        },
                        date: schedule.date,
                        day: schedule.day,
                        created_at: schedule.created_at,
                        updated_at: schedule.updated_at,
                    };
                },
            );

            setApiResponse({
                total: response?.total,
                page: response?.page,
                size: response?.size,
                pages: response?.pages,
                items: response?.items,
            });

            setAllSchedules(scheduleArr);
        } catch (err: any) {
            fireToast(
                'There seems to be a problem',
                err.message,
                FireToastEnum.DANGER,
            );
        }
    };

    useEffect(() => {
        fetchSchedules();

        return () => {};
    }, [pageNumber, selectedFilter]);

    return (
        <>
            <Breadcrumb pageName="Filter Schedules" />

            <div className="flex flex-col gap-6">
                <div className="flex flex-row justify-end gap-4 text-center align-bottom font-medium text-white">
                    <button
                        className={`inline-flex items-center justify-center gap-2.5 px-10 py-4 hover:bg-opacity-90 lg:px-8 xl:px-10 ${
                            selectedFilter.filter === 'date'
                                ? 'bg-primary'
                                : 'bg-graydark '
                        }`}
                        name="date"
                        onClick={handleSelectedFilterChange}
                    >
                        <span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                className="h-5 w-5 fill-current"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </span>
                        Date
                    </button>
                    <button
                        className={`inline-flex items-center justify-center gap-2.5 px-10 py-4 hover:bg-opacity-90 lg:px-8 xl:px-10 ${
                            selectedFilter.filter === 'day'
                                ? 'bg-primary'
                                : 'bg-graydark '
                        }`}
                        name="day"
                        onClick={handleSelectedFilterChange}
                    >
                        <span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                className="h-5 w-5 fill-current"
                            >
                                <path d="M5.25 12a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H6a.75.75 0 0 1-.75-.75V12ZM6 13.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V14a.75.75 0 0 0-.75-.75H6ZM7.25 12a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H8a.75.75 0 0 1-.75-.75V12ZM8 13.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V14a.75.75 0 0 0-.75-.75H8ZM9.25 10a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H10a.75.75 0 0 1-.75-.75V10ZM10 11.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V12a.75.75 0 0 0-.75-.75H10ZM9.25 14a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H10a.75.75 0 0 1-.75-.75V14ZM12 9.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V10a.75.75 0 0 0-.75-.75H12ZM11.25 12a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H12a.75.75 0 0 1-.75-.75V12ZM12 13.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V14a.75.75 0 0 0-.75-.75H12ZM13.25 10a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H14a.75.75 0 0 1-.75-.75V10ZM14 11.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V12a.75.75 0 0 0-.75-.75H14Z" />
                                <path
                                    fillRule="evenodd"
                                    d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </span>
                        Day
                    </button>
                    <button
                        className={`inline-flex items-center justify-center gap-2.5 px-10 py-4 hover:bg-opacity-90 lg:px-8 xl:px-10 ${
                            selectedFilter.filter === 'today'
                                ? 'bg-primary'
                                : 'bg-graydark '
                        }`}
                        name="today"
                        onClick={handleSelectedFilterChange}
                    >
                        <span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                className="h-5 w-5 fill-current"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </span>
                        Today
                    </button>
                </div>

                <div className="flex flex-row justify-end gap-4 text-center align-bottom font-medium text-white">
                    {selectedFilter.filter === 'day' && (
                        <div
                            className="text-gray-900 rounded-md text-sm shadow-sm"
                            role="group"
                        >
                            <button
                                type="button"
                                className={`custom-btn-group w-50 rounded-s-lg border border-b border-r-0 border-t px-5 py-3 font-medium ${
                                    selectedFilter.day === 'monday' &&
                                    'custom-btn-group-selected'
                                }`}
                                onClick={(e) =>
                                    setSelectedFilter((prev) => ({
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
                                    selectedFilter.day === 'tuesday' &&
                                    'custom-btn-group-selected'
                                }`}
                                onClick={(e) =>
                                    setSelectedFilter((prev) => ({
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
                                    selectedFilter.day === 'wednesday' &&
                                    'custom-btn-group-selected'
                                }`}
                                onClick={(e) =>
                                    setSelectedFilter((prev) => ({
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
                                    selectedFilter.day === 'thursday' &&
                                    'custom-btn-group-selected'
                                }`}
                                onClick={(e) =>
                                    setSelectedFilter((prev) => ({
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
                                    selectedFilter.day === 'friday' &&
                                    'custom-btn-group-selected'
                                }`}
                                onClick={(e) =>
                                    setSelectedFilter((prev) => ({
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
                                    selectedFilter.day === 'saturday' &&
                                    'custom-btn-group-selected'
                                }`}
                                onClick={(e) =>
                                    setSelectedFilter((prev) => ({
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
                                    selectedFilter.day === 'sunday' &&
                                    'custom-btn-group-selected'
                                }`}
                                onClick={(e) =>
                                    setSelectedFilter((prev) => ({
                                        ...prev,
                                        day: 'sunday',
                                    }))
                                }
                            >
                                Sunday
                            </button>
                        </div>
                    )}
                    {selectedFilter.filter === 'date' && (
                        <input
                            type="text"
                            placeholder="Enter schedule date [YYYY-MM-DD]"
                            className="w-1/3 rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                            name="date"
                            id="date"
                            pattern="\d{4}-\d{2}-\d{2}"
                            value={selectedFilter.date ?? ''}
                            onChange={handleDateChange}
                        />
                    )}
                </div>

                <Pagination
                    pageNumber={pageNumber}
                    setPageNumber={setPageNumber}
                    apiResponse={apiResponse}
                >
                    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
                        <div className="max-w-full overflow-x-auto">
                            <table className="w-full table-auto">
                                <thead>
                                    <tr className="bg-gray-2 text-left dark:bg-meta-4">
                                        <th className="min-w-[220px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                                            Title
                                        </th>
                                        <th className="min-w-[220px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                                            Status
                                        </th>
                                        <th className="min-w-[220px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                                            Staff member
                                        </th>
                                        <th className="min-w-[220px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                                            Location
                                        </th>
                                        <th className="min-w-[220px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                                            Day
                                        </th>
                                        <th className="min-w-[220px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                                            Date
                                        </th>
                                        <th className="min-w-[220px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                                            Created
                                        </th>
                                        <th className="min-w-[220px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                                            Last update
                                        </th>
                                        <th className="px-4 py-4 font-medium text-black dark:text-white">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {AllSchedules.map((schedule) => {
                                        return (
                                            <tr key={schedule.id}>
                                                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                                    <p className="text-black dark:text-white">
                                                        {schedule.title}
                                                    </p>
                                                </td>
                                                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                                    <p className="text-black dark:text-white">
                                                        {schedule.is_reoccurring
                                                            ? 'Reoccurring'
                                                            : 'Non-reoccurring'}
                                                    </p>
                                                </td>
                                                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                                    <p className="text-black dark:text-white">
                                                        {
                                                            schedule
                                                                .staff_member
                                                                .full_name
                                                        }
                                                    </p>
                                                    <span className="text-sm">
                                                        {
                                                            schedule
                                                                .staff_member
                                                                .email
                                                        }
                                                    </span>
                                                </td>
                                                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                                    <p className="text-black dark:text-white">
                                                        {
                                                            schedule.location
                                                                .title
                                                        }
                                                    </p>
                                                </td>
                                                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                                    <p className="capitalize text-black dark:text-white">
                                                        {schedule.day}
                                                    </p>
                                                </td>
                                                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                                    <p className="text-black dark:text-white">
                                                        {schedule.date}
                                                    </p>
                                                </td>
                                                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                                    <p className="text-black dark:text-white">
                                                        {TimestampConverter(
                                                            schedule.created_at,
                                                        )}
                                                    </p>
                                                </td>
                                                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                                    <p className="text-black dark:text-white">
                                                        {TimestampConverter(
                                                            schedule?.updated_at,
                                                        )}
                                                    </p>
                                                </td>
                                                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                                    <div className="flex items-center space-x-3.5">
                                                        <button
                                                            className="hover:text-primary"
                                                            onClick={() =>
                                                                handleEditClick(
                                                                    schedule.id,
                                                                )
                                                            }
                                                        >
                                                            <svg
                                                                className="fill-current"
                                                                width="18"
                                                                height="18"
                                                                viewBox="0 0 18 18"
                                                                fill="none"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                            >
                                                                <path
                                                                    d="M8.99981 14.8219C3.43106 14.8219 0.674805 9.50624 0.562305 9.28124C0.47793 9.11249 0.47793 8.88749 0.562305 8.71874C0.674805 8.49374 3.43106 3.20624 8.99981 3.20624C14.5686 3.20624 17.3248 8.49374 17.4373 8.71874C17.5217 8.88749 17.5217 9.11249 17.4373 9.28124C17.3248 9.50624 14.5686 14.8219 8.99981 14.8219ZM1.85605 8.99999C2.4748 10.0406 4.89356 13.5562 8.99981 13.5562C13.1061 13.5562 15.5248 10.0406 16.1436 8.99999C15.5248 7.95936 13.1061 4.44374 8.99981 4.44374C4.89356 4.44374 2.4748 7.95936 1.85605 8.99999Z"
                                                                    fill=""
                                                                />
                                                                <path
                                                                    d="M9 11.3906C7.67812 11.3906 6.60938 10.3219 6.60938 9C6.60938 7.67813 7.67812 6.60938 9 6.60938C10.3219 6.60938 11.3906 7.67813 11.3906 9C11.3906 10.3219 10.3219 11.3906 9 11.3906ZM9 7.875C8.38125 7.875 7.875 8.38125 7.875 9C7.875 9.61875 8.38125 10.125 9 10.125C9.61875 10.125 10.125 9.61875 10.125 9C10.125 8.38125 9.61875 7.875 9 7.875Z"
                                                                    fill=""
                                                                />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            className="hover:text-primary"
                                                            onClick={() =>
                                                                handleDeleteClick(
                                                                    schedule.id,
                                                                )
                                                            }
                                                        >
                                                            <svg
                                                                className="fill-current"
                                                                width="18"
                                                                height="18"
                                                                viewBox="0 0 18 18"
                                                                fill="none"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                            >
                                                                <path
                                                                    d="M13.7535 2.47502H11.5879V1.9969C11.5879 1.15315 10.9129 0.478149 10.0691 0.478149H7.90352C7.05977 0.478149 6.38477 1.15315 6.38477 1.9969V2.47502H4.21914C3.40352 2.47502 2.72852 3.15002 2.72852 3.96565V4.8094C2.72852 5.42815 3.09414 5.9344 3.62852 6.1594L4.07852 15.4688C4.13477 16.6219 5.09102 17.5219 6.24414 17.5219H11.7004C12.8535 17.5219 13.8098 16.6219 13.866 15.4688L14.3441 6.13127C14.8785 5.90627 15.2441 5.3719 15.2441 4.78127V3.93752C15.2441 3.15002 14.5691 2.47502 13.7535 2.47502ZM7.67852 1.9969C7.67852 1.85627 7.79102 1.74377 7.93164 1.74377H10.0973C10.2379 1.74377 10.3504 1.85627 10.3504 1.9969V2.47502H7.70664V1.9969H7.67852ZM4.02227 3.96565C4.02227 3.85315 4.10664 3.74065 4.24727 3.74065H13.7535C13.866 3.74065 13.9785 3.82502 13.9785 3.96565V4.8094C13.9785 4.9219 13.8941 5.0344 13.7535 5.0344H4.24727C4.13477 5.0344 4.02227 4.95002 4.02227 4.8094V3.96565ZM11.7285 16.2563H6.27227C5.79414 16.2563 5.40039 15.8906 5.37227 15.3844L4.95039 6.2719H13.0785L12.6566 15.3844C12.6004 15.8625 12.2066 16.2563 11.7285 16.2563Z"
                                                                    fill=""
                                                                />
                                                                <path
                                                                    d="M9.00039 9.11255C8.66289 9.11255 8.35352 9.3938 8.35352 9.75942V13.3313C8.35352 13.6688 8.63477 13.9782 9.00039 13.9782C9.33789 13.9782 9.64727 13.6969 9.64727 13.3313V9.75942C9.64727 9.3938 9.33789 9.11255 9.00039 9.11255Z"
                                                                    fill=""
                                                                />
                                                                <path
                                                                    d="M11.2502 9.67504C10.8846 9.64692 10.6033 9.90004 10.5752 10.2657L10.4064 12.7407C10.3783 13.0782 10.6314 13.3875 10.9971 13.4157C11.0252 13.4157 11.0252 13.4157 11.0533 13.4157C11.3908 13.4157 11.6721 13.1625 11.6721 12.825L11.8408 10.35C11.8408 9.98442 11.5877 9.70317 11.2502 9.67504Z"
                                                                    fill=""
                                                                />
                                                                <path
                                                                    d="M6.72245 9.67504C6.38495 9.70317 6.1037 10.0125 6.13182 10.35L6.3287 12.825C6.35683 13.1625 6.63808 13.4157 6.94745 13.4157C6.97558 13.4157 6.97558 13.4157 7.0037 13.4157C7.3412 13.3875 7.62245 13.0782 7.59433 12.7407L7.39745 10.2657C7.39745 9.90004 7.08808 9.64692 6.72245 9.67504Z"
                                                                    fill=""
                                                                />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Pagination>
            </div>
        </>
    );
}