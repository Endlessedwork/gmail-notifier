"""
Gmail Notifier Worker - Main orchestrator
รองรับหลาย accounts พร้อม database-driven configuration
"""

import logging
import signal
import sys
import time

from backend.core.database import get_db_context
from worker.config_watcher import ConfigWatcher
from worker.orchestrator import WorkerOrchestrator

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

running = True


def signal_handler(sig, frame):
    """Handle shutdown signals"""
    global running
    logger.info("🛑 Shutting down gracefully...")
    running = False
    sys.exit(0)


signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)


def _run_loop(orchestrator: WorkerOrchestrator):
    """Main worker loop"""
    from backend.services import ConfigSettingService

    logger.info("🚀 Gmail Notifier Worker started")
    logger.info(f"⏱️  Check interval: {orchestrator.check_interval}s")

    while running:
        try:
            with get_db_context() as db:
                # อ่าน max_body_length จาก database ทุกรอบ (เผื่อ user แก้ไขตอน worker รันอยู่)
                try:
                    max_body_length = ConfigSettingService.get_int(db, 'max_body_length', 300)
                    if max_body_length != orchestrator.max_body_length:
                        logger.info(f"📏 Max body length updated: {orchestrator.max_body_length} → {max_body_length}")
                        orchestrator.max_body_length = max_body_length
                except Exception as e:
                    logger.debug(f"Failed to read max_body_length: {e}")

                watcher = ConfigWatcher(db)
                accounts = watcher.get_active_accounts()
                if not accounts:
                    logger.warning("⚠️ No active accounts found")
                else:
                    logger.info(f"📬 Processing {len(accounts)} account(s)")
                    for account in accounts:
                        try:
                            orchestrator.process_account(account, watcher)
                        except Exception as e:
                            logger.error(f"Error processing {account.email}: {e}")
        except Exception as e:
            logger.error(f"Worker loop error: {e}")
        logger.debug(f"Sleeping for {orchestrator.check_interval}s...")
        time.sleep(orchestrator.check_interval)


def main():
    """Entry point"""
    import os
    from backend.services import ConfigSettingService

    check_interval = int(os.environ.get('CHECK_INTERVAL', '60'))

    # อ่าน max_body_length จาก database
    max_body_length = 300  # default
    try:
        with get_db_context() as db:
            max_body_length = ConfigSettingService.get_int(db, 'max_body_length', 300)
            logger.info(f"📏 Max body length: {max_body_length} characters")
    except Exception as e:
        logger.warning(f"Failed to read max_body_length from database, using default: {e}")

    orchestrator = WorkerOrchestrator(
        check_interval=check_interval,
        max_body_length=max_body_length
    )
    _run_loop(orchestrator)


if __name__ == '__main__':
    main()
