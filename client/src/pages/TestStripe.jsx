import React from 'react';
import { useEffect, useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import AWN from 'awesome-notifications';
import 'awesome-notifications/dist/style.css';
import '../styles/testStripe.css'; // Import the CSS file

const TestStripe = () => {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState('usd');
    const [paymentStatus, setPaymentStatus] = useState(null);
    const user = useSelector((state) => state.user?.user);
    const notifier = new AWN();

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        const cardElement = elements.getElement(CardElement);

        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
        });

        if (error) {
            console.log('[error]', error);
            notifier.alert('Payment method creation failed');
        } else {
            console.log('[PaymentMethod]', paymentMethod);

            const response = await fetch('http://localhost:5000/payments/create-payment-intent', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: Math.round(amount * 100), // montant en cents
                    currency: currency,
                    paymentMethodId: paymentMethod.id,
                    userId: user._id,
                }),
            });

            const { paymentIntent, error: backendError } = await response.json();

            if (backendError) {
                console.log('Backend error:', backendError);
                setPaymentStatus(`Payment failed: ${backendError}`);

                // Enregistrer la notification de paiement échoué
                await axios.post('http://localhost:5000/notifications', {
                    userId: user._id,
                    message: `Payment failed: ${backendError}`,
                });
                notifier.alert(`Payment failed: ${backendError}`);
                navigate('/verif-pay', { state: { paymentStatus: `Payment failed: ${backendError}` } });
            } else {
                if (paymentIntent.status === 'succeeded') {
                    setPaymentStatus('Payment succeeded!');

                    // Enregistrer la notification de paiement réussi
                    await axios.post('http://localhost:5000/notifications', {
                        userId: user._id,
                        message: 'Payment succeeded!',
                    });
                    notifier.success('Payment succeeded!');
                    navigate('/verif-pay', { state: { paymentStatus: 'Payment succeeded!' } });
                } else {
                    setPaymentStatus(`Payment failed: ${paymentIntent.status}`);

                    // Enregistrer la notification de paiement échoué
                    await axios.post('http://localhost:5000/notifications', {
                        userId: user._id,
                        message: `Payment failed: ${paymentIntent.status}`,
                    });
                    notifier.alert(`Payment failed: ${paymentIntent.status}`);
                    navigate('/verif-pay', { state: { paymentStatus: `Payment failed: ${paymentIntent.status}` } });
                }
            }
        }
    };

    return (
        <div>
            <h1>Effectuer un Paiement</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Montant :
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Montant"
                        required
                    />
                </label>
                <label>
                    Devise :
                    <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                        <option value="usd">USD</option>
                        <option value="eur">EUR</option>
                    </select>
                </label>
                <label>
                    Détails de la carte :
                    <CardElement className="CardElement" />
                </label>
                <button type="submit" disabled={!stripe}>
                    Payer
                </button>
            </form>
            {paymentStatus && <p>{paymentStatus}</p>}
        </div>
    );
};

export default TestStripe;
