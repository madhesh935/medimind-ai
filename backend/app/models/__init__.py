from app.core.database import Base

from .user import User, RoleEnum
from .profiles import Patient, Doctor
from .medicine import Medicine, MedicationLog, MedicineStatus, LogStatus
from .device import SmartBottle, BottleEvent
from .misc import Notification, Appointment, Report
from .ai import AIConversation, AIMessage, AIPrediction, AIRecommendation
from .gamification import GamificationProfile, Achievement
from .telemedicine import Consultation
from .audit import AuditLog, AuditSeverity
