import { useState, useEffect, useContext } from 'react';

import { AuthContext } from '@context';

import { fireToast } from '@hooks';

import { constants } from '@constants';

import { FireToastEnum } from '@enums';

import type { UserContextProps, ScheduleInstanceProps } from '@types';
import type { AttendanceUser } from './types';

function getClassDuration(start: string, end: string) {
    // start and end are in "HH:mm:ss"
    const [startH, startM, startS] = start.split(':').map(Number);
    const [endH, endM, endS] = end.split(':').map(Number);

    const startTotal = startH * 3600 + startM * 60 + startS;
    const endTotal = endH * 3600 + endM * 60 + endS;

    let diff = endTotal - startTotal;
    if (diff < 0) diff += 24 * 3600; // handle overnight classes

    return Math.round(diff / 60); // duration in minutes
}

function formatTime(t: string) {
    const [h, m] = t.split(':');
    return `${h}:${m}`;
}
export default function AttendanceDashboard() {
    const { user } = useContext(AuthContext) as UserContextProps;

    const [data, setData] = useState<{
        teacher: AttendanceUser | undefined;
        students: AttendanceUser[];
        allScheduleInstancesToday: ScheduleInstanceProps[];
        selectedScheduleInstanceId: number | undefined;
        totalClassDuration: number;
    }>({
        teacher: undefined,
        students: [],
        allScheduleInstancesToday: [],
        selectedScheduleInstanceId: undefined,
        totalClassDuration: 0,
    });

    const fetchTodayScheduleInstances = async () => {
        try {
            const res = await fetch(`${constants.SCHEDULE_INSTANCES}/today`, {
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

            setData((prev) => ({
                ...prev,
                allScheduleInstancesToday: response?.items?.map(
                    (item: ScheduleInstanceProps) => item,
                ),
            }));
        } catch (err: any) {
            fireToast(
                'There seems to be a problem',
                err.message,
                FireToastEnum.DANGER,
            );
        }
    };

    const fetchAttendanceTrackingData = async (id: number) => {
        try {
            const res = await fetch(constants.ATTENDANCE_TRACKING + `/${id}`, {
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

            setData((prev) => ({
                ...prev,
                teacher: response?.find((u: AttendanceUser) => !u.is_student),
                students: response?.filter((u: AttendanceUser) => u.is_student),
                totalClassDuration:
                    response?.lenght > 0
                        ? getClassDuration(
                              response[0].start_time_in_utc,
                              response[0].end_time_in_utc,
                          )
                        : 0,
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
        fetchTodayScheduleInstances();

        return () => {};
    }, []);

    useEffect(() => {
        if (!data.selectedScheduleInstanceId) return;

        fetchAttendanceTrackingData(data.selectedScheduleInstanceId);

        return () => {};
    }, [data.selectedScheduleInstanceId]);

    return (
        <div className="mx-auto max-w-5xl p-6">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h2 className="text-gray-900 text-2xl font-semibold dark:text-white">
                    Attendance Overview
                </h2>
                <select
                    className="rounded border border-stroke bg-white px-4 py-2 dark:bg-form-input dark:text-white"
                    value={data.selectedScheduleInstanceId ?? ''}
                    onChange={(e) =>
                        setData((prev) => ({
                            ...prev,
                            selectedScheduleInstanceId: Number(e.target.value),
                        }))
                    }
                >
                    <option value="">Select Schedule Instance</option>
                    {data?.allScheduleInstancesToday?.map((si) => (
                        <option key={si.id} value={si.id}>
                            {si?.schedule?.title} - {si?.id}
                        </option>
                    ))}
                </select>
            </div>

            {data.selectedScheduleInstanceId &&
                (() => {
                    const selectedInstance =
                        data.allScheduleInstancesToday.find(
                            (si) => si.id === data.selectedScheduleInstanceId,
                        );
                    if (!selectedInstance) return null;
                    const start = selectedInstance.start_time_in_utc;
                    const end = selectedInstance.end_time_in_utc;
                    const duration = getClassDuration(start, end);
                    return (
                        <div className="mb-6">
                            <h3 className="text-gray-900 mb-1 text-lg font-semibold dark:text-white">
                                Attendance Duration
                            </h3>
                            <div className="text-gray-700 dark:text-gray-200">
                                Class Duration:{' '}
                                <span className="font-bold">
                                    {duration} min
                                </span>
                                <span className="text-gray-500 ml-2 text-xs">
                                    ({formatTime(start)} - {formatTime(end)})
                                </span>
                            </div>
                        </div>
                    );
                })()}

            {data?.teacher && data.totalClassDuration && (
                <div className="mb-8 flex flex-col gap-4 rounded-lg border border-primary bg-primary/10 p-6 shadow md:flex-row md:items-center">
                    <div className="flex-1">
                        <div className="text-lg font-bold text-primary">
                            {data?.teacher.full_name}
                        </div>
                        <div className="text-gray-500 dark:text-gray-300 text-sm">
                            {data?.teacher.email}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-4 text-sm">
                            <span>
                                <span className="font-semibold">
                                    First Entry:
                                </span>{' '}
                                {new Date(
                                    data?.teacher.first_entry,
                                ).toLocaleString()}
                            </span>
                            <span>
                                <span className="font-semibold">
                                    Total Time:
                                </span>{' '}
                                {data?.teacher.total_time_in_class_minutes} min
                            </span>
                            <span>
                                <span className="font-semibold">
                                    Attendance %:
                                </span>{' '}
                                {data?.teacher.attendance_percentage.toFixed(2)}
                                %
                            </span>
                            <span>
                                <span className="font-semibold">
                                    Duration %:
                                </span>{' '}
                                {(
                                    (data.teacher.total_time_in_class_minutes /
                                        data.totalClassDuration) *
                                    100
                                ).toFixed(2)}
                                %
                            </span>
                            <span
                                className={`font-semibold ${
                                    (data.teacher.total_time_in_class_minutes /
                                        data.totalClassDuration) *
                                        100 >=
                                    70
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                }`}
                            >
                                {(data.teacher.total_time_in_class_minutes /
                                    data.totalClassDuration) *
                                    100 >=
                                70
                                    ? 'Eligible for attendance'
                                    : 'Not eligible for attendance'}
                            </span>
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-primary">
                        Teacher
                    </div>
                </div>
            )}

            {data?.students?.length > 0 && data.totalClassDuration && (
                <div>
                    <h3 className="text-gray-900 mb-4 text-lg font-semibold dark:text-white">
                        Students
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {data?.students.map((student: AttendanceUser) => {
                            const durationPercent =
                                (student.total_time_in_class_minutes /
                                    data.totalClassDuration) *
                                100;
                            const eligible = durationPercent >= 70;
                            return (
                                <div
                                    key={student?.user_id}
                                    className="rounded-lg border border-stroke bg-white p-4 shadow dark:bg-form-input"
                                >
                                    <div className="text-gray-800 font-semibold dark:text-white">
                                        {student?.full_name}
                                    </div>
                                    <div className="text-gray-500 dark:text-gray-300 mb-2 text-xs">
                                        {student?.email}
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm">
                                        <span>
                                            <span className="font-semibold">
                                                First Entry:
                                            </span>{' '}
                                            {new Date(
                                                student?.first_entry,
                                            ).toLocaleString()}
                                        </span>
                                        <span>
                                            <span className="font-semibold">
                                                Total Time:
                                            </span>{' '}
                                            {
                                                student?.total_time_in_class_minutes
                                            }{' '}
                                            min
                                        </span>
                                        <span>
                                            <span className="font-semibold">
                                                Attendance %:
                                            </span>{' '}
                                            {student?.attendance_percentage.toFixed(
                                                2,
                                            )}
                                            %
                                        </span>
                                        <span>
                                            <span className="font-semibold">
                                                Duration %:
                                            </span>{' '}
                                            {durationPercent.toFixed(2)}%
                                        </span>
                                        <span
                                            className={`font-semibold ${
                                                eligible
                                                    ? 'text-green-600'
                                                    : 'text-red-600'
                                            }`}
                                        >
                                            {eligible
                                                ? 'Eligible for attendance'
                                                : 'Not eligible for attendance'}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
