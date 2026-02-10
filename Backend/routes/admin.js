const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const PDFDocument = require('pdfkit');

// Middleware to verify admin
const authenticateAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        if (user.role !== 'ADMIN') return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Get All Users
router.get('/users', authenticateAdmin, async (req, res) => {
    const client = await req.db.connect();
    try {
        const result = await client.query('SELECT id, employee_id, full_name, email, designation, role, idea_pdf_url, created_at FROM users ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    } finally {
        client.release();
    }
});

// Export Users PDF
router.get('/export-pdf', authenticateAdmin, async (req, res) => {
    const client = await req.db.connect();
    try {
        const result = await client.query('SELECT * FROM users ORDER BY full_name ASC');
        const users = result.rows;

        const doc = new PDFDocument({ margin: 30, size: 'A4' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=users_export.pdf');

        doc.pipe(res);

        doc.fontSize(20).text('Mind AI Forge - Registered Users', { align: 'center' });
        doc.moveDown();

        users.forEach((user, index) => {
            doc.fontSize(14).text(`${index + 1}. ${user.full_name} (${user.employee_id})`, { underline: true });
            doc.fontSize(10).text(`   Email: ${user.email}`);
            doc.text(`   Designation: ${user.designation}`);
            doc.text(`   Tech: ${user.primary_technology} | Exp: ${user.experience_years} years`);
            doc.text(`   Uploaded Idea: ${user.idea_pdf_url ? 'Yes' : 'No'}`);
            doc.moveDown(0.5);
        });

        doc.end();

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error generating PDF' });
    } finally {
        client.release();
    }
});

module.exports = router;
