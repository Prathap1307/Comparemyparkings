'use client';

import { useState, useEffect } from 'react';

const PromoValidation = ({ 
  promoCode, 
  totalPrice, 
  onValidationResult,
  shouldValidate = false 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [promoData, setPromoData] = useState(null);

  useEffect(() => {
    if (!shouldValidate || !promoCode) {
      // Reset when not validating or no promo code
      if (shouldValidate && !promoCode) {
        setError('Please enter a promo code');
        onValidationResult(null);
      }
      return;
    }

    const validatePromoCode = async () => {
      setLoading(true);
      setError('');
      setPromoData(null);
      
      try {
        // Fetch promo codes from API
        const response = await fetch('/api/promocodes');
        
        if (!response.ok) {
          throw new Error('Failed to fetch promo codes');
        }
        
        const data = await response.json();

        
        // Find matching promo code - FIXED: Access promocode directly
        const matchedPromo = data.find(item => {
          const itemPromoCode = item.promocode;
          return itemPromoCode?.toUpperCase() === promoCode.toUpperCase();
        });

        
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

    validatePromoCode();
  }, [promoCode, totalPrice, onValidationResult, shouldValidate]);

  const validatePromo = (promo, total) => {
    // Extract values directly
    const promoType = promo.promovalidation;
    const valueType = promo.promovalue_type;
    const fromDate = promo.Fromdate;
    const fromTime = promo.Fromtime;
    const toDate = promo.Todate;
    const toTime = promo.Totime;
    const minimumValue = parseFloat(promo.minimumvalue) || 0;
    const promoLimit = parseFloat(promo.promolimit) || 0;
    const promoFixed = parseFloat(promo.Promofixed) || 0;
    const promoPercentage = parseFloat(promo.Promopercenatge) || 0;

    
    // Validate date range
    const currentDate = new Date();
    const fromDateTime = new Date(`${fromDate}T${fromTime}`);
    const toDateTime = new Date(`${toDate}T${toTime}`);
    
    if (currentDate < fromDateTime || currentDate > toDateTime) {
      return {
        valid: false,
        error: 'This promo code is not valid at this time'
      };
    }
    
    // Validate minimum value
    if (minimumValue > 0 && total < minimumValue) {
      return {
        valid: false,
        error: `Minimum purchase of £${minimumValue} required for this promo`
      };
    }
    
    // Calculate discount
    let discountAmount = 0;
    
    if (valueType === 'percentage') {
      discountAmount = (total * promoPercentage) / 100;
      
      // Apply promo limit for percentage discounts
      if (promoLimit > 0 && discountAmount > promoLimit) {
        discountAmount = promoLimit;
      }
    } else if (valueType === 'fixed') {
      discountAmount = promoFixed;
    }
    
    const newTotal = Math.max(0, total - discountAmount);
    
    return {
      valid: true,
      originalTotal: total,
      discountAmount,
      newTotal,
      discountPercentage: valueType === 'percentage' ? promoPercentage : null,
      promoLimit,
      minimumValue,
      message: `You saved £${discountAmount.toFixed(2)}`
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