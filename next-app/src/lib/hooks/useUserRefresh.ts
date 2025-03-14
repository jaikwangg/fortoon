import { useAuth } from '@/contexts/AuthContext';
import { useCallback } from 'react';

export const useUserRefresh = () => {
    const { setUser } = useAuth();

    const refreshUser = useCallback(async () => {
        try {
            const response = await fetch('/api/user', {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to refresh user data');
            }

            const result = await response.json();
            if (result.data) {
                setUser(result.data);
                return result.data;
            }
        } catch (error) {
            console.error('Error refreshing user data:', error);
            return null;
        }
    }, [setUser]);

    return { refreshUser };
}; 