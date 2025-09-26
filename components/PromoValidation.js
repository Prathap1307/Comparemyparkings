'use client';

import { useState, useEffect } from 'react';

const PromoValidation = ({ promoCode, totalPrice, onValidationResult }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [promoData, setPromoData] = useState(null);

  useEffect(() => {
    if (!promoCode) {
      setPromoData(null);
      setError('');
      onValidationResult(null);
      return;
    }


  const validatePromoCode = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Fetch promo codes from API
      const response = await fetch('/api/promocodes');
      
      if (!response.ok) {
        throw new Error('Failed to fetch promo codes');
      }
      
      const data = await response.json();
      
      // Find matching promo code
      const matchedPromo = data.find(item => 
        item.promocode.toUpperCase()     === promoCode.toUpperCase()
      );
      
      if (!matchedPromo) {
        throw new Error('Promo code not found');
      }
      
      // Validate the promo code
      const validationResult = validatePromo(matchedPromo, totalPrice);
      
      if (validationResult.valid) {
        setPromoData(matchedPromo);
        setError('');
        onValidationResult(validationResult);
      } else {
        throw new Error(validationResult.error);
      }
      
    } catch (err) {
      setError(err.message);
      setPromoData(null);
      onValidationResult(null);
    } finally {
      setLoading(false);
    }
  };

  }, [promoCode, totalPrice, onValidationResult]);

  const validatePromo = (promo, total) => {
    const promoType = promo.promovalidation;
    const valueType = promo.promovalue_type;
    const fromDate = promo.Fromdate;
    const fromTime = promo.Fromtime;
    const toDate = promo.Todate;
    const toTime = promo.Totime;
    const minimumValue = parseFloat(promo.minimumvalue);
    const promoLimit = parseFloat(promo.promolimit);

    console.log("value",
        promoType
    )
    
    // Validate date if it's fixedDate type
    if (promoType === 'fixedDate') {
      const currentDate = new Date();
      const fromDateTime = new Date(`${fromDate}T${fromTime}`);
      const toDateTime = new Date(`${toDate}T${toTime}`);
      
      if (currentDate < fromDateTime || currentDate > toDateTime) {
        return {
          valid: false,
          error: 'This promo code has expired'
        };
      }
    }
    
    // Validate minimum value
    if (total < minimumValue) {
      return {
        valid: false,
        error: `Minimum purchase of £${minimumValue} required for this promo`
      };
    }
    
    // Calculate discount
    let discount = 0;
    let discountAmount = 0;
    console.log("value",valueType)
    if (valueType === 'percentage') {
      const percentage = parseFloat(promo.Promopercenatge);
      console.log("percentage",percentage)
      discountAmount = (total * percentage) / 100;
      console.log("discountAmount",discountAmount)
      discount = percentage;
      console.log("discount",discount)
    } else {
      discountAmount = parseFloat(promo.Promofixed);
      discount = discountAmount;
    }
    
    // Apply promo limit
    if (discountAmount > promoLimit) {
      discountAmount = promoLimit;
    }
    
    const newTotal = total - discountAmount;
    
    return {
      valid: true,
      originalTotal: total,
      discountAmount,
      newTotal,
      discountPercentage: valueType === 'percentage' ? parseFloat(promo.Promopercenatge.N) : null,
      promoLimit,
      minimumValue,
      message: `You saved £${discountAmount}`
    };
  };

  if (loading) {
    return (
      <div className="mt-2 text-sm text-blue-600">
        Validating promo code...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-2 text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (promoData) {
    return (
      <div className="mt-2 text-sm text-green-600">
        ✓ Promo code applied successfully!
      </div>
    );
  }

  return null;
};

export default PromoValidation;