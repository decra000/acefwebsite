const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const auth = require('../middleware/auth');

// POST /api/contact - Submit contact form (public)
router.post('/', async (req, res) => {
    try {
        const { name, email, subject, message, phone, organization } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Please provide a valid email address' });
        }

        const newContact = await Contact.create({
            name,
            email,
            subject,
            message,
            phone,
            organization
        });

        res.status(201).json({
            message: 'Thank you for your message! We will get back to you soon.',
            id: newContact.id
        });
    } catch (error) {
        console.error('Contact submission error:', error);
        res.status(500).json({ message: 'Sorry, there was an error sending your message. Please try again.' });
    }
});

// GET /api/contact - Get all contact submissions (admin only)
router.get('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;

        const { contacts, total } = await Contact.getAllPaginated({ page, limit, status });

        res.json({
            contacts,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error('Get contacts error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/contact/:id - Get specific contact submission (admin only)
router.get('/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const contact = await Contact.getById(req.params.id);
        if (!contact) {
            return res.status(404).json({ message: 'Contact submission not found' });
        }

        res.json(contact);
    } catch (error) {
        console.error('Get contact error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT /api/contact/:id/status - Update contact status (admin only)
router.put('/:id/status', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const { status } = req.body;
        const validStatuses = ['new', 'read', 'replied', 'archived'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Must be: new, read, replied, or archived' });
        }

        const updated = await Contact.updateStatus(req.params.id, status);
        if (!updated) {
            return res.status(404).json({ message: 'Contact submission not found' });
        }

        res.json({ message: 'Status updated successfully' });
    } catch (error) {
        console.error('Update contact status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /api/contact/:id - Delete contact submission (admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const deleted = await Contact.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Contact submission not found' });
        }

        res.json({ message: 'Contact submission deleted successfully' });
    } catch (error) {
        console.error('Delete contact error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
