// Backup utility for KDIH database
const fs = require('fs-extra');
const path = require('path');
const cron = require('node-cron');
const logger = require('./logger');

const DB_PATH = process.env.DB_PATH || './kdih-database.db';
const BACKUP_DIR = path.join(__dirname, '../backups');
const RETENTION_DAYS = 30;

// Ensure backup directory exists
async function ensureBackupDir() {
    try {
        await fs.ensureDir(BACKUP_DIR);
        logger.info('Backup directory ready');
    } catch (error) {
        logger.error(`Failed to create backup directory: ${error.message}`);
        throw error;
    }
}

/**
 * Create a database backup
 * @returns {Promise<Object>} Backup info {filename, size, path}
 */
async function createBackup() {
    try {
        await ensureBackupDir();

        // Generate timestamp filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `backup-${timestamp}.db`;
        const backupPath = path.join(BACKUP_DIR, filename);

        // Check if source database exists
        if (!await fs.pathExists(DB_PATH)) {
            throw new Error('Source database not found');
        }

        // Copy database file
        await fs.copy(DB_PATH, backupPath);

        // Get file stats
        const stats = await fs.stat(backupPath);

        logger.info(`Backup created successfully: ${filename}`);

        return {
            filename,
            size: stats.size,
            path: backupPath,
            created: new Date().toISOString()
        };
    } catch (error) {
        logger.error(`Backup creation failed: ${error.message}`);
        throw error;
    }
}

/**
 * List all available backups
 * @returns {Promise<Array>} Array of backup info
 */
async function listBackups() {
    try {
        await ensureBackupDir();

        const files = await fs.readdir(BACKUP_DIR);
        const backups = [];

        for (const file of files) {
            if (file.endsWith('.db') && file.startsWith('backup-')) {
                const filePath = path.join(BACKUP_DIR, file);
                const stats = await fs.stat(filePath);

                backups.push({
                    filename: file,
                    size: stats.size,
                    sizeFormatted: formatBytes(stats.size),
                    created: stats.birthtime,
                    path: filePath
                });
            }
        }

        // Sort by newest first
        backups.sort((a, b) => b.created - a.created);

        return backups;
    } catch (error) {
        logger.error(`Failed to list backups: ${error.message}`);
        throw error;
    }
}

/**
 * Restore database from backup
 * @param {string} filename - Backup filename to restore
 * @returns {Promise<Object>} Restore info
 */
async function restoreBackup(filename) {
    try {
        const backupPath = path.join(BACKUP_DIR, filename);

        // Verify backup file exists
        if (!await fs.pathExists(backupPath)) {
            throw new Error('Backup file not found');
        }

        // Create safety backup of current database
        const safetyBackup = await createBackup();
        logger.info(`Safety backup created before restore: ${safetyBackup.filename}`);

        // Restore the backup
        await fs.copy(backupPath, DB_PATH, { overwrite: true });

        logger.info(`Database restored from backup: ${filename}`);

        return {
            success: true,
            restoredFrom: filename,
            safetyBackup: safetyBackup.filename
        };
    } catch (error) {
        logger.error(`Restore failed: ${error.message}`);
        throw error;
    }
}

/**
 * Delete a backup file
 * @param {string} filename - Backup filename to delete
 * @returns {Promise<boolean>} Success status
 */
async function deleteBackup(filename) {
    try {
        const backupPath = path.join(BACKUP_DIR, filename);

        // Safety check - don't delete if it's the current database
        if (backupPath === DB_PATH) {
            throw new Error('Cannot delete current database');
        }

        if (!await fs.pathExists(backupPath)) {
            throw new Error('Backup file not found');
        }

        await fs.remove(backupPath);
        logger.info(`Backup deleted: ${filename}`);

        return true;
    } catch (error) {
        logger.error(`Failed to delete backup: ${error.message}`);
        throw error;
    }
}

/**
 * Clean old backups (older than retention days)
 * @returns {Promise<number>} Number of backups deleted
 */
async function cleanOldBackups() {
    try {
        const backups = await listBackups();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);

        let deletedCount = 0;

        for (const backup of backups) {
            if (new Date(backup.created) < cutoffDate) {
                await deleteBackup(backup.filename);
                deletedCount++;
            }
        }

        if (deletedCount > 0) {
            logger.info(`Cleaned ${deletedCount} old backups`);
        }

        return deletedCount;
    } catch (error) {
        logger.error(`Failed to clean old backups: ${error.message}`);
        return 0;
    }
}

/**
 * Get total backup storage size
 * @returns {Promise<Object>} Storage info
 */
async function getStorageInfo() {
    try {
        const backups = await listBackups();
        const totalSize = backups.reduce((sum, backup) => sum + backup.size, 0);

        return {
            backupCount: backups.length,
            totalSize,
            totalSizeFormatted: formatBytes(totalSize),
            oldestBackup: backups.length > 0 ? backups[backups.length - 1].created : null,
            newestBackup: backups.length > 0 ? backups[0].created : null
        };
    } catch (error) {
        logger.error(`Failed to get storage info: ${error.message}`);
        throw error;
    }
}

/**
 * Schedule automated backups
 * Runs daily at 2:00 AM
 */
function scheduleBackups() {
    // Daily at 2:00 AM
    cron.schedule('0 2 * * *', async () => {
        logger.info('Running scheduled backup...');
        try {
            const backup = await createBackup();
            logger.info(`Scheduled backup completed: ${backup.filename}`);

            // Clean old backups
            await cleanOldBackups();
        } catch (error) {
            logger.error(`Scheduled backup failed: ${error.message}`);
        }
    });

    logger.info('Backup scheduler started (daily at 2:00 AM)');
}

/**
 * Format bytes to human-readable size
 * @param {number} bytes 
 * @returns {string}
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

module.exports = {
    createBackup,
    listBackups,
    restoreBackup,
    deleteBackup,
    cleanOldBackups,
    getStorageInfo,
    scheduleBackups,
    BACKUP_DIR
};
