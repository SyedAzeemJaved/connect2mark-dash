import { useState, useContext, useEffect } from 'react';

import { AuthContext } from '@context';
import { FireToastEnum, UserContextProps } from '@types';

import { fireToast } from '@hooks';
import { CardOne } from '@components';

import { constants } from '@constants';

interface DashboardOverviewProps {
  description1: string;
  description2: string;
  description3: string;
  description4: string;
}

const Overview = () => {
  const { user } = useContext(AuthContext) as UserContextProps;
  const [dashboardData, setDashboardData] = useState<DashboardOverviewProps>({
    description1: '',
    description2: '',
    description3: '',
    description4: '',
  });

  // const fetchStats = async () => {
  //   try {
  //     const res = await fetch(constants.STATS, {
  //       method: 'GET',
  //       headers: {
  //         accept: 'application/json',
  //         Authorization: `Bearer ${user.accessToken}`,
  //       },
  //     });

  //     const response = await res.json();

  //     if (res.status !== 200)
  //       throw new Error(
  //         typeof response?.detail === 'string'
  //           ? response.detail
  //           : 'Something went wrong',
  //       );

  //     setDashboardData({
  //       description1: response.students_count,
  //       description2: response.courses_count,
  //       description3: response.announcements_count,
  //       description4: response.newsfeeds_count,
  //     });
  //   } catch (err: any) {
  //     fireToast(
  //       'There seems to be a problem',
  //       err.message,
  //       FireToastEnum.DANGER,
  //     );
  //   }
  // };

  // useEffect(() => {
  //   fetchStats();

  //   return () => {};
  // }, []);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        <CardOne
          title="Total Students"
          description={dashboardData.description1}
        />
        <CardOne
          title="Total Courses"
          description={dashboardData.description2}
        />
        <CardOne
          title="Total Announcements"
          description={dashboardData.description3}
        />
        <CardOne
          title="Total Newsfeeds"
          description={dashboardData.description4}
        />
      </div>
    </>
  );
};

export default Overview;
