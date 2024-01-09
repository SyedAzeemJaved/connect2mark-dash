import { AdminProps } from './data';

export interface UserContextProps {
  user: AdminProps;
  setUser: (user: AdminProps) => void;
  logout: () => void;
  loading: boolean;
  setLoading: (prop: boolean) => void;
  handleUpdate: (user: AdminProps) => void;
}
