CREATE TABLE `entity` (
    `id` INTEGER PRIMARY KEY,
    `street_address` TEXT DEFAULT NULL,
    `city`  TEXT DEFAULT NULL,
    `state_province` TEXT DEFAULT NULL,
    `postcode` TEXT DEFAULT NULL,
    `country` TEXT DEFAULT NULL,
    `comment` TEXT DEFAULT NULL,
    `first_contact` TEXT DEFAULT (DATE('NOW', 'LOCALTIME')),
    `last_contact` TEXT DEFAULT NULL,
    `updated_at` TEXT DEFAULT NULL
);

CREATE TABLE `organisation` (
    `id` INTEGER NOT NULL UNIQUE,
    `type` TEXT DEFAULT NULL,
    `name` TEXT NOT NULL COLLATE NOCASE,
    `industry` TEXT DEFAULT NULL,
    FOREIGN KEY (`id`) REFERENCES `entity` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX `organisation_name_index` ON `organisation` (`name`);

CREATE TABLE `person` (
    `id` INTEGER NOT NULL UNIQUE,
    `type` TEXT DEFAULT NULL,
    `title` TEXT DEFAULT NULL,
    `first_name` TEXT DEFAULT NULL COLLATE NOCASE,
    `last_name` TEXT DEFAULT NULL COLLATE NOCASE,
    `nick_name` TEXT DEFAULT NULL,
    FOREIGN KEY (`id`) REFERENCES `entity` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX `person_first_name_index` ON `person` (`first_name`);
CREATE INDEX `person_last_name_index` ON `person` (`last_name`);

CREATE TABLE `contact` (
    `id` INTEGER PRIMARY KEY,
    `entity_id` INTEGER NOT NULL,
    `type` TEXT NOT NULL,
    `entry` TEXT NOT NULL,
    FOREIGN KEY (`entity_id`) REFERENCES `entity` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX `contact_entity_id_index` ON `contact` (`entity_id`);

CREATE TABLE `employee` (
    `id` INTEGER PRIMARY KEY,
    `organisation_id` INTEGER NOT NULL,
    `person_id` INTEGER NOT NULL,
    `position` TEXT DEFAULT NULL,
    FOREIGN KEY (`organisation_id`) REFERENCES `organisation` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`person_id`) REFERENCES `person` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX `employee_organisation_id_index` ON `employee` (`organisation_id`);
CREATE INDEX `employee_person_id_index` ON `employee` (`person_id`);

CREATE TABLE `user` (
    `id` INTEGER PRIMARY KEY,
    `person_id` INTEGER NOT NULL UNIQUE,
    `is_active` INTEGER NOT NULL DEFAULT 1,
    `login` TEXT NOT NULL UNIQUE,
    `password` TEXT DEFAULT NULL,
    `visits` INTEGER NOT NULL DEFAULT 0,
    `last_visit` TEXT DEFAULT NULL,
    `notes` TEXT DEFAULT NULL,
    `created_at` TEXT DEFAULT (DATETIME('NOW', 'LOCALTIME')),
    `updated_at` TEXT DEFAULT NULL,
    FOREIGN KEY (`person_id`) REFERENCES `person` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX `user_login_index` ON `user` (`login`);

CREATE TABLE `customer` (
    `id` INTEGER PRIMARY KEY,
    `name` TEXT NOT NULL,
    `organisation_id` INTEGER NOT NULL UNIQUE,
    `is_retired` INTEGER NOT NULL DEFAULT 0,
    `notes` TEXT DEFAULT NULL,
    `created_at` TEXT DEFAULT (DATETIME('NOW', 'LOCALTIME')),
    `updated_at` TEXT NULL,
    FOREIGN KEY (`organisation_id`) REFERENCES `organisation` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX `customer_name_index` ON `customer` (`name`);

CREATE table `task` (
    `id` INTEGER PRIMARY KEY,
    `customer_id` INTEGER DEFAULT NULL,
    `user_id` INTEGER DEFAULT NULL,
    `parent_id` INTEGER DEFAULT NULL,
    `name` TEXT NOT NULL,
    `description` TEXT DEFAULT NULL,
    `is_active` INTEGER NOT NULL DEFAULT 1,
    `is_closed` INTEGER NOT NULL DEFAULT 0,
    `is_leaf`  INTEGER NOT NULL DEFAULT 1,
    `created_at` TEXT DEFAULT (DATETIME('NOW', 'LOCALTIME')),
    `updated_at` TEXT DEFAULT NULL,
    FOREIGN KEY (`customer_id`) REFERENCES `customer` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (`parent_id`) REFERENCES `task` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX `task_name_index` ON `task` (`name`);

CREATE TABLE `time_log` (
    `id` INTEGER PRIMARY KEY,
    `task_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `description` TEXT DEFAULT NULL,
    `duration` NUMERIC DEFAULT 0,
    `date` TEXT DEFAULT (DATETIME('NOW', 'LOCALTIME')),
    `updated_at` TEXT DEFAULT NULL,
    FOREIGN KEY (`task_id`) REFERENCES `task` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX `time_log_date_index` ON `time_log` (`date`);

CREATE TABLE `time_clock` (
    `user_id` INTEGER NOT NULL,
    `date` TEXT NOT NULL DEFAULT (DATE('NOW', 'LOCALTIME')),
    `arrival_time` TEXT DEFAULT NULL,
    `departure_time` TEXT DEFAULT NULL,
    `work_duration` NUMERIC DEFAULT 0,
    `json_log` TEXT DEFAULT NULL,
    `updated_at` TEXT DEFAULT (DATETIME('NOW', 'LOCALTIME')),
    PRIMARY KEY (`date`, `user_id`),
    FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE `invoice` (
    `invoice_no` TEXT NOT NULL PRIMARY KEY,
    `customer_id` INTEGER NOT NULL,
    `status` TEXT NOT NULL DEFAULT 'draft',
    `date` TEXT NOT NULL DEFAULT (DATE('NOW', 'LOCALTIME')),
    `due_date` TEXT NOT NULL DEFAULT (DATE('NOW', 'LOCALTIME')),
    `address` TEXT NOT NULL,
    `issuer` TEXT DEFAULT NULL,
    `currency` TEXT NOT NULL DEFAULT '€',
    `net_total` NUMERIC DEFAULT 0,
    `show_tax` INTEGER NOT NULL DEFAULT 1,
    `tax_rate` NUMERIC DEFAULT 0,
    `tax_amount` NUMERIC DEFAULT 0,
    `grand_total` NUMERIC DEFAULT 0,
    `payment_terms` TEXT DEFAULT NULL,
    `template` TEXT DEFAULT NULL,
    `created_at` TEXT DEFAULT (DATETIME('NOW', 'LOCALTIME')),
    `updated_at` TEXT DEFAULT NULL,
    FOREIGN KEY (`customer_id`) REFERENCES `customer` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX `invoice_date_index` ON `invoice` (`date`);

CREATE TABLE `invoice_item` (
    `id` INTEGER PRIMARY KEY,
    `invoice_no` TEXT NOT NULL,
    `item_no` INTEGER NOT NULL,
    `description` TEXT NULL,
    `quantity` NUMERIC DEFAULT 0,
    `unit_price` NUMERIC DEFAULT 0,
    FOREIGN KEY (`invoice_no`) REFERENCES `invoice` (`invoice_no`)
    ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX `invoice_item_invoice_no_index` ON `invoice_item` (`invoice_no`);
