import { useState, useContext, useEffect, ChangeEvent } from 'react';

import { Mapplic } from '../../components/Mapplic';

import { AuthContext } from '@context';

import {
    UserContextProps,
    StaffProps,
    AttendanceResultProps,
    FireToastEnum,
} from '@types';

import { fireToast } from '@hooks';
import { Card, Graph, Graph2 } from '@components';

import { constants } from '@constants';

import { daysFromToday, formatDateToApiFormatString } from '@utils';

interface DashboardOverviewProps {
    staffMembersCount: string | number;
    locationsCount: string | number;
    schedulesCount: string | number;
    scheduleInstancesCount: string | number;
}

interface GraphQueryProps {
    selectedStaffMember: StaffProps | null;
    startDate: Date | null;
    fetchRange: 'week' | 'month';
}

const Overview = () => {
    const { user } = useContext(AuthContext) as UserContextProps;

    const [dashboardData, setDashboardData] = useState<DashboardOverviewProps>({
        staffMembersCount: 'Fetching',
        locationsCount: 'Fetching',
        schedulesCount: 'Fetching',
        scheduleInstancesCount: 'Fetching',
    });
    const [graphData, setGraphData] = useState<
        Record<string, AttendanceResultProps[]>
    >({});

    const [graphQueryValues, setGraphQueryValues] = useState<GraphQueryProps>({
        selectedStaffMember: null,
        startDate: daysFromToday(7),
        fetchRange: 'week',
    });

    const [allStaffMembers, setAllStaffMembers] = useState<StaffProps[]>([]);

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

            if (res.status !== 200)
                throw new Error(
                    typeof response?.detail === 'string'
                        ? response.detail
                        : 'Something went wrong',
                );

            setDashboardData({
                staffMembersCount: response.staff_count,
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

    const fetchAllStaffMembers = async () => {
        try {
            const res = await fetch(constants.STAFF, {
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
                (item: StaffProps) => item,
            );

            setAllStaffMembers(staffArr);
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
        fetchAllStaffMembers();

        return () => {};
    }, []);

    useEffect(() => {
        if (allStaffMembers.length > 0) {
            setGraphQueryValues((prev) => ({
                ...prev,
                selectedStaffMember: allStaffMembers[0],
            }));
        }
    }, [allStaffMembers]);

    useEffect(() => {
        (async () => {
            if (graphQueryValues.selectedStaffMember?.id) {
                try {
                    const res = await fetch(
                        constants.ATTENDANCE_RESULT +
                            `/${graphQueryValues.selectedStaffMember.id}`,
                        {
                            method: 'POST',
                            headers: {
                                accept: 'application/json',
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${user.accessToken}`,
                            },
                            body: JSON.stringify({
                                start_date: formatDateToApiFormatString(
                                    graphQueryValues.fetchRange === 'week'
                                        ? daysFromToday(-7)
                                        : daysFromToday(-30),
                                ),
                                end_date: formatDateToApiFormatString(
                                    new Date(),
                                ),
                            }),
                        },
                    );

                    const response = await res.json();

                    if (res.status !== 200)
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

    const handleSetStaffMember = (e: ChangeEvent<HTMLSelectElement>) => {
        const staffMemeber = allStaffMembers.find(
            (staff) => staff.id === parseInt(e.currentTarget.value),
        );

        if (staffMemeber) {
            setGraphQueryValues((prev) => ({
                ...prev,
                selectedStaffMember: staffMemeber,
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
                    title="Total Staff Members"
                    description={dashboardData.staffMembersCount}
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

            <div className="mt-7.5 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
                <Graph
                    fetchRange={graphQueryValues.fetchRange}
                    graphData={graphData}
                    handleFetchRangeChange={handleFetchRangeChange}
                />
                <Graph2
                    allStaffMembers={allStaffMembers}
                    graphData={graphData}
                    handleSetStaffMember={handleSetStaffMember}
                />
                <section id="map-section" className="inner over">
                    <div>
                        <Mapplic />
                    </div>
                </section>
            </div>
        </>
    );
};

export default Overview;
