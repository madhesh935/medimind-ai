from app.core.database import Base

from .user import User, RoleEnum
from .profiles import Patient, Doctor, Caregiver
from .medicine import Medicine, MedicationLog, MedicineStatus, LogStatus
from .device import SmartBottle, BottleEvent
from .misc import Notification, Appointment, Report
from .ai import AIConversation, AIMessage
