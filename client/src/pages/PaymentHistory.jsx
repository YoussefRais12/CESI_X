import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import moment from 'moment';
import '../styles/paymenthistory.css';

const PaymentHistory = () => {
    const user = useSelector((state) => state.user?.user);
    const [payments, setPayments] = useState([]);
    const [error, setError] = useState('');
    const [selectedPayment, setSelectedPayment] = useState(null);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/payments/${user._id}`);
                setPayments(response.data);
            } catch (error) {
                console.error('Error fetching payment history:', error);
            }
        };

        fetchPayments();
    }, [user]);

    // Fonctions pour gérer l'affichage des détails du paiement sélectionné
    const handleShowDetails = (payment) => {
        setSelectedPayment(payment);
    };
    const handleCloseDetails = () => {
        setSelectedPayment(null);
    };

    return (
        <div>
            <h1>Historique des Paiements</h1>
            {error && <p>{error}</p>}
            {payments.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Montant</th>
                            <th>Devise</th>
                            <th>Statut</th>
                            <th>orderID</th>
                            <th>Détails</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map(payment => (
                            <tr key={payment._id}>
                                <td>{moment(payment.createdAt).format('YYYY-MM-DD | HH:mm')}</td>
                                <td>{payment.amount / 100}</td>
                                <td>{payment.currency.toUpperCase()}</td>
                                <td>{payment.status}</td>
                                <td>{payment.orderId}</td>
                                <td>
                                    <button onClick={() => handleShowDetails(payment)}>Voir</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>Aucun paiement trouvé</p>
            )}

            {selectedPayment && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={handleCloseDetails}>&times;</span>
                        <h2>Détails du Paiement</h2>
                        <p>orderID : {selectedPayment.orderId}</p>

                        <p>Date : {moment(selectedPayment.createdAt).format('YYYY-MM-DD | HH:mm')}</p>
                        <p>Montant : {selectedPayment.amount / 100} {selectedPayment.currency.toUpperCase()}</p>
                        <p>Statut : {selectedPayment.status}</p>
                        {/* Ajoutez d'autres détails si nécessaire */}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentHistory;
