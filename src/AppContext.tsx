import { ReactElement, createContext, useState } from "react";

interface IAppContext {
    NameState: {
        value: string,
        set: (c: string) => void
    }
    HostState: {
        value: string,
        set: (c: string) => void
    }
}

export const AppContext = createContext<IAppContext>({} as IAppContext);

export const AppProvider = ({ children } : { children: ReactElement }) => {
    const [name, setName] = useState<string>();
    const [host, setHost] = useState<string>();
    const store = {
        NameState: {
            value: name,
            set: setName
        },
        HostState: {
            value: host,
            set: setHost
        }
    } as IAppContext

    return <AppContext.Provider value={store}>{children}</AppContext.Provider>
}