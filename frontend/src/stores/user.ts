import { create } from "solid-zustand";
import { persist } from "zustand/middleware";

type UserState = {
	isAuthenticated: boolean;
	setIsAuthenticated: (isAuthenticated: boolean) => void;
	apiUrl: string;
	setApiUrl: (apiUrl: string) => void;
	authToken: string;
	setAuthToken: (authToken: string) => void;
	reset: () => void;
};

export const useUserStore = create<UserState>()(
	persist(
		(set, _, store) => ({
			isAuthenticated: false,
			setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
			apiUrl: "",
			setApiUrl: (apiUrl) => set({ apiUrl }),
			authToken: "",
			setAuthToken: (authToken) => set({ authToken }),
			reset: () => set(store.getInitialState()),
		}),
		{ name: "user-store" },
	),
);
