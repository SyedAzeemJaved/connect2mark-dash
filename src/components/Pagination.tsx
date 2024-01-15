import { useState, useEffect, ReactNode } from 'react';

import { HasPages, ApiResponse } from '@types';

type PaginationProps = {
    pageNumber: number;
    setPageNumber: React.Dispatch<React.SetStateAction<number>>;
    apiResponse: ApiResponse;
    children: React.ReactNode;
};

export function Pagination({
    pageNumber,
    setPageNumber,
    apiResponse,
    children,
}: PaginationProps) {
    const [hasWhichPages, setHasWhichPages] = useState<HasPages>({
        hasNext: false,
        hasPrev: false,
    });

    const handlePaginationCalculations = () => {
        calculateHasWhichPages(pageNumber, apiResponse?.pages);
    };

    const handlePaginationClick = (isNext: boolean) => {
        if (isNext) {
            setPageNumber((prev) => prev + 1);
        } else {
            if (pageNumber > 1) {
                setPageNumber((prev) => prev - 1);
            }
        }
        handlePaginationCalculations();
    };

    const calculateHasWhichPages = (
        cPage: number | null,
        tPages: number | null,
    ) => {
        if (cPage !== null && tPages !== null) {
            setHasWhichPages({
                hasNext: tPages > cPage,
                hasPrev: cPage > 1,
            });
        }
    };

    const renderNoResults = () => {
        return (
            <div className="mt-6 flex items-center justify-between rounded-sm border border-stroke bg-white px-4 py-3 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-6">
                <div>
                    <p className="text-sm text-black dark:text-gray">
                        There are no records to show, you can add them.
                    </p>
                </div>
            </div>
        );
    };

    const renderResults = (children: ReactNode) => {
        return (
            <>
                {children}
                <div className="mt-6 flex items-center justify-between rounded-sm border border-stroke bg-white px-4 py-3 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-6">
                    <div className="sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-black dark:text-gray">
                                Showing page{' '}
                                <span className="font-medium">
                                    {pageNumber}
                                </span>{' '}
                                of{' '}
                                <span className="font-medium">
                                    {apiResponse.pages}
                                </span>{' '}
                                with{' '}
                                <span className="font-medium">
                                    {apiResponse.total}
                                </span>{' '}
                                record(s)
                            </p>
                        </div>
                        <div>
                            <nav
                                className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                                aria-label="Pagination"
                            >
                                {hasWhichPages.hasPrev && (
                                    <button
                                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-body ring-1 ring-inset ring-body hover:bg-gray focus:z-20 focus:outline-offset-0 dark:hover:bg-graydark"
                                        onClick={() => {
                                            handlePaginationClick(false);
                                        }}
                                    >
                                        <span className="sr-only">
                                            Previous
                                        </span>
                                        <svg
                                            className="h-5 w-5"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                            aria-hidden="true"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>
                                )}
                                {hasWhichPages.hasNext && (
                                    <button
                                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-body ring-1 ring-inset ring-body hover:bg-gray focus:z-20 focus:outline-offset-0 dark:hover:bg-graydark"
                                        onClick={() => {
                                            handlePaginationClick(true);
                                        }}
                                    >
                                        <span className="sr-only">Next</span>
                                        <svg
                                            className="h-5 w-5"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                            aria-hidden="true"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>
                                )}
                            </nav>
                        </div>
                    </div>
                </div>
            </>
        );
    };

    useEffect(() => {
        handlePaginationCalculations();

        return () => {};
    }, [apiResponse.page, apiResponse.items]);

    return apiResponse.items.length === 0 && apiResponse.total === 0
        ? renderNoResults()
        : renderResults(children);
}
