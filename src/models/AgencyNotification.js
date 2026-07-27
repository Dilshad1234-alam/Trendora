import mongoose from 'mongoose';

const AgencyNotificationSchema = new mongoose.Schema({
  agencyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'team-invited',
      'team-joined',
      'task-assigned',
      'task-overdue',
      'content-review-requested',
      'content-approved',
      'content-rejected',
      'report-ready'
    ]
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  link: {
    type: String,
  },
  read: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true
});

const AgencyNotification = mongoose.models.AgencyNotification || mongoose.model('AgencyNotification', AgencyNotificationSchema);

export default AgencyNotification;
