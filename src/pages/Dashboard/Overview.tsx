import { useState, useContext, useEffect } from 'react';

import { AuthContext } from '@context';
import { FireToastEnum, UserContextProps } from '@types';

import { fireToast } from '@hooks';
import { CardOne } from '@components';

import { constants } from '@constants';

interface DashboardOverviewProps {
    description1: string | number;
    description2: string | number;
    description3: string | number;
    description4: string | number;
}

const Overview = () => {
    const { user } = useContext(AuthContext) as UserContextProps;
    const [dashboardData, setDashboardData] = useState<DashboardOverviewProps>({
        description1: 'Fetching',
        description2: 'Fetching',
        description3: 'Fetching',
        description4: 'Fetching',
    });

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
                description1: response.staff_count,
                description2: response.locations_count,
                description3: response.schedules_count,
                description4: response.schedule_instances_count,
            });
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

        return () => {};
    }, []);

    return (
        <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
                <CardOne
                    title="Total Staff Members"
                    description={dashboardData.description1}
                />
                <CardOne
                    title="Total Locations"
                    description={dashboardData.description2}
                />
                <CardOne
                    title="Total Schedules"
                    description={dashboardData.description3}
                />
                <CardOne
                    title="Total Schedule Instances"
                    description={dashboardData.description4}
                />
            </div>

            {/* <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
                <ChartOne />
                <MapOne />
                <CardOne
                    title="Total Schedule Instances"
                    description={dashboardData.description4}
                />
            </div> */}
        </>
    );
};

export default Overview;
