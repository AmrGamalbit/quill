import React, { createContext, useContext, useState } from 'react';

export interface UserSessionData {
    userId: string;
    email: string;
    name: string;
    photoUri: string | null;
    rawPrivateKey: Uint8Array;
    publicKeyHex: string;
}

interface UserSessionContextType {
    session: UserSessionData | null;
    setSession: (sessions: UserSessionData | null) => void;
    clearSession: () => void;
}

const UserSessionContext = createContext<UserSessionContextType | undefined>(undefined);

export function UserSessionProvider({ children }: {children: React.ReactNode }) {
    const [session, setSession] = useState<UserSessionData | null>(null);

    const clearSession = () => setSession(null);

    return (
        <UserSessionContext.Provider value={{session, setSession, clearSession}}>
            {children}
        </UserSessionContext.Provider>
    );
}

export function useUserSession() {
    const context = useContext(UserSessionContext);
    if (!context) {
        throw new Error('useUserSession must be used within a UserSessionProvider');
    }
    return context;
}