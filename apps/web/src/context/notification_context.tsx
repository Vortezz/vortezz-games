import { Context, createContext } from "react";

export type NotificationContextProps = {
	showNotification: (type: "success" | "error" | "info" | "warning", message: string) => void;
};

export const NotificationContext: Context<NotificationContextProps> = createContext<NotificationContextProps>({
	showNotification: () => {
	},
});