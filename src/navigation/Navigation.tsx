import { useContext, Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthContext } from '@context';

import { Loader } from '@common';
import { routes } from '@routes';

import Overview from '../pages/Dashboard/Overview';
import SignIn from '../pages/Authentication/SignIn';

import type { UserContextProps } from '@types';

const DefaultLayout = lazy(() => import('../layout/DefaultLayout'));

const templateToRender = (isAuthenticated: boolean) => {
    return (
        <>
            <Toaster
                position="top-right"
                reverseOrder={false}
                containerClassName="overflow-auto"
            />
            {isAuthenticated ? (
                <Routes>
                    <Route element={<DefaultLayout />}>
                        <Route index element={<Overview />} />
                        {routes.map(
                            ({ path, component: Component, props }, idx) => (
                                <Route
                                    key={idx}
                                    path={path}
                                    element={
                                        <Suspense fallback={<Loader />}>
                                            <Component {...props} />
                                        </Suspense>
                                    }
                                />
                            ),
                        )}
                    </Route>
                </Routes>
            ) : (
                <SignIn />
            )}
        </>
    );
};

export function Navigation() {
    const { user, loading } = useContext(AuthContext) as UserContextProps;

    return loading ? <Loader /> : templateToRender(user.authenticated);
}
