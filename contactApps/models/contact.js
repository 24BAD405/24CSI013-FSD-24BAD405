const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Counter schema used to auto-increment contactId
const CounterSchema = new Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 },
});
const Counter = mongoose.model('Counter', CounterSchema);

// Create schema for contact
const ContactSchema = new Schema({
    contactId: {
        type: String,
        unique: true,
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    },
    phone: {
        type: String,
        required: [true, 'Phone is required'],
        match: [/^\d{10}$/, 'Phone must contain exactly 10 digits'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address'],
    },
});

// Auto-increment contactId before validation
ContactSchema.pre('validate', async function (next) {
    if (this.isNew && !this.contactId) {
        const counter = await Counter.findByIdAndUpdate(
            'contactId',
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        this.contactId = String(counter.seq);
    }
    next();
});

// Create model for contact
const Contact = mongoose.model('Contact', ContactSchema);

module.exports = Contact;
