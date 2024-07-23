import React, { useState, useEffect } from 'react';
import './PaymentOptions.css'; // Make sure this path is correct and the CSS file contains merged styles
import BackArrow from '../logos/back_arrow.png';
import MamaearthLogo from '../logos/mamaearth_logo.png';
import RupeeSymbol from '../logos/rupee_symbol.png';
import PhonePeLogo from '../logos/phonepe_logo.svg';
import ArrowLogo from '../logos/arrow_logo.svg';
import GooglePayLogo from '../logos/googlepay_logo.png';
import PaytmLogo from '../logos/paytm_logo.png';
import BHIMLogo from '../logos/bhim_logo.png';
import GokwikLogo from '../logos/gokwik_logo.png';
const API_URL = 'https://paymentoption-ui-for-gokwik-json-server.onrender.com'; // New API URL


const UserForm = ({ user, setUser, handleFormSubmit }) => (
  <form className="user-form" onSubmit={handleFormSubmit}>
    <div className="form-group">
      <label>Name:</label>
      <input
        type="text"
        name="name"
        value={user.name}
        onChange={(e) => setUser({ ...user, name: e.target.value })}
        className="form-input"
        required
      />
    </div>
    <div className="form-group">
      <label>Phone Number:</label>
      <input
        type="text"
        name="phoneNumber"
        value={user.phoneNumber}
        onChange={(e) => setUser({ ...user, phoneNumber: e.target.value })}
        className="form-input"
        required
        pattern="[0-9]{10}"
        title="Please enter a valid 10-digit phone number"
      />
    </div>
    <div className="form-group">
      <label>Email:</label>
      <input
        type="email"
        name="email"
        value={user.email}
        onChange={(e) => setUser({ ...user, email: e.target.value })}
        className="form-input"
        required
      />
    </div>
    <div className="form-group">
      <label>Address:</label>
      <input
        type="text"
        name="address"
        value={user.address}
        onChange={(e) => setUser({ ...user, address: e.target.value })}
        className="form-input"
        required
      />
    </div>
    <button type="submit" className="submit-btn">Submit</button>
  </form>
);

const PaymentOptions = ({ user, order, isMobile, isIOS, setUser }) => {
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [selectedUpi, setSelectedUpi] = useState(null);
  const [message, setMessage] = useState('');
  const [getUpdates, setGetUpdates] = useState(true); // Ensure toggle button is on by default
  const [formSubmitted, setFormSubmitted] = useState(false); // Track if form has been submitted

  const handlePaymentClick = (paymentType) => {
    if (formSubmitted) return; // Prevent further UPI button actions if form is submitted

    if (user.name && user.phoneNumber && user.email && user.address) {
      fetch(`${API_URL}/${paymentType}`)
        .then(response => {
          if (!response.ok) throw new Error('Network response was not ok');
          return response.json();
        })
        .then(data => {
          if (data.length === 0) {
            saveUserData(paymentType);
          } else {
            if (selectedUpi !== paymentType) {
              setMessage(`Data for ${paymentType} fetched successfully`);
            }
          }
        })
        .catch(error => {
          console.error(`Error checking ${paymentType} data:`, error);
          setMessage(`Error checking ${paymentType} data`);
        });
    } else {
      setSelectedUpi(paymentType);
      setMessage('');
    }
  };

  const saveUserData = (paymentType) => {
    fetch(`${API_URL}/${paymentType}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    })
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(data => {
      setMessage(`Data saved successfully for ${paymentType}`);
      setFormSubmitted(true); // Mark form as submitted
      setSelectedUpi(null);
    })
    .catch(error => {
      console.error(`Error saving data for ${paymentType}:`, error);
      setMessage(`Error saving data for ${paymentType}`);
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const isValidPhoneNumber = /^[0-9]{10}$/.test(user.phoneNumber);
    if (!isValidPhoneNumber) {
      alert('Please enter a valid 10-digit phone number.');
      return;
    }
    saveUserData(selectedUpi);
  };

  const handlePhoneNumberChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  const handleSendClick = () => {
    fetch(`${API_URL}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: order.amount,
        phoneNumber: phoneNumber,
      }),
    })
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(data => {
      setMessage('Data sent successfully');
    })
    .catch(error => {
      console.error('Error sending data:', error);
      setMessage('Error sending data');
    });
  };

  useEffect(() => {
    if (!user.phoneNumber) {
      setSelectedUpi(null);
    }
  }, [user]);

  return (
    <div className="payment-options">
      <div className="logo-section">
        <img src={BackArrow} alt="Back" className="back-arrow" />
        <img src={MamaearthLogo} alt="Mamaearth" className="mamaearth-logo" />
      </div>
      <div className="amount-to-pay">
        <img src={RupeeSymbol} alt="Rupee" className="rupee-symbol" />
        <span className="amount-text">Amount to Pay:</span>
        <span className="amount">₹{order.amount}</span>
      </div>
      {isIOS && (
        <div className="upi-apps">
          <span className="heading left-align">Pay using UPI Apps</span>
          <button className="pay-btn" onClick={() => handlePaymentClick('PhonePe')} disabled={formSubmitted}>
            <img src={PhonePeLogo} alt="PhonePe" className="app-logo" />
            <span className="upi-name">PhonePe</span>
            <img src={ArrowLogo} alt="Arrow" className="arrow-logo" />
          </button>
          {selectedUpi === 'PhonePe' && (
            <UserForm
              user={user}
              setUser={setUser}
              handleFormSubmit={handleFormSubmit}
            />
          )}
          <button className="pay-btn" onClick={() => handlePaymentClick('GooglePay')} disabled={formSubmitted}>
            <img src={GooglePayLogo} alt="Google Pay" className="app-logo" />
            <span className="upi-name">Google Pay</span>
            <img src={ArrowLogo} alt="Arrow" className="arrow-logo" />
          </button>
          {selectedUpi === 'GooglePay' && (
            <UserForm
              user={user}
              setUser={setUser}
              handleFormSubmit={handleFormSubmit}
            />
          )}
        </div>
      )}
      {isMobile && !isIOS && (
        <div className="upi-apps">
          <span className="heading left-align">Pay using UPI Apps</span>
          <button className="pay-btn" onClick={() => handlePaymentClick('PhonePe')} disabled={formSubmitted}>
            <img src={PhonePeLogo} alt="PhonePe" className="app-logo" />
            <span className="upi-name">PhonePe</span>
            <img src={ArrowLogo} alt="Arrow" className="arrow-logo" />
          </button>
          {selectedUpi === 'PhonePe' && (
            <UserForm
              user={user}
              setUser={setUser}
              handleFormSubmit={handleFormSubmit}
            />
          )}
          <button className="pay-btn" onClick={() => handlePaymentClick('GooglePay')} disabled={formSubmitted}>
            <img src={GooglePayLogo} alt="Google Pay" className="app-logo" />
            <span className="upi-name">Google Pay</span>
            <img src={ArrowLogo} alt="Arrow" className="arrow-logo" />
          </button>
          {selectedUpi === 'GooglePay' && (
            <UserForm
              user={user}
              setUser={setUser}
              handleFormSubmit={handleFormSubmit}
            />
          )}
          <button className="pay-btn" onClick={() => handlePaymentClick('Paytm')} disabled={formSubmitted}>
            <img src={PaytmLogo} alt="Paytm" className="app-logo" />
            <span className="upi-name">Paytm</span>
            <img src={ArrowLogo} alt="Arrow" className="arrow-logo" />
          </button>
          {selectedUpi === 'Paytm' && (
            <UserForm
              user={user}
              setUser={setUser}
              handleFormSubmit={handleFormSubmit}
            />
          )}
          <button className="pay-btn" onClick={() => handlePaymentClick('BHIM')} disabled={formSubmitted}>
            <img src={BHIMLogo} alt="BHIM" className="app-logo" />
            <span className="upi-name">BHIM</span>
            <img src={ArrowLogo} alt="Arrow" className="arrow-logo" />
          </button>
          {selectedUpi === 'BHIM' && (
            <UserForm
              user={user}
              setUser={setUser}
              handleFormSubmit={handleFormSubmit}
            />
          )}
        </div>
      )}
      {!isMobile && (
        <div className="no-payment-options">No payment options available</div>
      )}
      <div className="or-separator">
        <span className="line"></span>
        <span className="or-text">OR</span>
        <span className="line"></span>
      </div>
      <div className="payment-link-section left-align">
        <span className="heading">Get Payment Link</span>
        <span className="subheading">You will get a payment link on</span>
        <div className="phone-number-section">
          <div className="phone-number-wrapper">
            <span className="country-code">+91 - </span>
            <input
              type="text"
              name="phoneNumber"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              className="phone-number"
            />
          </div>
          <button className="send-btn" onClick={handleSendClick}>Send</button>
        </div>
      </div>
      <div className="updates-section left-align">
        <span className="heading">Get WhatsApp and SMS Updates</span>
        <div className="toggle-section">
          <span className="subheading">Click on this to turn off updates</span>
          <label className="switch">
            <input type="checkbox" checked={getUpdates} onChange={() => setGetUpdates(!getUpdates)} />
            <span className="slider round"></span>
          </label>
        </div>
      </div>
      <div className="powered-by">
        <span className="powered-by-text">Powered By</span>
        <img src={GokwikLogo} alt="Gokwik" className="gokwik-logo-large" />
      </div>
      <div className="message">
        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default PaymentOptions;
import React, { useState, useEffect } from 'react';
import './PaymentOptions.css'; // Make sure this path is correct and the CSS file contains merged styles
import BackArrow from '../logos/back_arrow.png';
import MamaearthLogo from '../logos/mamaearth_logo.png';
import RupeeSymbol from '../logos/rupee_symbol.png';
import PhonePeLogo from '../logos/phonepe_logo.svg';
import ArrowLogo from '../logos/arrow_logo.svg';
import GooglePayLogo from '../logos/googlepay_logo.png';
import PaytmLogo from '../logos/paytm_logo.png';
import BHIMLogo from '../logos/bhim_logo.png';
import GokwikLogo from '../logos/gokwik_logo.png';
const API_URL = 'https://paymentoption-ui-for-gokwik-json-server.onrender.com'; // New API URL


const UserForm = ({ user, setUser, handleFormSubmit }) => (
  <form className="user-form" onSubmit={handleFormSubmit}>
    <div className="form-group">
      <label>Name:</label>
      <input
        type="text"
        name="name"
        value={user.name}
        onChange={(e) => setUser({ ...user, name: e.target.value })}
        className="form-input"
        required
      />
    </div>
    <div className="form-group">
      <label>Phone Number:</label>
      <input
        type="text"
        name="phoneNumber"
        value={user.phoneNumber}
        onChange={(e) => setUser({ ...user, phoneNumber: e.target.value })}
        className="form-input"
        required
        pattern="[0-9]{10}"
        title="Please enter a valid 10-digit phone number"
      />
    </div>
    <div className="form-group">
      <label>Email:</label>
      <input
        type="email"
        name="email"
        value={user.email}
        onChange={(e) => setUser({ ...user, email: e.target.value })}
        className="form-input"
        required
      />
    </div>
    <div className="form-group">
      <label>Address:</label>
      <input
        type="text"
        name="address"
        value={user.address}
        onChange={(e) => setUser({ ...user, address: e.target.value })}
        className="form-input"
        required
      />
    </div>
    <button type="submit" className="submit-btn">Submit</button>
  </form>
);

const PaymentOptions = ({ user, order, isMobile, isIOS, setUser }) => {
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [selectedUpi, setSelectedUpi] = useState(null);
  const [message, setMessage] = useState('');
  const [getUpdates, setGetUpdates] = useState(true); // Ensure toggle button is on by default
  const [formSubmitted, setFormSubmitted] = useState(false); // Track if form has been submitted

  const handlePaymentClick = (paymentType) => {
    if (formSubmitted) return; // Prevent further UPI button actions if form is submitted

    if (user.name && user.phoneNumber && user.email && user.address) {
      fetch(`${API_URL}/${paymentType}`)
        .then(response => {
          if (!response.ok) throw new Error('Network response was not ok');
          return response.json();
        })
        .then(data => {
          if (data.length === 0) {
            saveUserData(paymentType);
          } else {
            if (selectedUpi !== paymentType) {
              setMessage(`Data for ${paymentType} fetched successfully`);
            }
          }
        })
        .catch(error => {
          console.error(`Error checking ${paymentType} data:`, error);
          setMessage(`Error checking ${paymentType} data`);
        });
    } else {
      setSelectedUpi(paymentType);
      setMessage('');
    }
  };

  const saveUserData = (paymentType) => {
    fetch(`${API_URL}/${paymentType}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    })
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(data => {
      setMessage(`Data saved successfully for ${paymentType}`);
      setFormSubmitted(true); // Mark form as submitted
      setSelectedUpi(null);
    })
    .catch(error => {
      console.error(`Error saving data for ${paymentType}:`, error);
      setMessage(`Error saving data for ${paymentType}`);
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const isValidPhoneNumber = /^[0-9]{10}$/.test(user.phoneNumber);
    if (!isValidPhoneNumber) {
      alert('Please enter a valid 10-digit phone number.');
      return;
    }
    saveUserData(selectedUpi);
  };

  const handlePhoneNumberChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  const handleSendClick = () => {
    fetch(`${API_URL}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: order.amount,
        phoneNumber: phoneNumber,
      }),
    })
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(data => {
      setMessage('Data sent successfully');
    })
    .catch(error => {
      console.error('Error sending data:', error);
      setMessage('Error sending data');
    });
  };

  useEffect(() => {
    if (!user.phoneNumber) {
      setSelectedUpi(null);
    }
  }, [user]);

  return (
    <div className="payment-options">
      <div className="logo-section">
        <img src={BackArrow} alt="Back" className="back-arrow" />
        <img src={MamaearthLogo} alt="Mamaearth" className="mamaearth-logo" />
      </div>
      <div className="amount-to-pay">
        <img src={RupeeSymbol} alt="Rupee" className="rupee-symbol" />
        <span className="amount-text">Amount to Pay:</span>
        <span className="amount">₹{order.amount}</span>
      </div>
      {isIOS && (
        <div className="upi-apps">
          <span className="heading left-align">Pay using UPI Apps</span>
          <button className="pay-btn" onClick={() => handlePaymentClick('PhonePe')} disabled={formSubmitted}>
            <img src={PhonePeLogo} alt="PhonePe" className="app-logo" />
            <span className="upi-name">PhonePe</span>
            <img src={ArrowLogo} alt="Arrow" className="arrow-logo" />
          </button>
          {selectedUpi === 'PhonePe' && (
            <UserForm
              user={user}
              setUser={setUser}
              handleFormSubmit={handleFormSubmit}
            />
          )}
          <button className="pay-btn" onClick={() => handlePaymentClick('GooglePay')} disabled={formSubmitted}>
            <img src={GooglePayLogo} alt="Google Pay" className="app-logo" />
            <span className="upi-name">Google Pay</span>
            <img src={ArrowLogo} alt="Arrow" className="arrow-logo" />
          </button>
          {selectedUpi === 'GooglePay' && (
            <UserForm
              user={user}
              setUser={setUser}
              handleFormSubmit={handleFormSubmit}
            />
          )}
        </div>
      )}
      {isMobile && !isIOS && (
        <div className="upi-apps">
          <span className="heading left-align">Pay using UPI Apps</span>
          <button className="pay-btn" onClick={() => handlePaymentClick('PhonePe')} disabled={formSubmitted}>
            <img src={PhonePeLogo} alt="PhonePe" className="app-logo" />
            <span className="upi-name">PhonePe</span>
            <img src={ArrowLogo} alt="Arrow" className="arrow-logo" />
          </button>
          {selectedUpi === 'PhonePe' && (
            <UserForm
              user={user}
              setUser={setUser}
              handleFormSubmit={handleFormSubmit}
            />
          )}
          <button className="pay-btn" onClick={() => handlePaymentClick('GooglePay')} disabled={formSubmitted}>
            <img src={GooglePayLogo} alt="Google Pay" className="app-logo" />
            <span className="upi-name">Google Pay</span>
            <img src={ArrowLogo} alt="Arrow" className="arrow-logo" />
          </button>
          {selectedUpi === 'GooglePay' && (
            <UserForm
              user={user}
              setUser={setUser}
              handleFormSubmit={handleFormSubmit}
            />
          )}
          <button className="pay-btn" onClick={() => handlePaymentClick('Paytm')} disabled={formSubmitted}>
            <img src={PaytmLogo} alt="Paytm" className="app-logo" />
            <span className="upi-name">Paytm</span>
            <img src={ArrowLogo} alt="Arrow" className="arrow-logo" />
          </button>
          {selectedUpi === 'Paytm' && (
            <UserForm
              user={user}
              setUser={setUser}
              handleFormSubmit={handleFormSubmit}
            />
          )}
          <button className="pay-btn" onClick={() => handlePaymentClick('BHIM')} disabled={formSubmitted}>
            <img src={BHIMLogo} alt="BHIM" className="app-logo" />
            <span className="upi-name">BHIM</span>
            <img src={ArrowLogo} alt="Arrow" className="arrow-logo" />
          </button>
          {selectedUpi === 'BHIM' && (
            <UserForm
              user={user}
              setUser={setUser}
              handleFormSubmit={handleFormSubmit}
            />
          )}
        </div>
      )}
      {!isMobile && (
        <div className="no-payment-options">No payment options available</div>
      )}
      <div className="or-separator">
        <span className="line"></span>
        <span className="or-text">OR</span>
        <span className="line"></span>
      </div>
      <div className="payment-link-section left-align">
        <span className="heading">Get Payment Link</span>
        <span className="subheading">You will get a payment link on</span>
        <div className="phone-number-section">
          <div className="phone-number-wrapper">
            <span className="country-code">+91 - </span>
            <input
              type="text"
              name="phoneNumber"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              className="phone-number"
            />
          </div>
          <button className="send-btn" onClick={handleSendClick}>Send</button>
        </div>
      </div>
      <div className="updates-section left-align">
        <span className="heading">Get WhatsApp and SMS Updates</span>
        <div className="toggle-section">
          <span className="subheading">Click on this to turn off updates</span>
          <label className="switch">
            <input type="checkbox" checked={getUpdates} onChange={() => setGetUpdates(!getUpdates)} />
            <span className="slider round"></span>
          </label>
        </div>
      </div>
      <div className="powered-by">
        <span className="powered-by-text">Powered By</span>
        <img src={GokwikLogo} alt="Gokwik" className="gokwik-logo-large" />
      </div>
      <div className="message">
        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default PaymentOptions;
import React, { useState, useEffect } from 'react';
import './PaymentOptions.css'; // Make sure this path is correct and the CSS file contains merged styles
import BackArrow from '../logos/back_arrow.png';
import MamaearthLogo from '../logos/mamaearth_logo.png';
import RupeeSymbol from '../logos/rupee_symbol.png';
import PhonePeLogo from '../logos/phonepe_logo.svg';
import ArrowLogo from '../logos/arrow_logo.svg';
import GooglePayLogo from '../logos/googlepay_logo.png';
import PaytmLogo from '../logos/paytm_logo.png';
import BHIMLogo from '../logos/bhim_logo.png';
import GokwikLogo from '../logos/gokwik_logo.png';
const API_URL = 'https://paymentoption-ui-for-gokwik-json-server.onrender.com'; // New API URL


const UserForm = ({ user, setUser, handleFormSubmit }) => (
  <form className="user-form" onSubmit={handleFormSubmit}>
    <div className="form-group">
      <label>Name:</label>
      <input
        type="text"
        name="name"
        value={user.name}
        onChange={(e) => setUser({ ...user, name: e.target.value })}
        className="form-input"
        required
      />
    </div>
    <div className="form-group">
      <label>Phone Number:</label>
      <input
        type="text"
        name="phoneNumber"
        value={user.phoneNumber}
        onChange={(e) => setUser({ ...user, phoneNumber: e.target.value })}
        className="form-input"
        required
        pattern="[0-9]{10}"
        title="Please enter a valid 10-digit phone number"
      />
    </div>
    <div className="form-group">
      <label>Email:</label>
      <input
        type="email"
        name="email"
        value={user.email}
        onChange={(e) => setUser({ ...user, email: e.target.value })}
        className="form-input"
        required
      />
    </div>
    <div className="form-group">
      <label>Address:</label>
      <input
        type="text"
        name="address"
        value={user.address}
        onChange={(e) => setUser({ ...user, address: e.target.value })}
        className="form-input"
        required
      />
    </div>
    <button type="submit" className="submit-btn">Submit</button>
  </form>
);

const PaymentOptions = ({ user, order, isMobile, isIOS, setUser }) => {
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [selectedUpi, setSelectedUpi] = useState(null);
  const [message, setMessage] = useState('');
  const [getUpdates, setGetUpdates] = useState(true); // Ensure toggle button is on by default
  const [formSubmitted, setFormSubmitted] = useState(false); // Track if form has been submitted

  const handlePaymentClick = (paymentType) => {
    if (formSubmitted) return; // Prevent further UPI button actions if form is submitted

    if (user.name && user.phoneNumber && user.email && user.address) {
      fetch(`${API_URL}/${paymentType}`)
        .then(response => {
          if (!response.ok) throw new Error('Network response was not ok');
          return response.json();
        })
        .then(data => {
          if (data.length === 0) {
            saveUserData(paymentType);
          } else {
            if (selectedUpi !== paymentType) {
              setMessage(`Data for ${paymentType} fetched successfully`);
            }
          }
        })
        .catch(error => {
          console.error(`Error checking ${paymentType} data:`, error);
          setMessage(`Error checking ${paymentType} data`);
        });
    } else {
      setSelectedUpi(paymentType);
      setMessage('');
    }
  };

  const saveUserData = (paymentType) => {
    fetch(`${API_URL}/${paymentType}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    })
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(data => {
      setMessage(`Data saved successfully for ${paymentType}`);
      setFormSubmitted(true); // Mark form as submitted
      setSelectedUpi(null);
    })
    .catch(error => {
      console.error(`Error saving data for ${paymentType}:`, error);
      setMessage(`Error saving data for ${paymentType}`);
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const isValidPhoneNumber = /^[0-9]{10}$/.test(user.phoneNumber);
    if (!isValidPhoneNumber) {
      alert('Please enter a valid 10-digit phone number.');
      return;
    }
    saveUserData(selectedUpi);
  };

  const handlePhoneNumberChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  const handleSendClick = () => {
    fetch(`${API_URL}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: order.amount,
        phoneNumber: phoneNumber,
      }),
    })
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(data => {
      setMessage('Data sent successfully');
    })
    .catch(error => {
      console.error('Error sending data:', error);
      setMessage('Error sending data');
    });
  };

  useEffect(() => {
    if (!user.phoneNumber) {
      setSelectedUpi(null);
    }
  }, [user]);

  return (
    <div className="payment-options">
      <div className="logo-section">
        <img src={BackArrow} alt="Back" className="back-arrow" />
        <img src={MamaearthLogo} alt="Mamaearth" className="mamaearth-logo" />
      </div>
      <div className="amount-to-pay">
        <img src={RupeeSymbol} alt="Rupee" className="rupee-symbol" />
        <span className="amount-text">Amount to Pay:</span>
        <span className="amount">₹{order.amount}</span>
      </div>
      {isIOS && (
        <div className="upi-apps">
          <span className="heading left-align">Pay using UPI Apps</span>
          <button className="pay-btn" onClick={() => handlePaymentClick('PhonePe')} disabled={formSubmitted}>
            <img src={PhonePeLogo} alt="PhonePe" className="app-logo" />
            <span className="upi-name">PhonePe</span>
            <img src={ArrowLogo} alt="Arrow" className="arrow-logo" />
          </button>
          {selectedUpi === 'PhonePe' && (
            <UserForm
              user={user}
              setUser={setUser}
              handleFormSubmit={handleFormSubmit}
            />
          )}
          <button className="pay-btn" onClick={() => handlePaymentClick('GooglePay')} disabled={formSubmitted}>
            <img src={GooglePayLogo} alt="Google Pay" className="app-logo" />
            <span className="upi-name">Google Pay</span>
            <img src={ArrowLogo} alt="Arrow" className="arrow-logo" />
          </button>
          {selectedUpi === 'GooglePay' && (
            <UserForm
              user={user}
              setUser={setUser}
              handleFormSubmit={handleFormSubmit}
            />
          )}
        </div>
      )}
      {isMobile && !isIOS && (
        <div className="upi-apps">
          <span className="heading left-align">Pay using UPI Apps</span>
          <button className="pay-btn" onClick={() => handlePaymentClick('PhonePe')} disabled={formSubmitted}>
            <img src={PhonePeLogo} alt="PhonePe" className="app-logo" />
            <span className="upi-name">PhonePe</span>
            <img src={ArrowLogo} alt="Arrow" className="arrow-logo" />
          </button>
          {selectedUpi === 'PhonePe' && (
            <UserForm
              user={user}
              setUser={setUser}
              handleFormSubmit={handleFormSubmit}
            />
          )}
          <button className="pay-btn" onClick={() => handlePaymentClick('GooglePay')} disabled={formSubmitted}>
            <img src={GooglePayLogo} alt="Google Pay" className="app-logo" />
            <span className="upi-name">Google Pay</span>
            <img src={ArrowLogo} alt="Arrow" className="arrow-logo" />
          </button>
          {selectedUpi === 'GooglePay' && (
            <UserForm
              user={user}
              setUser={setUser}
              handleFormSubmit={handleFormSubmit}
            />
          )}
          <button className="pay-btn" onClick={() => handlePaymentClick('Paytm')} disabled={formSubmitted}>
            <img src={PaytmLogo} alt="Paytm" className="app-logo" />
            <span className="upi-name">Paytm</span>
            <img src={ArrowLogo} alt="Arrow" className="arrow-logo" />
          </button>
          {selectedUpi === 'Paytm' && (
            <UserForm
              user={user}
              setUser={setUser}
              handleFormSubmit={handleFormSubmit}
            />
          )}
          <button className="pay-btn" onClick={() => handlePaymentClick('BHIM')} disabled={formSubmitted}>
            <img src={BHIMLogo} alt="BHIM" className="app-logo" />
            <span className="upi-name">BHIM</span>
            <img src={ArrowLogo} alt="Arrow" className="arrow-logo" />
          </button>
          {selectedUpi === 'BHIM' && (
            <UserForm
              user={user}
              setUser={setUser}
              handleFormSubmit={handleFormSubmit}
            />
          )}
        </div>
      )}
      {!isMobile && (
        <div className="no-payment-options">No payment options available</div>
      )}
      <div className="or-separator">
        <span className="line"></span>
        <span className="or-text">OR</span>
        <span className="line"></span>
      </div>
      <div className="payment-link-section left-align">
        <span className="heading">Get Payment Link</span>
        <span className="subheading">You will get a payment link on</span>
        <div className="phone-number-section">
          <div className="phone-number-wrapper">
            <span className="country-code">+91 - </span>
            <input
              type="text"
              name="phoneNumber"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              className="phone-number"
            />
          </div>
          <button className="send-btn" onClick={handleSendClick}>Send</button>
        </div>
      </div>
      <div className="updates-section left-align">
        <span className="heading">Get WhatsApp and SMS Updates</span>
        <div className="toggle-section">
          <span className="subheading">Click on this to turn off updates</span>
          <label className="switch">
            <input type="checkbox" checked={getUpdates} onChange={() => setGetUpdates(!getUpdates)} />
            <span className="slider round"></span>
          </label>
        </div>
      </div>
      <div className="powered-by">
        <span className="powered-by-text">Powered By</span>
        <img src={GokwikLogo} alt="Gokwik" className="gokwik-logo-large" />
      </div>
      <div className="message">
        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default PaymentOptions;
import React, { useState, useEffect } from 'react';
import './PaymentOptions.css'; // Make sure this path is correct and the CSS file contains merged styles
import BackArrow from '../logos/back_arrow.png';
import MamaearthLogo from '../logos/mamaearth_logo.png';
import RupeeSymbol from '../logos/rupee_symbol.png';
import PhonePeLogo from '../logos/phonepe_logo.svg';
import ArrowLogo from '../logos/arrow_logo.svg';
import GooglePayLogo from '../logos/googlepay_logo.png';
import PaytmLogo from '../logos/paytm_logo.png';
import BHIMLogo from '../logos/bhim_logo.png';
import GokwikLogo from '../logos/gokwik_logo.png';
const API_URL = 'https://paymentoption-ui-for-gokwik-json-server.onrender.com'; // New API URL


const UserForm = ({ user, setUser, handleFormSubmit }) => (
  <form className="user-form" onSubmit={handleFormSubmit}>
    <div className="form-group">
      <label>Name:</label>
      <input
        type="text"
        name="name"
        value={user.name}
        onChange={(e) => setUser({ ...user, name: e.target.value })}
        className="form-input"
        required
      />
    </div>
    <div className="form-group">
      <label>Phone Number:</label>
      <input
        type="text"
        name="phoneNumber"
        value={user.phoneNumber}
        onChange={(e) => setUser({ ...user, phoneNumber: e.target.value })}
        className="form-input"
        required
        pattern="[0-9]{10}"
        title="Please enter a valid 10-digit phone number"
      />
    </div>
    <div className="form-group">
      <label>Email:</label>
      <input
        type="email"
        name="email"
        value={user.email}
        onChange={(e) => setUser({ ...user, email: e.target.value })}
        className="form-input"
        required
      />
    </div>
    <div className="form-group">
      <label>Address:</label>
      <input
        type="text"
        name="address"
        value={user.address}
        onChange={(e) => setUser({ ...user, address: e.target.value })}
        className="form-input"
        required
      />
    </div>
    <button type="submit" className="submit-btn">Submit</button>
  </form>
);

const PaymentOptions = ({ user, order, isMobile, isIOS, setUser }) => {
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [selectedUpi, setSelectedUpi] = useState(null);
  const [message, setMessage] = useState('');
  const [getUpdates, setGetUpdates] = useState(true); // Ensure toggle button is on by default
  const [formSubmitted, setFormSubmitted] = useState(false); // Track if form has been submitted

  const handlePaymentClick = (paymentType) => {
    if (formSubmitted) return; // Prevent further UPI button actions if form is submitted

    if (user.name && user.phoneNumber && user.email && user.address) {
      fetch(`${API_URL}/${paymentType}`)
        .then(response => {
          if (!response.ok) throw new Error('Network response was not ok');
          return response.json();
        })
        .then(data => {
          if (data.length === 0) {
            saveUserData(paymentType);
          } else {
            if (selectedUpi !== paymentType) {
              setMessage(`Data for ${paymentType} fetched successfully`);
            }
          }
        })
        .catch(error => {
          console.error(`Error checking ${paymentType} data:`, error);
          setMessage(`Error checking ${paymentType} data`);
        });
    } else {
      setSelectedUpi(paymentType);
      setMessage('');
    }
  };

  const saveUserData = (paymentType) => {
    fetch(`${API_URL}/${paymentType}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    })
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(data => {
      setMessage(`Data saved successfully for ${paymentType}`);
      setFormSubmitted(true); // Mark form as submitted
      setSelectedUpi(null);
    })
    .catch(error => {
      console.error(`Error saving data for ${paymentType}:`, error);
      setMessage(`Error saving data for ${paymentType}`);
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const isValidPhoneNumber = /^[0-9]{10}$/.test(user.phoneNumber);
    if (!isValidPhoneNumber) {
      alert('Please enter a valid 10-digit phone number.');
      return;
    }
    saveUserData(selectedUpi);
  };

  const handlePhoneNumberChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  const handleSendClick = () => {
    fetch(`${API_URL}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: order.amount,
        phoneNumber: phoneNumber,
      }),
    })
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(data => {
      setMessage('Data sent successfully');
    })
    .catch(error => {
      console.error('Error sending data:', error);
      setMessage('Error sending data');
    });
  };

  useEffect(() => {
    if (!user.phoneNumber) {
      setSelectedUpi(null);
    }
  }, [user]);

  return (
    <div className="payment-options">
      <div className="logo-section">
        <img src={BackArrow} alt="Back" className="back-arrow" />
        <img src={MamaearthLogo} alt="Mamaearth" className="mamaearth-logo" />
      </div>
      <div className="amount-to-pay">
        <img src={RupeeSymbol} alt="Rupee" className="rupee-symbol" />
        <span className="amount-text">Amount to Pay:</span>
        <span className="amount">₹{order.amount}</span>
      </div>
      {isIOS && (
        <div className="upi-apps">
          <span className="heading left-align">Pay using UPI Apps</span>
          <button className="pay-btn" onClick={() => handlePaymentClick('PhonePe')} disabled={formSubmitted}>
            <img src={PhonePeLogo} alt="PhonePe" className="app-logo" />
            <span className="upi-name">PhonePe</span>
            <img src={ArrowLogo} alt="Arrow" className="arrow-logo" />
          </button>
          {selectedUpi === 'PhonePe' && (
            <UserForm
              user={user}
              setUser={setUser}
              handleFormSubmit={handleFormSubmit}
            />
          )}
          <button className="pay-btn" onClick={() => handlePaymentClick('GooglePay')} disabled={formSubmitted}>
            <img src={GooglePayLogo} alt="Google Pay" className="app-logo" />
            <span className="upi-name">Google Pay</span>
            <img src={ArrowLogo} alt="Arrow" className="arrow-logo" />
          </button>
          {selectedUpi === 'GooglePay' && (
            <UserForm
              user={user}
              setUser={setUser}
              handleFormSubmit={handleFormSubmit}
            />
          )}
        </div>
      )}
      {isMobile && !isIOS && (
        <div className="upi-apps">
          <span className="heading left-align">Pay using UPI Apps</span>
          <button className="pay-btn" onClick={() => handlePaymentClick('PhonePe')} disabled={formSubmitted}>
            <img src={PhonePeLogo} alt="PhonePe" className="app-logo" />
            <span className="upi-name">PhonePe</span>
            <img src={ArrowLogo} alt="Arrow" className="arrow-logo" />
          </button>
          {selectedUpi === 'PhonePe' && (
            <UserForm
              user={user}
              setUser={setUser}
              handleFormSubmit={handleFormSubmit}
            />
          )}
          <button className="pay-btn" onClick={() => handlePaymentClick('GooglePay')} disabled={formSubmitted}>
            <img src={GooglePayLogo} alt="Google Pay" className="app-logo" />
            <span className="upi-name">Google Pay</span>
            <img src={ArrowLogo} alt="Arrow" className="arrow-logo" />
          </button>
          {selectedUpi === 'GooglePay' && (
            <UserForm
              user={user}
              setUser={setUser}
              handleFormSubmit={handleFormSubmit}
            />
          )}
          <button className="pay-btn" onClick={() => handlePaymentClick('Paytm')} disabled={formSubmitted}>
            <img src={PaytmLogo} alt="Paytm" className="app-logo" />
            <span className="upi-name">Paytm</span>
            <img src={ArrowLogo} alt="Arrow" className="arrow-logo" />
          </button>
          {selectedUpi === 'Paytm' && (
            <UserForm
              user={user}
              setUser={setUser}
              handleFormSubmit={handleFormSubmit}
            />
          )}
          <button className="pay-btn" onClick={() => handlePaymentClick('BHIM')} disabled={formSubmitted}>
            <img src={BHIMLogo} alt="BHIM" className="app-logo" />
            <span className="upi-name">BHIM</span>
            <img src={ArrowLogo} alt="Arrow" className="arrow-logo" />
          </button>
          {selectedUpi === 'BHIM' && (
            <UserForm
              user={user}
              setUser={setUser}
              handleFormSubmit={handleFormSubmit}
            />
          )}
        </div>
      )}
      {!isMobile && (
        <div className="no-payment-options">No payment options available</div>
      )}
      <div className="or-separator">
        <span className="line"></span>
        <span className="or-text">OR</span>
        <span className="line"></span>
      </div>
      <div className="payment-link-section left-align">
        <span className="heading">Get Payment Link</span>
        <span className="subheading">You will get a payment link on</span>
        <div className="phone-number-section">
          <div className="phone-number-wrapper">
            <span className="country-code">+91 - </span>
            <input
              type="text"
              name="phoneNumber"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              className="phone-number"
            />
          </div>
          <button className="send-btn" onClick={handleSendClick}>Send</button>
        </div>
      </div>
      <div className="updates-section left-align">
        <span className="heading">Get WhatsApp and SMS Updates</span>
        <div className="toggle-section">
          <span className="subheading">Click on this to turn off updates</span>
          <label className="switch">
            <input type="checkbox" checked={getUpdates} onChange={() => setGetUpdates(!getUpdates)} />
            <span className="slider round"></span>
          </label>
        </div>
      </div>
      <div className="powered-by">
        <span className="powered-by-text">Powered By</span>
        <img src={GokwikLogo} alt="Gokwik" className="gokwik-logo-large" />
      </div>
      <div className="message">
        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default PaymentOptions;
import React, { useState, useEffect } from 'react';
import './PaymentOptions.css'; // Make sure this path is correct and the CSS file contains merged styles
import BackArrow from '../logos/back_arrow.png';
import MamaearthLogo from '../logos/mamaearth_logo.png';
import RupeeSymbol from '../logos/rupee_symbol.png';
import PhonePeLogo from '../logos/phonepe_logo.svg';
import ArrowLogo from '../logos/arrow_logo.svg';
import GooglePayLogo from '../logos/googlepay_logo.png';
import PaytmLogo from '../logos/paytm_logo.png';
import BHIMLogo from '../logos/bhim_logo.png';
import GokwikLogo from '../logos/gokwik_logo.png';
const API_URL = 'https://paymentoption-ui-for-gokwik-json-server.onrender.com'; // New API URL


const UserForm = ({ user, setUser, handleFormSubmit }) => (
  <form className="user-form" onSubmit={handleFormSubmit}>
    <div className="form-group">
      <label>Name:</label>
      <input
        type="text"
        name="name"
        value={user.name}
        onChange={(e) => setUser({ ...user, name: e.target.value })}
        className="form-input"
        required
      />
    </div>
    <div className="form-group">
      <label>Phone Number:</label>
      <input
        type="text"
        name="phoneNumber"
        value={user.phoneNumber}
        onChange={(e) => setUser({ ...user, phoneNumber: e.target.value })}
        className="form-input"
        required
        pattern="[0-9]{10}"
        title="Please enter a valid 10-digit phone number"
      />
    </div>
    <div className="form-group">
      <label>Email:</label>
      <input
        type="email"
        name="email"
        value={user.email}
        onChange={(e) => setUser({ ...user, email: e.target.value })}
        className="form-input"
        required
      />
    </div>
    <div className="form-group">
      <label>Address:</label>
      <input
        type="text"
        name="address"
        value={user.address}
        onChange={(e) => setUser({ ...user, address: e.target.value })}
        className="form-input"
        required
      />
    </div>
    <button type="submit" className="submit-btn">Submit</button>
  </form>
);

const PaymentOptions = ({ user, order, isMobile, isIOS, setUser }) => {
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [selectedUpi, setSelectedUpi] = useState(null);
  const [message, setMessage] = useState('');
  const [getUpdates, setGetUpdates] = useState(true); // Ensure toggle button is on by default
  const [formSubmitted, setFormSubmitted] = useState(false); // Track if form has been submitted

  const handlePaymentClick = (paymentType) => {
    if (formSubmitted) return; // Prevent further UPI button actions if form is submitted

    if (user.name && user.phoneNumber && user.email && user.address) {
      fetch(`${API_URL}/${paymentType}`)
        .then(response => {
          if (!response.ok) throw new Error('Network response was not ok');
          return response.json();
        })
        .then(data => {
          if (data.length === 0) {
            saveUserData(paymentType);
          } else {
            if (selectedUpi !== paymentType) {
              setMessage(`Data for ${paymentType} fetched successfully`);
            }
          }
        })
        .catch(error => {
          console.error(`Error checking ${paymentType} data:`, error);
          setMessage(`Error checking ${paymentType} data`);
        });
    } else {
      setSelectedUpi(paymentType);
      setMessage('');
    }
  };

  const saveUserData = (paymentType) => {
    fetch(`${API_URL}/${paymentType}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    })
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(data => {
      setMessage(`Data saved successfully for ${paymentType}`);
      setFormSubmitted(true); // Mark form as submitted
      setSelectedUpi(null);
    })
    .catch(error => {
      console.error(`Error saving data for ${paymentType}:`, error);
      setMessage(`Error saving data for ${paymentType}`);
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const isValidPhoneNumber = /^[0-9]{10}$/.test(user.phoneNumber);
    if (!isValidPhoneNumber) {
      alert('Please enter a valid 10-digit phone number.');
      return;
    }
    saveUserData(selectedUpi);
  };

  const handlePhoneNumberChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  const handleSendClick = () => {
    fetch(`${API_URL}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: order.amount,
        phoneNumber: phoneNumber,
      }),
    })
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(data => {
      setMessage('Data sent successfully');
    })
    .catch(error => {
      console.error('Error sending data:', error);
      setMessage('Error sending data');
    });
  };

  useEffect(() => {
    if (!user.phoneNumber) {
      setSelectedUpi(null);
    }
  }, [user]);

  return (
    <div className="payment-options">
      <div className="logo-section">
        <img src={BackArrow} alt="Back" className="back-arrow" />
        <img src={MamaearthLogo} alt="Mamaearth" className="mamaearth-logo" />
      </div>
      <div className="amount-to-pay">
        <img src={RupeeSymbol} alt="Rupee" className="rupee-symbol" />
        <span className="amount-text">Amount to Pay:</span>
        <span className="amount">₹{order.amount}</span>
      </div>
      {isIOS && (
        <div className="upi-apps">
          <span className="heading left-align">Pay using UPI Apps</span>
          <button className="pay-btn" onClick={() => handlePaymentClick('PhonePe')} disabled={formSubmitted}>
            <img src={PhonePeLogo} alt="PhonePe" className="app-logo" />
            <span className="upi-name">PhonePe</span>
            <img src={ArrowLogo} alt="Arrow" className="arrow-logo" />
          </button>
          {selectedUpi === 'PhonePe' && (
            <UserForm
              user={user}
              setUser={setUser}
              handleFormSubmit={handleFormSubmit}
            />
          )}
          <button className="pay-btn" onClick={() => handlePaymentClick('GooglePay')} disabled={formSubmitted}>
            <img src={GooglePayLogo} alt="Google Pay" className="app-logo" />
            <span className="upi-name">Google Pay</span>
            <img src={ArrowLogo} alt="Arrow" className="arrow-logo" />
          </button>
          {selectedUpi === 'GooglePay' && (
            <UserForm
              user={user}
              setUser={setUser}
              handleFormSubmit={handleFormSubmit}
            />
          )}
        </div>
      )}
      {isMobile && !isIOS && (
        <div className="upi-apps">
          <span className="heading left-align">Pay using UPI Apps</span>
          <button className="pay-btn" onClick={() => handlePaymentClick('PhonePe')} disabled={formSubmitted}>
            <img src={PhonePeLogo} alt="PhonePe" className="app-logo" />
            <span className="upi-name">PhonePe</span>
            <img src={ArrowLogo} alt="Arrow" className="arrow-logo" />
          </button>
          {selectedUpi === 'PhonePe' && (
            <UserForm
              user={user}
              setUser={setUser}
              handleFormSubmit={handleFormSubmit}
            />
          )}
          <button className="pay-btn" onClick={() => handlePaymentClick('GooglePay')} disabled={formSubmitted}>
            <img src={GooglePayLogo} alt="Google Pay" className="app-logo" />
            <span className="upi-name">Google Pay</span>
            <img src={ArrowLogo} alt="Arrow" className="arrow-logo" />
          </button>
          {selectedUpi === 'GooglePay' && (
            <UserForm
              user={user}
              setUser={setUser}
              handleFormSubmit={handleFormSubmit}
            />
          )}
          <button className="pay-btn" onClick={() => handlePaymentClick('Paytm')} disabled={formSubmitted}>
            <img src={PaytmLogo} alt="Paytm" className="app-logo" />
            <span className="upi-name">Paytm</span>
            <img src={ArrowLogo} alt="Arrow" className="arrow-logo" />
          </button>
          {selectedUpi === 'Paytm' && (
            <UserForm
              user={user}
              setUser={setUser}
              handleFormSubmit={handleFormSubmit}
            />
          )}
          <button className="pay-btn" onClick={() => handlePaymentClick('BHIM')} disabled={formSubmitted}>
            <img src={BHIMLogo} alt="BHIM" className="app-logo" />
            <span className="upi-name">BHIM</span>
            <img src={ArrowLogo} alt="Arrow" className="arrow-logo" />
          </button>
          {selectedUpi === 'BHIM' && (
            <UserForm
              user={user}
              setUser={setUser}
              handleFormSubmit={handleFormSubmit}
            />
          )}
        </div>
      )}
      {!isMobile && (
        <div className="no-payment-options">No payment options available</div>
      )}
      <div className="or-separator">
        <span className="line"></span>
        <span className="or-text">OR</span>
        <span className="line"></span>
      </div>
      <div className="payment-link-section left-align">
        <span className="heading">Get Payment Link</span>
        <span className="subheading">You will get a payment link on</span>
        <div className="phone-number-section">
          <div className="phone-number-wrapper">
            <span className="country-code">+91 - </span>
            <input
              type="text"
              name="phoneNumber"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              className="phone-number"
            />
          </div>
          <button className="send-btn" onClick={handleSendClick}>Send</button>
        </div>
      </div>
      <div className="updates-section left-align">
        <span className="heading">Get WhatsApp and SMS Updates</span>
        <div className="toggle-section">
          <span className="subheading">Click on this to turn off updates</span>
          <label className="switch">
            <input type="checkbox" checked={getUpdates} onChange={() => setGetUpdates(!getUpdates)} />
            <span className="slider round"></span>
          </label>
        </div>
      </div>
      <div className="powered-by">
        <span className="powered-by-text">Powered By</span>
        <img src={GokwikLogo} alt="Gokwik" className="gokwik-logo-large" />
      </div>
      <div className="message">
        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default PaymentOptions;
import React, { useState, useEffect } from 'react';
import './PaymentOptions.css'; // Make sure this path is correct and the CSS file contains merged styles
import BackArrow from '../logos/back_arrow.png';
import MamaearthLogo from '../logos/mamaearth_logo.png';
import RupeeSymbol from '../logos/rupee_symbol.png';
import PhonePeLogo from '../logos/phonepe_logo.svg';
import ArrowLogo from '../logos/arrow_logo.svg';
import GooglePayLogo from '../logos/googlepay_logo.png';
import PaytmLogo from '../logos/paytm_logo.png';
import BHIMLogo from '../logos/bhim_logo.png';
import GokwikLogo from '../logos/gokwik_logo.png';
const API_URL = 'https://paymentoption-ui-for-gokwik-json-server.onrender.com'; // New API URL


const UserForm = ({ user, setUser, handleFormSubmit }) => (
  <form className="user-form" onSubmit={handleFormSubmit}>
    <div className="form-group">
      <label>Name:</label>
      <input
        type="text"
        name="name"
        value={user.name}
        onChange={(e) => setUser({ ...user, name: e.target.value })}
        className="form-input"
        required
      />
    </div>
    <div className="form-group">
      <label>Phone Number:</label>
      <input
        type="text"
        name="phoneNumber"
        value={user.phoneNumber}
        onChange={(e) => setUser({ ...user, phoneNumber: e.target.value })}
        className="form-input"
        required
        pattern="[0-9]{10}"
        title="Please enter a valid 10-digit phone number"
      />
    </div>
    <div className="form-group">
      <label>Email:</label>
      <input
        type="email"
        name="email"
        value={user.email}
        onChange={(e) => setUser({ ...user, email: e.target.value })}
        className="form-input"
        required
      />
    </div>
    <div className="form-group">
      <label>Address:</label>
      <input
        type="text"
        name="address"
        value={user.address}
        onChange={(e) => setUser({ ...user, address: e.target.value })}
        className="form-input"
        required
      />
    </div>
    <button type="submit" className="submit-btn">Submit</button>
  </form>
);

const PaymentOptions = ({ user, order, isMobile, isIOS, setUser }) => {
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [selectedUpi, setSelectedUpi] = useState(null);
  const [message, setMessage] = useState('');
  const [getUpdates, setGetUpdates] = useState(true); // Ensure toggle button is on by default
  const [formSubmitted, setFormSubmitted] = useState(false); // Track if form has been submitted

  const handlePaymentClick = (paymentType) => {
    if (formSubmitted) return; // Prevent further UPI button actions if form is submitted

    if (user.name && user.phoneNumber && user.email && user.address) {
      fetch(`${API_URL}/${paymentType}`)
        .then(response => {
          if (!response.ok) throw new Error('Network response was not ok');
          return response.json();
        })
        .then(data => {
          if (data.length === 0) {
            saveUserData(paymentType);
          } else {
            if (selectedUpi !== paymentType) {
              setMessage(`Data for ${paymentType} fetched successfully`);
            }
          }
        })
        .catch(error => {
          console.error(`Error checking ${paymentType} data:`, error);
          setMessage(`Error checking ${paymentType} data`);
        });
    } else {
      setSelectedUpi(paymentType);
      setMessage('');
    }
  };

  const saveUserData = (paymentType) => {
    fetch(`${API_URL}/${paymentType}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    })
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(data => {
      setMessage(`Data saved successfully for ${paymentType}`);
      setFormSubmitted(true); // Mark form as submitted
      setSelectedUpi(null);
    })
    .catch(error => {
      console.error(`Error saving data for ${paymentType}:`, error);
      setMessage(`Error saving data for ${paymentType}`);
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const isValidPhoneNumber = /^[0-9]{10}$/.test(user.phoneNumber);
    if (!isValidPhoneNumber) {
      alert('Please enter a valid 10-digit phone number.');
      return;
    }
    saveUserData(selectedUpi);
  };

  const handlePhoneNumberChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  const handleSendClick = () => {
    fetch(`${API_URL}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: order.amount,
        phoneNumber: phoneNumber,
      }),
    })
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(data => {
      setMessage('Data sent successfully');
    })
    .catch(error => {
      console.error('Error sending data:', error);
      setMessage('Error sending data');
    });
  };

  useEffect(() => {
    if (!user.phoneNumber) {
      setSelectedUpi(null);
    }
  }, [user]);

  return (
    <div className="payment-options">
      <div className="logo-section">
        <img src={BackArrow} alt="Back" className="back-arrow" />
        <img src={MamaearthLogo} alt="Mamaearth" className="mamaearth-logo" />
      </div>
      <div className="amount-to-pay">
        <img src={RupeeSymbol} alt="Rupee" className="rupee-symbol" />
        <span className="amount-text">Amount to Pay:</span>
        <span className="amount">₹{order.amount}</span>
      </div>
      {isIOS && (
        <div className="upi-apps">
          <span className="heading left-align">Pay using UPI Apps</span>
          <button className="pay-btn" onClick={() => handlePaymentClick('PhonePe')} disabled={formSubmitted}>
            <img src={PhonePeLogo} alt="PhonePe" className="app-logo" />
            <span className="upi-name">PhonePe</span>
            <img src={ArrowLogo} alt="Arrow" className="arrow-logo" />
          </button>
          {selectedUpi === 'PhonePe' && (
            <UserForm
              user={user}
              setUser={setUser}
              handleFormSubmit={handleFormSubmit}
            />
          )}
          <button className="pay-btn" onClick={() => handlePaymentClick('GooglePay')} disabled={formSubmitted}>
            <img src={GooglePayLogo} alt="Google Pay" className="app-logo" />
            <span className="upi-name">Google Pay</span>
            <img src={ArrowLogo} alt="Arrow" className="arrow-logo" />
          </button>
          {selectedUpi === 'GooglePay' && (
            <UserForm
              user={user}
              setUser={setUser}
              handleFormSubmit={handleFormSubmit}
            />
          )}
        </div>
      )}
      {isMobile && !isIOS && (
        <div className="upi-apps">
          <span className="heading left-align">Pay using UPI Apps</span>
          <button className="pay-btn" onClick={() => handlePaymentClick('PhonePe')} disabled={formSubmitted}>
            <img src={PhonePeLogo} alt="PhonePe" className="app-logo" />
            <span className="upi-name">PhonePe</span>
            <img src={ArrowLogo} alt="Arrow" className="arrow-logo" />
          </button>
          {selectedUpi === 'PhonePe' && (
            <UserForm
              user={user}
              setUser={setUser}
              handleFormSubmit={handleFormSubmit}
            />
          )}
          <button className="pay-btn" onClick={() => handlePaymentClick('GooglePay')} disabled={formSubmitted}>
            <img src={GooglePayLogo} alt="Google Pay" className="app-logo" />
            <span className="upi-name">Google Pay</span>
            <img src={ArrowLogo} alt="Arrow" className="arrow-logo" />
          </button>
          {selectedUpi === 'GooglePay' && (
            <UserForm
              user={user}
              setUser={setUser}
              handleFormSubmit={handleFormSubmit}
            />
          )}
          <button className="pay-btn" onClick={() => handlePaymentClick('Paytm')} disabled={formSubmitted}>
            <img src={PaytmLogo} alt="Paytm" className="app-logo" />
            <span className="upi-name">Paytm</span>
            <img src={ArrowLogo} alt="Arrow" className="arrow-logo" />
          </button>
          {selectedUpi === 'Paytm' && (
            <UserForm
              user={user}
              setUser={setUser}
              handleFormSubmit={handleFormSubmit}
            />
          )}
          <button className="pay-btn" onClick={() => handlePaymentClick('BHIM')} disabled={formSubmitted}>
            <img src={BHIMLogo} alt="BHIM" className="app-logo" />
            <span className="upi-name">BHIM</span>
            <img src={ArrowLogo} alt="Arrow" className="arrow-logo" />
          </button>
          {selectedUpi === 'BHIM' && (
            <UserForm
              user={user}
              setUser={setUser}
              handleFormSubmit={handleFormSubmit}
            />
          )}
        </div>
      )}
      {!isMobile && (
        <div className="no-payment-options">No payment options available</div>
      )}
      <div className="or-separator">
        <span className="line"></span>
        <span className="or-text">OR</span>
        <span className="line"></span>
      </div>
      <div className="payment-link-section left-align">
        <span className="heading">Get Payment Link</span>
        <span className="subheading">You will get a payment link on</span>
        <div className="phone-number-section">
          <div className="phone-number-wrapper">
            <span className="country-code">+91 - </span>
            <input
              type="text"
              name="phoneNumber"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              className="phone-number"
            />
          </div>
          <button className="send-btn" onClick={handleSendClick}>Send</button>
        </div>
      </div>
      <div className="updates-section left-align">
        <span className="heading">Get WhatsApp and SMS Updates</span>
        <div className="toggle-section">
          <span className="subheading">Click on this to turn off updates</span>
          <label className="switch">
            <input type="checkbox" checked={getUpdates} onChange={() => setGetUpdates(!getUpdates)} />
            <span className="slider round"></span>
          </label>
        </div>
      </div>
      <div className="powered-by">
        <span className="powered-by-text">Powered By</span>
        <img src={GokwikLogo} alt="Gokwik" className="gokwik-logo-large" />
      </div>
      <div className="message">
        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default PaymentOptions;
