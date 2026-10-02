import Notification from '../models/Notification.js';
import Opportunity from '../models/Opportunity.js';
import Application from '../models/Application.js';

/**
 * Create a general notification
 */
export const createNotification = async ({
  recipient,
  sender,
  type = 'general',
  title,
  message,
  application,
  opportunity,
  companyName,
  jobTitle,
  metadata = {},
}) => {
  try {
    if (!recipient || !title || !message) {
      console.warn('Cannot create notification: missing recipient, title, or message');
      return null;
    }

    const notification = await Notification.create({
      recipient,
      sender,
      type,
      title,
      message,
      application,
      opportunity,
      companyName,
      jobTitle,
      metadata,
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

/**
 * Trigger notification when application status changes
 */
export const notifyApplicationStatusChange = async ({
  application,
  status,
  changedBy,
  note,
}) => {
  try {
    if (!application) return null;

    let appObj = application;
    // If application opportunity or candidate is not populated, fetch or populate
    if (!appObj.opportunity?.title || !appObj.candidate) {
      appObj = await Application.findById(application._id || application)
        .populate('opportunity')
        .populate('organization', 'name');
    }

    if (!appObj || !appObj.opportunity) {
      console.warn('Application or Opportunity not found for status notification');
      return null;
    }

    const recipient = appObj.candidate?._id || appObj.candidate;
    const opp = appObj.opportunity;
    const company = opp.organization || appObj.organization?.name || 'Company';
    const job = opp.title || 'Opportunity';

    let title = '';
    let message = '';
    let type = 'general';

    switch (status) {
      case 'applied':
        title = 'Application Submitted';
        message = `Your application has been submitted to ${company} for ${job}.`;
        type = 'application_submitted';
        break;

      case 'under_review':
        title = 'Application Under Review';
        message = `${company} is reviewing your application for ${job}.`;
        type = 'application_under_review';
        break;

      case 'shortlisted':
        title = 'Application Shortlisted';
        message = `You have been shortlisted for ${job} at ${company}.`;
        type = 'application_shortlisted';
        break;

      case 'interview':
        title = 'Interview Update';
        message = `An interview update is available for your application to ${job} at ${company}.`;
        type = 'interview_update';
        break;

      case 'selected':
      case 'hired':
        title = 'Application Selected';
        message = `Your application for ${job} at ${company} has been selected.`;
        type = 'application_selected';
        break;

      case 'rejected':
        title = 'Application Update';
        message = `Your application for ${job} at ${company} was not selected.`;
        type = 'application_rejected';
        break;

      default:
        title = 'Application Status Updated';
        message = `Your application status for ${job} at ${company} has been updated to ${status.replace('_', ' ')}.`;
        type = 'general';
        break;
    }

    if (note && note.trim()) {
      message += ` Note: ${note.trim()}`;
    }

    return await createNotification({
      recipient,
      sender: changedBy,
      type,
      title,
      message,
      application: appObj._id,
      opportunity: opp._id,
      companyName: company,
      jobTitle: job,
      metadata: { status, note },
    });
  } catch (error) {
    console.error('Error in notifyApplicationStatusChange:', error);
    return null;
  }
};
