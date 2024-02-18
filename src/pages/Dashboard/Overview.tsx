import { useState, useContext, useEffect, ChangeEvent } from 'react';

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

import { Mapplic } from '../../components/Mapplic';

interface DashboardOverviewProps {
    staffMembersCount: string | number;
    locationsCount: string | number;
    schedulesCount: string | number;
    scheduleInstancesCount: string | number;
}

interface GraphProps {
    selectedStaffMember: StaffProps | null;
    startDate: string | null;
    endDate: string | null;
}

const Overview = () => {
    const { user } = useContext(AuthContext) as UserContextProps;

    const [dashboardData, setDashboardData] = useState<DashboardOverviewProps>({
        staffMembersCount: 'Fetching',
        locationsCount: 'Fetching',
        schedulesCount: 'Fetching',
        scheduleInstancesCount: 'Fetching',
    });
    const [graphData, setGraphData] = useState<GraphProps>({
        selectedStaffMember: null,
        startDate: null,
        endDate: null,
    });
    const [allStaffMembers, setAllStaffMembers] = useState<StaffProps[]>([]);
    const [fetchDataRange, setFetchDataRange] = useState<'week' | 'month'>(
        'week',
    );
    const [test, setTest] = useState<AttendanceResultProps[]>([]);

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
            setGraphData((prev) => ({
                ...prev,
                selectedStaffMember: allStaffMembers[0],
            }));
        }
    }, [allStaffMembers]);

    useEffect(() => {
        (async () => {
            if (graphData.selectedStaffMember?.id) {
                try {
                    const res = await fetch(
                        constants.ATTENDANCE_RESULT +
                            `/${graphData.selectedStaffMember.id}`,
                        {
                            method: 'POST',
                            headers: {
                                accept: 'application/json',
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${user.accessToken}`,
                            },
                            body: JSON.stringify({
                                start_date: '2024-02-03',
                                end_date: '2024-02-18',
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

                    setTest(response.items);
                } catch (err: any) {
                    fireToast(
                        'There seems to be a problem',
                        err.message,
                        FireToastEnum.DANGER,
                    );
                }
            }
        })();
    }, [graphData]);

    const handleSetStaffMember = (e: ChangeEvent<HTMLSelectElement>) => {
        const staffMemeber = allStaffMembers.find(
            (staff) => staff.id === parseInt(e.currentTarget.value),
        );

        if (staffMemeber) {
            setGraphData((prev) => ({
                ...prev,
                selectedStaffMember: staffMemeber,
            }));
        }
    };

    const handleFetchDataChange = () => {
        setFetchDataRange((prev) => (prev === 'week' ? 'month' : 'week'));
    };

    const groupAttendanceResultsByDate = (
        attendanceResults: AttendanceResultProps[],
    ): Record<string, AttendanceResultProps[]> => {
        const groupedByDate: Record<string, AttendanceResultProps[]> = {};

        attendanceResults.forEach((item) => {
            const date: string = item.schedule_instance!.date;

            if (!groupedByDate[date]) {
                groupedByDate[date] = [];
            }

            groupedByDate[date].push(item);
        });

        return groupedByDate;
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
                    fetchDataRange={fetchDataRange}
                    handleFetchDataChange={handleFetchDataChange}
                />
                <Graph2
                    allStaffMembers={allStaffMembers}
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
