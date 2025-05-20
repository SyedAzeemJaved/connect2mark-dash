import { useState, useContext, useEffect, ChangeEvent } from 'react';

// import { Mapplic } from '../../components/Mapplic';

import { AuthContext } from '@context';

import { fireToast } from '@hooks';
import { Card, Graph, Graph2 } from '@components';

import { constants } from '@constants';

import { daysFromToday, formatDateToApiFormatString } from '@utils';

import { FireToastEnum } from '@enums';

import type {
    UserContextProps,
    AcademicUserProps,
    AttendanceResultProps,
} from '@types';
interface DashboardOverviewProps {
    teachersCount: string | number;
    studentsCount: string | number;
    locationsCount: string | number;
    schedulesCount: string | number;
    scheduleInstancesCount: string | number;
}

interface GraphQueryProps {
    selectedTeacher: AcademicUserProps | null;
    startDate: Date | null;
    fetchRange: 'week' | 'month';
}

const Overview = () => {
    const { user } = useContext(AuthContext) as UserContextProps;

    const [dashboardData, setDashboardData] = useState<DashboardOverviewProps>({
        teachersCount: 'Fetching',
        studentsCount: 'Fetching',
        locationsCount: 'Fetching',
        schedulesCount: 'Fetching',
        scheduleInstancesCount: 'Fetching',
    });

    const [graphData, setGraphData] = useState<
        Record<string, AttendanceResultProps[]>
    >({});

    const [graphQueryValues, setGraphQueryValues] = useState<GraphQueryProps>({
        selectedTeacher: null,
        startDate: daysFromToday(7),
        fetchRange: 'week',
    });

    const [allTeachers, setAllTeachers] = useState<AcademicUserProps[]>([]);

    const fetchStats = async () => {
        try {
            const res = await fetch(constants.STATS, {
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

            setDashboardData({
                teachersCount: response.teachers_count,
                studentsCount: response.students_count,
                locationsCount: response.locations_count,
                schedulesCount: response.schedules_count,
                scheduleInstancesCount: response.schedule_instances_count,
            });
        } catch (err: any) {
            fireToast(
                'There seems to be a problem',
                err.message,
                FireToastEnum.DANGER,
            );
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
                (item: AcademicUserProps) => item,
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

    useEffect(() => {
        fetchStats();
        fetchAllTeachers();

        return () => {};
    }, []);

    useEffect(() => {
        if (allTeachers.length > 0) {
            setGraphQueryValues((prev) => ({
                ...prev,
                selectedTeacher: allTeachers[0],
            }));
        }
    }, [allTeachers]);

    useEffect(() => {
        (async () => {
            if (graphQueryValues.selectedTeacher?.id) {
                try {
                    const res = await fetch(
                        constants.ATTENDANCE_RESULT +
                            `/${graphQueryValues.selectedTeacher.id}?start_date=${formatDateToApiFormatString(
                                graphQueryValues.fetchRange === 'week'
                                    ? daysFromToday(-7)
                                    : daysFromToday(-30),
                            )}&end_date=${formatDateToApiFormatString(
                                new Date(),
                            )}`,
                        {
                            method: 'GET',
                            headers: {
                                accept: 'application/json',
                                'Content-Type': 'application/json',
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

                    setGraphData(groupAttendanceResultsByDate(response.items));
                } catch (err: any) {
                    fireToast(
                        'There seems to be a problem',
                        err.message,
                        FireToastEnum.DANGER,
                    );
                }
            }
        })();
    }, [graphQueryValues]);

    const handleSetTeacher = (e: ChangeEvent<HTMLSelectElement>) => {
        const teacher = allTeachers.find(
            (_) => _.id === parseInt(e.currentTarget.value),
        );

        if (teacher) {
            setGraphQueryValues((prev) => ({
                ...prev,
                selectedTeacher: teacher,
            }));
        }
    };

    const groupAttendanceResultsByDate = (
        attendanceResults: AttendanceResultProps[],
    ): Record<string, AttendanceResultProps[]> => {
        const groupedByDate: Record<string, AttendanceResultProps[]> = {};

        attendanceResults.forEach((item) => {
            const date: string = item.schedule_instance.date;

            if (!groupedByDate[date]) {
                groupedByDate[date] = [];
            }

            groupedByDate[date].push(item);
        });

        return groupedByDate;
    };

    const handleFetchRangeChange = () => {
        setGraphQueryValues((prev) => ({
            ...prev,
            fetchRange: prev.fetchRange === 'week' ? 'month' : 'week',
        }));
    };

    return (
        <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
                <Card
                    title="Total Teachers"
                    description={dashboardData.teachersCount}
                />
                <Card
                    title="Total Students"
                    description={dashboardData.studentsCount}
                />
                <Card
                    title="Total Locations"
                    description={dashboardData.locationsCount}
                />
                <Card
                    title="Total Schedules"
                    description={dashboardData.schedulesCount}
                />
                <Card
                    title="Total Schedule Instances"
                    description={dashboardData.scheduleInstancesCount}
                />
            </div>

            {/* <div className="mt-7.5 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5"> */}
            <div className="mt-7.5 w-full space-y-6">
                <Graph
                    fetchRange={graphQueryValues.fetchRange}
                    graphData={graphData}
                    handleFetchRangeChange={handleFetchRangeChange}
                />
                <Graph2
                    allTeachers={allTeachers}
                    graphData={graphData}
                    handleSetTeacher={handleSetTeacher}
                />

                {/* <div className="col-span-12 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
                    <section id="map-section" className="inner over">
                        <div>
                            <Mapplic />
                        </div>
                    </section>
                </div> */}
            </div>
        </>
    );
};

export default Overview;
