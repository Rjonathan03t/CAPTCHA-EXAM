import React, { useState } from 'react';

const ForbiddenSequenceApp = () => {
  const [number, setNumber] = useState('');
  const [sequence, setSequence] = useState([]);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaResolved, setCaptchaResolved] = useState(false);
  const [captchaMessage, setCaptchaMessage] = useState('');
  const [currentIndex, setCurrentIndex] = useState(1); 

  const apiUrl = 'https://api.prod.jcloudify.com/whoami';
  const apiKey = process.env.REACT_APP_API_KEY;

  const processSequence = async (start, end) => {
    for (let i = start; i <= end; i++) {
      try {
        const response = await fetch(apiUrl);
        const newItem = `${i}. Forbidden`;
        setSequence((prevSequence) => [...prevSequence, newItem]);

        if (response.status === 405) {
          setShowCaptcha(true);
          setCurrentIndex(i); 
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error('Error during fetch:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const N = parseInt(number, 10);

    if (N < 1 || N > 1000 || isNaN(N)) {
      alert('Please enter a valid number between 1 and 1000.');
      return;
    }

    setSequence([]);
    setCaptchaMessage('');
    setCaptchaResolved(false);
    setShowCaptcha(false);
    setCurrentIndex(1); 
    await processSequence(1, N);
  };

  const handleCaptchaSuccess = () => {
    setCaptchaResolved(true);
    setCaptchaMessage('CAPTCHA resolved! Sequence continues...');
    setShowCaptcha(false);

    // Reprendre les requêtes restantes
    const N = parseInt(number, 10);
    processSequence(currentIndex, N);
  };

  const handleCaptchaError = (error) => {
    setCaptchaMessage(`Captcha Error: ${error.message}`);
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', lineHeight: '1.6' }}>
      <h1>Forbidden Sequence App</h1>
      {!showCaptcha ? (
        <form onSubmit={handleSubmit}>
          <label htmlFor="number">Enter a number (1-1000):</label>
          <input
            type="number"
            id="number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            min="1"
            max="1000"
            required
          />
          <button type="submit">Submit</button>
        </form>
      ) : (
        <div>
          <h3>Captcha Required</h3>
          <p>Please solve the captcha to continue.</p>
          <div
            id="captcha"
            ref={(el) => {
              if (el && window.AwsWafCaptcha) {
                window.AwsWafCaptcha.renderCaptcha(el, {
                  apiKey: apiKey,
                  onSuccess: handleCaptchaSuccess,
                  onError: handleCaptchaError,
                });
              }
            }}
          ></div>
        </div>
      )}

      {captchaMessage && <p>{captchaMessage}</p>}

      <ul>
        {sequence.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
};

export default ForbiddenSequenceApp;
