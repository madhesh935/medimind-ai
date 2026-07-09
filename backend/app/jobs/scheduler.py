from apscheduler.schedulers.asyncio import AsyncIOScheduler
import logging

logger = logging.getLogger(__name__)
scheduler = AsyncIOScheduler()

async def check_missed_medications():
    """
    Scheduled job to check for missed medications and trigger notifications.
    """
    logger.info("Running job: check_missed_medications")
    # In a real scenario, this would query the DB for pending logs
    # that are past their scheduled_time + grace_period
    # and send WebSockets/FCM notifications.

def start_scheduler():
    scheduler.add_job(check_missed_medications, 'interval', minutes=15)
    scheduler.start()
    logger.info("APScheduler started successfully")
