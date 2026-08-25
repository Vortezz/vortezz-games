import { Context, createContext } from "react";

export type NotificationType = "success" | "error" | "info" | "warning" | "enter" | "exit";

export type NotificationContextProps = {
	showNotification: (type: NotificationType, message: string) => void;
};

export const NotificationContext: Context<NotificationContextProps> = createContext<NotificationContextProps>({
	showNotification: () => {
	},
});