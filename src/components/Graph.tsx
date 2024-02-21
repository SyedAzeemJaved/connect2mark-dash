import { useState, useEffect } from 'react';

import { ApexOptions } from 'apexcharts';
import ReactApexChart from 'react-apexcharts';

import { AttendanceResultProps } from '@types';

import {
    countTotalClassesForADate,
    countAttendedClassesForADate,
} from '@utils';

const options: ApexOptions = {
    legend: {
        show: false,
        position: 'top',
        horizontalAlign: 'left',
    },
    colors: ['#3C50E0', '#80CAEE'],
    chart: {
        fontFamily: 'Satoshi, sans-serif',
        height: 335,
        type: 'area',
        dropShadow: {
            enabled: true,
            color: '#623CEA14',
            top: 10,
            blur: 4,
            left: 0,
            opacity: 0.1,
        },
        zoom: {
            enabled: false,
        },
        toolbar: {
            show: true,
        },
    },
    responsive: [
        {
            breakpoint: 1024,
            options: {
                chart: {
                    height: 300,
                },
            },
        },
        {
            breakpoint: 1366,
            options: {
                chart: {
                    height: 350,
                },
            },
        },
    ],
    stroke: {
        width: [2, 2],
        curve: 'straight',
    },
    grid: {
        xaxis: {
            lines: {
                show: true,
            },
        },
        yaxis: {
            lines: {
                show: false,
            },
        },
    },
    dataLabels: {
        enabled: false,
    },
    markers: {
        size: 4,
        colors: '#fff',
        strokeColors: ['#3056D3', '#80CAEE'],
        strokeWidth: 3,
        strokeOpacity: 0.9,
        strokeDashArray: 0,
        fillOpacity: 1,
        discrete: [],
        hover: {
            size: undefined,
            sizeOffset: 5,
        },
    },
    xaxis: {
        type: 'category',
        categories: [],
        axisBorder: {
            show: false,
        },
        axisTicks: {
            show: false,
        },
    },
    yaxis: {
        title: {
            style: {
                fontSize: '0px',
            },
        },
        min: 0,
        max: 10,
    },
};

interface ChartOneState {
    series: {
        name: string;
        data: number[];
    }[];
}

export const Graph = ({
    fetchRange,
    graphData,
    handleFetchRangeChange,
}: {
    fetchRange: 'week' | 'month';
    graphData: Record<string, AttendanceResultProps[]>;
    handleFetchRangeChange: () => void;
}) => {
    const [state, setState] = useState<ChartOneState>({
        series: [
            {
                name: 'Total',
                data: [],
            },
            {
                name: 'Attended',
                data: [],
            },
        ],
    });

    useEffect(() => {
        setState((prev) => ({
            series: [
                {
                    name: prev.series[0].name,
                    data: Object.values(graphData).map((item) =>
                        countTotalClassesForADate(item),
                    ),
                },
                {
                    name: prev.series[1].name,
                    data: Object.values(graphData).map((item) =>
                        countAttendedClassesForADate(item),
                    ),
                },
            ],
        }));

        return () => {};
    }, [graphData]);

    // const handleReset = () => {
    //     setState((prevState) => ({
    //         ...prevState,
    //     }));
    // };

    return (
        <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-8">
            <div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap">
                <div className="flex w-full flex-wrap gap-3 sm:gap-5">
                    <div className="flex min-w-47.5">
                        <span className="mr-2 mt-1 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-primary">
                            <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-primary"></span>
                        </span>
                        <div className="w-full">
                            <p className="font-semibold text-primary">
                                Total Classes
                            </p>
                        </div>
                    </div>
                    <div className="flex min-w-47.5">
                        <span className="mr-2 mt-1 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-secondary">
                            <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-secondary"></span>
                        </span>
                        <div className="w-full">
                            <p className="font-semibold text-secondary">
                                Classes Attended
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex w-full max-w-45 justify-end">
                    <div className="inline-flex items-center rounded-md bg-whiter p-1.5 dark:bg-meta-4">
                        <button
                            className={`rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark ${fetchRange === 'week' ? 'bg-white shadow-card dark:bg-boxdark' : null}`}
                            onClick={handleFetchRangeChange}
                        >
                            Week
                        </button>
                        <button
                            className={`rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark ${fetchRange === 'month' ? 'bg-white shadow-card dark:bg-boxdark' : null}`}
                            onClick={handleFetchRangeChange}
                        >
                            Month
                        </button>
                    </div>
                </div>
            </div>

            <div>
                <div className="-ml-5">
                    <ReactApexChart
                        options={{
                            ...options,
                            xaxis: {
                                ...options.xaxis,
                                categories: Object.keys(graphData),
                            },
                        }}
                        series={state.series}
                        type="area"
                        height={350}
                    />
                </div>
            </div>
        </div>
    );
};
