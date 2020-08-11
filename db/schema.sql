CREATE TABLE IF NOT EXISTS `entity` (
    `id` INTEGER PRIMARY KEY,
    `street_address` TEXT DEFAULT NULL,
    `city`  TEXT DEFAULT NULL,
    `state_province` TEXT DEFAULT NULL,
    `postcode` TEXT DEFAULT NULL,
    `country` TEXT DEFAULT NULL,
    `comment` TEXT DEFAULT NULL,
    `first_contact` TEXT DEFAULT CURRENT_TIMESTAMP,
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

/*CREATE TABLE `organisation_map` (
    `id` INTEGER NOT NULL,
    `old_id` INTEGER NOT NULL,
    FOREIGN KEY (`id`) REFERENCES `organisation` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX `organisation_map_id_index` ON `organisation_map` (`id`);
CREATE INDEX `organisation_map_old_id_index` ON `organisation_map` (`old_id`);

CREATE TABLE `person_map` (
    `id` INTEGER NOT NULL,
    `old_id` INTEGER NOT NULL,
    FOREIGN KEY (`id`) REFERENCES `person` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX `person_map_id_index` ON `person_map` (`id`);
CREATE INDEX `person_map_old_id_index` ON `person_map` (`old_id`);
*/
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
    FOREIGN KEY (`person_id`) REFERENCES `person` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE `customer` (
    `id` INTEGER PRIMARY KEY,
    `name` TEXT NOT NULL,
    `organisation_id` INTEGER NOT NULL UNIQUE,
    `is_retired` INTEGER NOT NULL DEFAULT 0,
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
    `created_at` TEXT DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`customer_id`) REFERENCES `customer` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (`parent_id`) REFERENCES `task` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX `task_name_index` ON `task` (`name`);

/*CREATE TABLE `task_map` (
    `id` INTEGER NOT NULL,
    `old_id` INTEGER NOT NULL,
    FOREIGN KEY (`id`) REFERENCES `task` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX `task_map_id_index` ON `task_map` (`id`);
CREATE INDEX `task_map_old_id_index` ON `task_map` (`old_id`);
*/
CREATE TABLE `time_log` (
    `id` INTEGER PRIMARY KEY,
    `task_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `description` TEXT DEFAULT NULL,
    `duration` NUMERIC DEFAULT 0,
    `date` TEXT DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`task_id`) REFERENCES `task` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX `time_log_date_index` ON `time_log` (`date`);
