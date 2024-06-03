import {useEffect, useState} from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';

const TestStripe = () => {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState('usd');
    const [paymentStatus, setPaymentStatus] = useState(null);

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
        } else {
            console.log('[PaymentMethod]', paymentMethod);

            const response = await fetch('http://localhost:5000/create-payment-intent', { // Assurez-vous que le port correspond
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: Math.round(amount * 100), // montant en cents
                    currency: currency,
                    paymentMethodId: paymentMethod.id,
                }),
            });

            const { paymentIntent, error: backendError } = await response.json();

            if (backendError) {
                console.log('Backend error:', backendError);
                setPaymentStatus(`Payment failed: ${backendError}`);
                navigate('/verif-pay', { state: { paymentStatus: `Payment failed: ${backendError}` } });
            } else {
                if (paymentIntent.status === 'succeeded') {
                    setPaymentStatus('Payment succeeded!');
                    navigate('/verif-pay', { state: { paymentStatus: 'Payment succeeded!' } });
                } else {
                    setPaymentStatus(`Payment failed: ${paymentIntent.status}`);
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
                    <CardElement />
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
