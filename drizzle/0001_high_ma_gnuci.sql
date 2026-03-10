CREATE TABLE `items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` varchar(64) NOT NULL,
	`productId` int NOT NULL,
	`quantity` int NOT NULL,
	`price` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`orderId` varchar(64) NOT NULL,
	`value` int NOT NULL,
	`creationDate` timestamp NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_orderId` PRIMARY KEY(`orderId`)
);
