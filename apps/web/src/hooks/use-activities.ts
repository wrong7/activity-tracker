import { authClient } from "@/lib/auth-client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

const QUERY_KEY = ["activities"]

type Activity = {
    id: string
    name: string
    timestamp: string
    created_at: string
}

export function useActivities() {
    return useQuery({
        queryKey: QUERY_KEY,
        queryFn: async () => {
            const { data, error } = await authClient.supabase().from("activity").select().overrideTypes<Activity[]>()
            if (error) throw error;
            return data as Activity[];
        },
        staleTime: 0, // Always refetch to ensure data consistency
    })
}

export function useAddActivity() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ name, timestamp }: { name: string; timestamp: Date }) => {
            return await authClient.supabase().from("activity").insert({ name, timestamp })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY })
        },
    })
}

export function useDeleteActivity() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: string) => {
            return await authClient.supabase().from("activity").delete().eq("id", id)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY })
        },
    })
}

export function useUpdateActivity() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: Partial<Omit<Activity, "id">> }) => {
            return await authClient.supabase().from("activity").update(updates).eq("id", id)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY })
        },
    })
}
