import { useState, useEffect } from 'react';

type IpcHookResult<T> = {
    data: T | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
};

export function useIPC<T>(channel: string, ...args: any[]): IpcHookResult<T> {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);

        if (typeof window.electronAPI === 'undefined') {
            setError("Electron API is not available. Are you running in a browser?");
            setIsLoading(false);
            console.warn("Electron API not found. This hook will not work in a standard web browser.");
            return;
        }

        try {
            const result = await window.electronAPI.invoke(channel, ...args);
            setData(result);
        } catch (err: any) {
            console.error(`IPC call to channel "${channel}" failed:`, err);
            setError(err.message || 'An unknown error occurred during IPC call.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [channel, JSON.stringify(args)]); // Re-run if channel or args change

    return { data, isLoading, error, refetch: fetchData };
}
