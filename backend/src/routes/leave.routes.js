import { Router } from 'express';
import Leave from '../models/Leave.js';
import { auth, permit } from '../middleware/auth.js';
import { ROLES } from '../utils/roles.js';

const router = Router();

// EMPLOYEE: create leave
router.post('/', auth, async (req, res) => {
  try {
    const { startDate, endDate, reason, type = 'CASUAL' } = req.body;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      return res.status(400).json({ message: 'Start date cannot be after end date' });
    }

    if (start < new Date().setHours(0, 0, 0, 0)) {
      return res.status(400).json({ message: 'Start date cannot be in the past' });
    }

    const doc = await Leave.create({
      employee: req.user._id,
      startDate: start,
      endDate: end,
      reason: reason ? reason.trim() : '',
      type
    });

    console.log('Leave created:', { id: doc._id, employee: req.user._id, type, startDate, endDate });
    res.status(201).json(doc);
  } catch (error) {
    console.error('Create leave error:', error);
    res.status(500).json({ message: 'Error creating leave request', error: error.message });
  }
});

// EMPLOYEE: my leaves
router.get('/me', auth, async (req, res) => {
  try {
    const docs = await Leave.find({ employee: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    res.json(docs);
  } catch (error) {
    console.error('Get my leaves error:', error);
    res.status(500).json({ message: 'Error fetching leave requests', error: error.message });
  }
});

// EMPLOYEE: update/cancel when pending
router.patch('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    
    const leave = await Leave.findOne({ _id: id, employee: req.user._id });
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    
    if (leave.status !== 'PENDING') {
      return res.status(400).json({ message: 'Only pending requests can be edited' });
    }

    // Update allowed fields
    if (update.startDate) leave.startDate = new Date(update.startDate);
    if (update.endDate) leave.endDate = new Date(update.endDate);
    if (update.reason !== undefined) leave.reason = update.reason.trim();
    if (update.type) leave.type = update.type;

    await leave.save();
    res.json(leave);
  } catch (error) {
    console.error('Update leave error:', error);
    res.status(500).json({ message: 'Error updating leave request', error: error.message });
  }
});

// EMPLOYEE: delete (cancel) pending
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const leave = await Leave.findOne({ _id: id, employee: req.user._id });
    
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    
    if (leave.status !== 'PENDING') {
      return res.status(400).json({ message: 'Only pending requests can be deleted' });
    }

    await Leave.findByIdAndDelete(id);
    res.json({ message: 'Leave request deleted successfully' });
  } catch (error) {
    console.error('Delete leave error:', error);
    res.status(500).json({ message: 'Error deleting leave request', error: error.message });
  }
});

// MANAGER/ADMIN: list all (filter by status/employee)
router.get('/', auth, permit(ROLES.MANAGER, ROLES.ADMIN), async (req, res) => {
  try {
    const { status, employee } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (employee) query.employee = employee;
    
    const docs = await Leave.find(query)
      .populate('employee', 'name email department role')
      .populate('approver', 'name email')
      .sort({ createdAt: -1 })
      .lean();
      
    res.json(docs);
  } catch (error) {
    console.error('Get all leaves error:', error);
    res.status(500).json({ message: 'Error fetching leave requests', error: error.message });
  }
});

// MANAGER/ADMIN: approve/reject
router.post('/:id/decision', auth, permit(ROLES.MANAGER, ROLES.ADMIN), async (req, res) => {
  try {
    const { id } = req.params;
    const { action, comments } = req.body; // action = 'APPROVE' | 'REJECT'
    
    if (!action || !['APPROVE', 'REJECT'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Use APPROVE or REJECT' });
    }
    
    const leave = await Leave.findById(id).populate('employee', 'name email');
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    
    if (leave.status !== 'PENDING') {
      return res.status(400).json({ message: 'Leave request has already been decided' });
    }

    leave.status = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    leave.comments = comments ? comments.trim() : '';
    leave.approver = req.user._id;
    
    await leave.save();

    console.log('Leave decision:', { 
      id: leave._id, 
      action, 
      approver: req.user._id, 
      employee: leave.employee.name 
    });

    res.json({
      message: `Leave request ${action.toLowerCase()}d successfully`,
      leave
    });
  } catch (error) {
    console.error('Leave decision error:', error);
    res.status(500).json({ message: 'Error processing leave decision', error: error.message });
  }
});

// MANAGER/ADMIN: get leave statistics
router.get('/stats', auth, permit(ROLES.MANAGER, ROLES.ADMIN), async (req, res) => {
  try {
    const stats = await Leave.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const typeStats = await Leave.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      statusStats: stats,
      typeStats: typeStats,
      total: await Leave.countDocuments()
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
});

export default router;