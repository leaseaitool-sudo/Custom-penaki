export const supabase: any = {
    auth: {
        signInWithPassword: async () => ({ data: { user: { id: 'mock-user-id' } }, error: null }),
        signUp: async () => ({ data: { user: { id: 'mock-user-id' } }, error: null }),
        signOut: async () => ({ error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        refreshSession: async () => ({ error: null }),
        updateUser: async () => ({ error: null }),
    },
    from: () => {
        const chain: any = {
            select: () => chain,
            insert: () => chain,
            update: () => chain,
            delete: () => chain,
            upsert: () => chain,
            eq: () => chain,
            in: () => chain,
            match: () => chain,
            order: () => chain,
            single: async () => ({ data: null, error: null }),
            then: (resolve: any) => resolve({ data: null, error: null }),
        };
        return chain;
    },
    rpc: async () => ({ data: null, error: null }),
    storage: {
        from: () => ({
            upload: async () => ({ data: { path: 'mock-path' }, error: null }),
            download: async () => ({ data: new Blob(), error: null }),
            getPublicUrl: () => ({ data: { publicUrl: 'mock-url' } }),
            list: async () => ({ data: [], error: null }),
            remove: async () => ({ error: null }),
        })
    },
    functions: {
        invoke: async (name: string, options?: any) => ({ data: { success: true, text: 'Mock AI Response', summary: 'Mock AI Summary', abstractedData: [] }, error: null }),
    },
    channel: () => ({
        on: () => ({ subscribe: () => ({}) }),
    }),
    removeChannel: () => {},
};
