import { ReactNode, useState, useEffect, useCallback } from 'react';

import { AuthContext } from './AuthContext';
import { AdminProps, UserContextProps, FireToastEnum } from '@types';

import { fireToast } from '@hooks';
import { constants } from '@constants';

const blankUser: AdminProps = {
    id: 0,
    full_name: '',
    email: '',
    accessToken: '',
    created_at: '',
    updated_at: null,
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

                if (res.status !== 200) throw new Error('Logged out');

                const response = await res.json();

                if (res.status !== 200)
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
                    created_at: response.created_at,
                    updated_at: response.updated_at,
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
