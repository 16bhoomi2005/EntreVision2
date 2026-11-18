import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal
from app.modules.mandi.service import run_collector

logger = logging.getLogger(__name__)

# Global scheduler instance
scheduler = BackgroundScheduler()


def scheduled_mandi_collection():
    """
    Scheduled job function to collect mandi prices
    Runs daily at 7 PM (19:00)
    """
    logger.info("Starting scheduled mandi price collection")
    db = SessionLocal()
    try:
        result = run_collector(db)
        logger.info(f"Scheduled collection completed: {result.message}")
        if result.errors:
            logger.error(f"Collection errors: {result.errors}")
    except Exception as e:
        logger.error(f"Scheduled collection failed: {str(e)}")
    finally:
        db.close()


def start_scheduler():
    """
    Start the APScheduler with the mandi collection job
    """
    try:
        # Schedule daily job at 7 PM (19:00)
        scheduler.add_job(
            scheduled_mandi_collection,
            trigger=CronTrigger(hour=19, minute=0),
            id="mandi_price_collection",
            name="Daily Mandi Price Collection",
            replace_existing=True
        )
        scheduler.start()
        logger.info("Scheduler started successfully. Mandi collection scheduled for 7 PM daily.")
    except Exception as e:
        logger.error(f"Failed to start scheduler: {str(e)}")
        raise


def shutdown_scheduler():
    """
    Shutdown the scheduler gracefully
    """
    if scheduler.running:
        scheduler.shutdown()
        logger.info("Scheduler shutdown successfully")
