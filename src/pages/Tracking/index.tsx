import { useState, useEffect, useContext } from 'react';

import { AuthContext } from '@context';

import { fireToast } from '@hooks';

import { constants } from '@constants';

import { FireToastEnum } from '@enums';

import type { UserContextProps, ScheduleInstanceProps } from '@types';
import type { AttendanceUser } from './types';

export default function AttendanceDashboard() {
    const { user } = useContext(AuthContext) as UserContextProps;

    const [data, setData] = useState<{
        teacher: AttendanceUser | undefined;
        students: AttendanceUser[];
        allScheduleInstancesToday: ScheduleInstanceProps[];
        selectedScheduleInstanceId: number | undefined;
    }>({
        teacher: undefined,
        students: [],
        allScheduleInstancesToday: [],
        selectedScheduleInstanceId: undefined,
    });
    const [loading, setLoading] = useState<boolean>(false);

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
        } finally {
            setLoading(false);
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

            {data?.teacher && (
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
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-primary">
                        Teacher
                    </div>
                </div>
            )}

            {data?.students?.length > 0 && (
                <div>
                    <h3 className="text-gray-900 mb-4 text-lg font-semibold dark:text-white">
                        Students
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {data?.students.map((student: AttendanceUser) => (
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
                                        {student?.total_time_in_class_minutes}{' '}
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
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
