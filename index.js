const express = require('express')
const app = express()
const mongoose = require('mongoose')
const Invoice = require('./model')
const cors = require('cors')
app.use(express.json())
app.use(cors())



mongoose.connect('mongodb+srv://bhagyashree:bhagya5799@cluster0.q2xpdj1.mongodb.net/?retryWrites=true&w=majority').then(
    () => console.log("DB Connected .....!")
).catch(err => console.log(err, "DB"))
const port = process.env.PORT || 3009
app.get('/', (req, res) => {
    res.send('Hello world welcome  !!!')
})


const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))



const getFinancialYear = (date) => {
    const parsedDate = new Date(date);
    const year = parsedDate.getFullYear();
    const month = parsedDate.getMonth();
    const financialYearStart = month >= 3 ? year : year - 1;
    const financialYearEnd = financialYearStart + 1;
    return `${financialYearStart}-${financialYearEnd}`;
};

// Enter new invoice details
app.post('/', async (req, res) => {
    try {
        const { date, number, amount } = req.body;
        // Check if the invoice number already exists for the same financial year
        const existingInvoice = await Invoice.findOne({ number });
        if (existingInvoice) {
            const existingFinancialYear = existingInvoice.financialYear;
            const newFinancialYear = getFinancialYear(date);

            if (existingFinancialYear === newFinancialYear) {
                return res.status(400).json({ error: 'Invoice number already exists for the same financial year.' });
            }
        }
        // Check if the invoice date is within the valid range
        const previousInvoice = await Invoice.findOne({ number: { $lte: number } });
        const nextInvoice = await Invoice.findOne({ number: { $gte: number } });
        // findOne({ code: { $lte: 3 } })
        // findOne({ code: { $gte: 3 } })
        if (
            (previousInvoice && date <= previousInvoice.date) ||
            (nextInvoice && date >= nextInvoice.date)
        ) {
            return res.status(400).json({ error: 'Invoice date is not within the valid range.' });
        }

        // Create the new invoice
        const financialYear = getFinancialYear(date);
        const newInvoice = new Invoice({
            date,
            number,
            amount,
            financialYear,
        });
        await newInvoice.save();

        return res.status(201).json(newInvoice);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});






// Get all invoices stored in the db
app.get('/invoices', async (req, res) => {
    try {
        const invoices = await Invoice.find();
        res.json(invoices);
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// Update a specific invoice based on invoice number
app.put('/:number', async (req, res) => {
    const { number } = req.params;
    const { date, amount } = req.body;

    try {
        const invoice = await Invoice.findOne();
        console.log(invoice)
        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found.' });
        }
        invoice.date = date;
        invoice.amount = amount;
        invoice.FinancialYear = getFinancialYear(date);
        await invoice.save();
        const invoices = await Invoice.find();
        res.json(invoices);
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// Delete a specific invoice based on invoice number
app.delete('/:number', async (req, res) => {
    const { number } = req.params;


    try {
        console.log(number)
        const invoice = await Invoice.findOneAndDelete({ number: number });
        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found.' });
        }
        await invoice.remove;
        const invoices = await Invoice.find();
        res.send(invoices);
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

function getExtingYear(date) {
    const dates = new Date(date);
    const currentYear = dates.getFullYear();
    const nextYear = currentYear + 1;
    const fiscalYear = `${currentYear}-${nextYear.toString().slice(-2)}`;
    return fiscalYear;
}
