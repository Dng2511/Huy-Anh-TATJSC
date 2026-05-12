const Joi = require('joi');

// Vehicle validation schema
const vehicleSchema = Joi.object({
  licensePlate: Joi.string().required().uppercase().messages({
    'string.empty': 'License plate cannot be empty',
    'any.required': 'License plate is required',
  }),
  fuelRate: Joi.number().positive().required().messages({
    'number.positive': 'Fuel rate must be a positive number',
    'any.required': 'Fuel rate is required',
  }),
  status: Joi.string()
    .valid('idle', 'running', 'maintenance')
    .default('idle'),
});

// Driver validation schema
const driverSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': 'Name cannot be empty',
    'any.required': 'Name is required',
  }),
  phone: Joi.string()
    .required()
    .pattern(/^[0-9\-\+\s]+$/)
    .messages({
      'string.pattern.base': 'Phone number is invalid',
      'any.required': 'Phone number is required',
    }),
  licenseNumber: Joi.string().required().uppercase().messages({
    'string.empty': 'License number cannot be empty',
    'any.required': 'License number is required',
  }),
  status: Joi.string()
    .valid('available', 'on_trip', 'off')
    .default('available'),
});


//Gate validation schema
const gateSchema = Joi.object({
  name: Joi.string().required().trim().messages({
    'string.empty': 'Name cannot be empty',
    'any.required': 'Name is required',
  }),

  locate: Joi.object({
    lat: Joi.number().required().messages({
      'any.required': 'Latitude is required',
    }),

    lng: Joi.number().required().messages({
      'any.required': 'Longitude is required',
    }),
  }).optional(),

  location: Joi.string().required().trim().messages({
    'string.empty': 'Location cannot be empty',
    'any.required': 'Location is required',
  }),
});

const rateSchema = Joi.object({
    pickup: Joi.string().required().messages({
        'any.required': 'Pickup gate is required',
        'string.empty': 'Pickup gate cannot be empty',
    }),

    delivery: Joi.string().required().messages({
        'any.required': 'Delivery gate is required',
        'string.empty': 'Delivery gate cannot be empty',
    }),

    isReefer: Joi.boolean().default(false),

    fixedCost: Joi.number().min(0).default(0),
});

// Schema for removing multiple rates (array of rateSchema)
const removeRatesSchema = Joi.array().items(rateSchema).min(1).messages({
  'array.min': 'At least one rate must be provided to remove',
});

const partnerSchema = Joi.object({
    name: Joi.string().trim().required().messages({
        'any.required': 'Partner name is required',
        'string.empty': 'Partner name cannot be empty',
    }),

    contact: Joi.object({
        phone: Joi.string().trim().required().messages({
            'any.required': 'Phone is required',
            'string.empty': 'Phone cannot be empty',
        }),

        email: Joi.string().trim().email().optional(),
    }).required(),

    rates: Joi.array()
        .items(rateSchema)
        .custom((rates, helpers) => {
            const used = new Set();

            for (const rate of rates) {
                const key = `${rate.pickup}_${rate.delivery}_${rate.isReefer}`;

                if (used.has(key)) {
                    return helpers.error('any.duplicateRate');
                }

                used.add(key);
            }

            return rates;
        })
        .messages({
            'any.duplicateRate':
                'Duplicate rate with same pickup, delivery and reefer type',
        }),
});

// Order validation schema
const orderSchema = Joi.object({
    partner: Joi.string().optional().messages({
        'string.empty': 'Partner cannot be empty',
    }),

    driver: Joi.string().optional().messages({
        'string.empty': 'Driver cannot be empty',
    }),

    vehicle: Joi.string().optional().messages({
        'string.empty': 'Vehicle cannot be empty',
    }),

    pickup: Joi.string().required().messages({
        'any.required': 'Pickup gate is required',
        'string.empty': 'Pickup gate cannot be empty',
    }),

    delivery: Joi.string().required().messages({
        'any.required': 'Delivery gate is required',
        'string.empty': 'Delivery gate cannot be empty',
    }),

    isReefer: Joi.boolean().default(false),

    status: Joi.string()
        .valid('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')
        .default('pending'),

    cost: Joi.number().min(0).optional(),

    waitingCost: Joi.number().min(0).optional(),
});



// Validation middleware factory
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const messages = error.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message,
    }));
    return res.status(400).json({ errors: messages });
  }

  req.body = value;
  next();
};

module.exports = {
  validateVehicle: validate(vehicleSchema),
  validateDriver: validate(driverSchema),
  validateGate: validate(gateSchema),
  validatePartner: validate(partnerSchema),
  validateRate: validate(rateSchema),
  validateRemoveRates: validate(removeRatesSchema),
  validateOrder: validate(orderSchema),
};
