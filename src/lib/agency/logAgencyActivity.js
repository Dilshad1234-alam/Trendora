import AgencyActivity from "@/models/AgencyActivity";
import AgencyNotification from "@/models/AgencyNotification";

/**
 * Logs an activity to the AgencyActivity collection, and optionally creates AgencyNotifications.
 * 
 * @param {Object} params
 * @param {String} params.agencyId
 * @param {Object} params.actor - Must contain { _id, name }
 * @param {String} params.action - Enum action type
 * @param {String} params.entityType
 * @param {String} params.entityId
 * @param {String} params.clientId - Optional
 * @param {String} params.description
 * @param {Object} params.metadata - Optional
 * @param {Array} params.notifyUsers - Optional array of user IDs to notify
 * @param {Object} params.notificationDetails - Required if notifyUsers is passed. Must contain { type, title, message, link }
 */
export async function logAgencyActivity({
  agencyId,
  actor,
  action,
  entityType,
  entityId,
  clientId,
  description,
  metadata = {},
  notifyUsers = [],
  notificationDetails = null
}) {
  try {
    // 1. Log Activity
    await AgencyActivity.create({
      agencyId,
      actorId: actor._id,
      actorName: actor.name || actor.fullname || "Agency User",
      action,
      entityType,
      entityId,
      clientId,
      description,
      metadata
    });

    // 2. Create Notifications if requested
    if (notifyUsers.length > 0 && notificationDetails) {
      const notifications = notifyUsers.map(userId => ({
        agencyId,
        userId,
        type: notificationDetails.type,
        title: notificationDetails.title,
        message: notificationDetails.message,
        link: notificationDetails.link,
        metadata: metadata
      }));
      
      await AgencyNotification.insertMany(notifications);
    }
    
    return { success: true };
  } catch (error) {
    // We swallow errors here intentionally so that failure to log activity doesn't crash the main pipeline
    console.error("Activity Logging Error:", error);
    return { success: false, error: error.message };
  }
}
