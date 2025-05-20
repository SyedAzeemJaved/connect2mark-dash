import { ReactNode, useState, useEffect, useCallback } from 'react';

import { AuthContext } from './AuthContext';

import { fireToast } from '@hooks';
import { constants } from '@constants';

import { FireToastEnum } from '@enums';
import type { AdminProps, UserContextProps } from '@types';

const blankUser: AdminProps = {
    id: 0,
    full_name: '',
    email: '',
    accessToken: '',
    created_at_in_utc: '',
    updated_at_in_utc: null,
    authenticated: false,
    additional_details: null,
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AdminProps>(blankUser);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);

                const t = await localStorage.getItem('token');

                if (!t) throw new Error('Logged out');

                const res = await fetch(constants.ME, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${t}`,
                    },
                });

                if (!res.ok) throw new Error('Logged out');

                const response = await res.json();

                if (!res.ok)
                    throw new Error(
                        typeof response?.detail === 'string'
                            ? response.detail
                            : 'Something went wrong',
                    );

                setUser({
                    id: response.id,
                    full_name: response.full_name,
                    email: response.email,
                    accessToken: t,
                    authenticated: true,
                    created_at_in_utc: response.created_at_in_utc,
                    updated_at_in_utc: response.updated_at_in_utc,
                    additional_details: null,
                });
            } catch (err: any) {
                fireToast(
                    'There seems to be a problem',
                    err.message,
                    FireToastEnum.DANGER,
                );
                await localStorage.removeItem('token');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleUser = useCallback((user: AdminProps) => {
        setUser(user);
        localStorage.setItem('token', user?.accessToken as string);
    }, []);

    const handleUpdate = useCallback((props: AdminProps) => {
        setUser((prev) => ({ ...prev, ...props }));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(blankUser);
    };

    const val: UserContextProps = {
        user: user,
        setUser: handleUser,
        handleUpdate: handleUpdate,
        logout: handleLogout,
        loading: loading,
        setLoading: setLoading,
    };

    return <AuthContext.Provider value={val}>{children}</AuthContext.Provider>;
};
