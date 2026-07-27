import mongoose from 'mongoose';

const AgencyActivitySchema = new mongoose.Schema({
  agencyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  actorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  actorName: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'client-created',
      'client-updated',
      'client-archived',
      'content-generated',
      'content-status-changed',
      'task-assigned',
      'task-completed',
      'team-invited',
      'team-role-changed',
      'report-generated',
      'branding-updated',
      'pipeline-updated'
    ]
  },
  entityType: {
    type: String,
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AgencyClient'
  },
  description: {
    type: String,
    required: true
  },
  metadata: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true
});

const AgencyActivity = mongoose.models.AgencyActivity || mongoose.model('AgencyActivity', AgencyActivitySchema);

export default AgencyActivity;
