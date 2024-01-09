import { createContext } from 'react';
import { UserContextProps } from '@types';

export const AuthContext = createContext<UserContextProps | null>(null);
