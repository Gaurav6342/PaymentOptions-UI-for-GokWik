import React, { useState, useEffect } from 'react';
import PaymentOptions from './components/PaymentOptions';
import './App.css';

const App = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [user, setUser] = useState({
    address: '',
    name: '',
    phoneNumber: 7838848523,
    email: '',
  });
  const order = {
    orderType: 'upi',
    amount: 599,
  };

  const updateDeviceType = () => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    console.log('User Agent:', userAgent);

    // iOS detection
    const iosCheck = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    setIsIOS(iosCheck);

    // Android detection
    const androidCheck = /android/i.test(userAgent);
    const mobileCheck = androidCheck || iosCheck;
    setIsMobile(mobileCheck);

    console.log('isMobile:', mobileCheck, 'isIOS:', iosCheck);
  };

  useEffect(() => {
    updateDeviceType();
    window.addEventListener('resize', updateDeviceType);

    // Clean up event listener on unmount
    return () => {
      window.removeEventListener('resize', updateDeviceType);
    };
  }, []);

  return (
    <div className="app-container">
      <PaymentOptions user={user} order={order} isMobile={isMobile} isIOS={isIOS} setUser={setUser} />
    </div>
  );
};

export default App;
