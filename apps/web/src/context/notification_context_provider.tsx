import { ReactNode, useState } from "react";
import { NotificationContext } from "./notification_context";
import { generateString } from "@repo/shared/src/util/random_util";
import error from "../resources/icons/error.svg";
import info from "../resources/icons/info.svg";
import success from "../resources/icons/success.svg";
import warning from "../resources/icons/warning.svg";

export function NotificationProvider({ children }: { children: ReactNode }) {
	const [notifications, setNotifications] = useState<{ type: "success" | "error" | "info" | "warning", message: string, id: string, removing: boolean }[]>([]);

	function removeNotification(id: string) {
		setNotifications(prevState => {
			const notification = prevState.find(e => e.id === id);

			if (!notification || notification.removing) {
				return prevState;
			}

			setTimeout(() => {
				setNotifications((prevState) => {
					return [...prevState.filter(notification => notification.id !== id)];
				});
			}, 500);

			return [...prevState.map(e => {
				if (e.id === id) {
					return {
						...e,
						removing: true,
					};
				}

				return e;
			})];
		});
	}

	function showNotification(type: "success" | "error" | "info" | "warning", message: string) {
		const id = generateString(8);
		setNotifications((prevState) => [...prevState, { type, message, id, removing: false }]);

		setTimeout(() => removeNotification(id), 5000);
	}

	return <NotificationContext.Provider value={{
		showNotification: showNotification,
	}}>
		<>
			{notifications.map((item, key) => {
				let srcImg = undefined;
				let altImg = "?";

				if (item.type === "success") {
					srcImg = success;
					altImg = "✅";
				} else if (item.type === "error") {
					srcImg = error;
					altImg = "❌";
				} else if (item.type === "info") {
					srcImg = info;
					altImg = "ℹ️";
				} else if (item.type === "warning") {
					srcImg = warning;
					altImg = "⚠️";
				}

				return <div key={item.id}
					className={`bg-white fixed px-6 right-6 py-4 rounded-xl flex items-center justify-center gap-4 notification-animation h-16 transition-all`}
					style={{
						top: `${key * 5 + 5}rem`,
					}}>
					<img className={"fill-green-500 h-6"}
						src={srcImg}
						alt={altImg} />
					<p className={"text-black"}>{item.message}</p>
				</div>;
			})}
		</>
		{children}
	</NotificationContext.Provider>;
}
