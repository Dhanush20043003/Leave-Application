import { Router } from 'express';
import Leave from '../models/Leave.js';
import { auth, permit } from '../middleware/auth.js';
import { ROLES } from '../utils/roles.js';

const router = Router();

// EMPLOYEE: create leave
router.post('/', auth, async (req, res) => {
  const { startDate, endDate, reason, type='CASUAL' } = req.body;
  if (!startDate || !endDate) return res.status(400).json({ message: 'Dates required' });
  const doc = await Leave.create({
    employee: req.user._id,
    startDate, endDate, reason, type
  });
  res.status(201).json(doc);
});

// EMPLOYEE: my leaves
router.get('/me', auth, async (req, res) => {
  const docs = await Leave.find({ employee: req.user._id }).sort({ createdAt: -1 });
  res.json(docs);
});

// EMPLOYEE: update/cancel when pending
router.patch('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const update = req.body;
  const leave = await Leave.findOne({ _id: id, employee: req.user._id });
  if (!leave) return res.status(404).json({ message: 'Not found' });
  if (leave.status !== 'PENDING') return res.status(400).json({ message: 'Only pending requests can be edited' });
  Object.assign(leave, update);
  await leave.save();
  res.json(leave);
});

// EMPLOYEE: delete (cancel) pending
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const leave = await Leave.findOne({ _id: id, employee: req.user._id });
  if (!leave) return res.status(404).json({ message: 'Not found' });
  if (leave.status !== 'PENDING') return res.status(400).json({ message: 'Only pending requests can be deleted' });
  await leave.deleteOne();
  res.json({ message: 'Deleted' });
});

// MANAGER/ADMIN: list all (filter by status/employee)
router.get('/', auth, permit(ROLES.MANAGER, ROLES.ADMIN), async (req, res) => {
  const { status, employee } = req.query;
  const q = {};
  if (status) q.status = status;
  if (employee) q.employee = employee;
  const docs = await Leave.find(q).populate('employee', 'name email department role').sort({ createdAt: -1 });
  res.json(docs);
});

// MANAGER/ADMIN: approve/reject
router.post('/:id/decision', auth, permit(ROLES.MANAGER, ROLES.ADMIN), async (req, res) => {
  const { id } = req.params;
  const { action, comments } = req.body; // action = 'APPROVE' | 'REJECT'
  const leave = await Leave.findById(id);
  if (!leave) return res.status(404).json({ message: 'Not found' });
  if (leave.status !== 'PENDING') return res.status(400).json({ message: 'Already decided' });
  leave.status = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
  leave.comments = comments;
  leave.approver = req.user._id;
  await leave.save();
  res.json(leave);
});

export default router;
