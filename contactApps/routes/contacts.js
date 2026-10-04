const express = require('express');
const router = express.Router();
const Contact = require('../models/contact');

// Helper to format Mongoose errors into friendly messages
function formatError(err) {
    if (err.code === 11000) {
        return 'Email already exists. Please use a different email.';
    }
    if (err.name === 'ValidationError') {
        return Object.values(err.errors)
            .map((e) => e.message)
            .join(', ');
    }
    return err.message || 'Something went wrong';
}

// Find a contact by MongoDB _id or contactId
async function findContact(id) {
    let contact = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
        contact = await Contact.findById(id);
    }
    if (!contact) {
        contact = await Contact.findOne({ contactId: id });
    }
    return contact;
}

// POST /contacts - Add a contact
router.post('/contacts', async (req, res) => {
    try {
        const contact = await Contact.create(req.body);
        res.status(201).json({ message: 'Contact added successfully', data: contact });
    } catch (err) {
        res.status(400).json({ error: formatError(err) });
    }
});

// GET /contacts - View all contacts
router.get('/contacts', async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ contactId: 1 });
        res.status(200).json(contacts);
    } catch (err) {
        res.status(500).json({ error: formatError(err) });
    }
});

// GET /contacts/:id - View a single contact
router.get('/contacts/:id', async (req, res) => {
    try {
        const contact = await findContact(req.params.id);
        if (!contact) {
            return res.status(404).json({ error: 'Contact not found' });
        }
        res.status(200).json(contact);
    } catch (err) {
        res.status(500).json({ error: formatError(err) });
    }
});

// PUT /contacts/:id - Update a contact
router.put('/contacts/:id', async (req, res) => {
    try {
        const contact = await findContact(req.params.id);
        if (!contact) {
            return res.status(404).json({ error: 'Contact not found' });
        }
        contact.name = req.body.name !== undefined ? req.body.name : contact.name;
        contact.phone = req.body.phone !== undefined ? req.body.phone : contact.phone;
        contact.email = req.body.email !== undefined ? req.body.email : contact.email;
        const updated = await contact.save();
        res.status(200).json({ message: 'Contact updated successfully', data: updated });
    } catch (err) {
        res.status(400).json({ error: formatError(err) });
    }
});

// DELETE /contacts/:id - Delete a contact
router.delete('/contacts/:id', async (req, res) => {
    try {
        const contact = await findContact(req.params.id);
        if (!contact) {
            return res.status(404).json({ error: 'Contact not found' });
        }
        await contact.deleteOne();
        res.status(200).json({ message: 'Contact deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: formatError(err) });
    }
});

module.exports = router;
