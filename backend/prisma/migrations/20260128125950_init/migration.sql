-- CreateTable
CREATE TABLE `rate_limits` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ip` VARCHAR(45) NOT NULL,
    `action` VARCHAR(50) NOT NULL,
    `attempts` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NOT NULL,

    INDEX `rate_limits_ip_action_expiresAt_idx`(`ip`, `action`, `expiresAt`),
    UNIQUE INDEX `rate_limits_ip_action_key`(`ip`, `action`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
