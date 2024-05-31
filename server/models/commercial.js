const mongoose = require("mongoose");
const schema = mongoose.Schema;

const commercialSchema = new schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    isVerified: { type: Boolean },
    clients: [{ 
        type: schema.Types.ObjectId, 
        ref: 'Client' 
    }], // Référence aux comptes clients gérés par ce commercial
    notifications: [{
        message: { type: String },
        date: { type: Date, default: Date.now }
    }] // Historique des notifications reçues par ce commercial
});

const Commercial = mongoose.model("Commercial", commercialSchema);
module.exports = Commercial;