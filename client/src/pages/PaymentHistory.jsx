import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import moment from 'moment';

const PaymentHistory = () => {
    const user = useSelector((state) => state.user?.user);
    const [payments, setPayments] = useState([]);
    const [error, setError] = useState('');

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
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map(payment => (
                            <tr key={payment._id}>
                                <td>{moment(payment.createdAt).format('YYYY-MM-DD HH:mm')}</td>
                                <td>{payment.amount / 100}</td>
                                <td>{payment.currency.toUpperCase()}</td>
                                <td>{payment.status}</td>
                                <td>{payment.orderId}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>Aucun paiement trouvé</p>
            )}
        </div>
    );
};

export default PaymentHistory;
