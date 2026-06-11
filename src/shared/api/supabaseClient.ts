export const supabase = {
    auth: {
        signInWithPassword: async () => ({ data: { user: { id: 'mock-user-id' } }, error: null }),
        signUp: async () => ({ data: { user: { id: 'mock-user-id' } }, error: null }),
        signOut: async () => ({ error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        refreshSession: async () => ({ error: null }),
        updateUser: async () => ({ error: null }),
    },
    from: () => ({
        select: () => ({ eq: () => ({ single: () => ({ data: null, error: null }) }) }),
        insert: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) }),
        update: () => ({ eq: () => ({ data: null, error: null }) }),
        delete: () => ({ match: () => ({ data: null, error: null }) }),
    }),
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
        invoke: async () => ({ data: { success: true }, error: null }),
    },
    channel: () => ({
        on: () => ({ subscribe: () => ({}) }),
    }),
    removeChannel: () => {},
};
