import mongoose from 'mongoose';

const AgencyUsageSchema = new mongoose.Schema({
  agencyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  dateKey: {
    type: String, // YYYY-MM-DD
    required: true
  },
  monthKey: {
    type: String, // YYYY-MM
    required: true,
    index: true
  },
  generations: {
    type: Number,
    default: 0
  },
  successfulGenerations: {
    type: Number,
    default: 0
  },
  failedGenerations: {
    type: Number,
    default: 0
  },
  inputTokens: {
    type: Number,
    default: 0
  },
  outputTokens: {
    type: Number,
    default: 0
  },
  contentTypeBreakdown: {
    type: Map,
    of: Number,
    default: {}
  },
  clientBreakdown: {
    type: Map,
    of: Number,
    default: {}
  },
  lastRequestAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Composite index for fast lookups
AgencyUsageSchema.index({ agencyId: 1, monthKey: 1, dateKey: 1 }, { unique: true });

const AgencyUsage = mongoose.models.AgencyUsage || mongoose.model('AgencyUsage', AgencyUsageSchema);

export default AgencyUsage;
