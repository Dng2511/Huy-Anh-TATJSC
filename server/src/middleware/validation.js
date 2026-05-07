const Joi = require('joi');

// Vehicle validation schema
const vehicleSchema = Joi.object({
  id: Joi.string().required().messages({
    'string.empty': 'Vehicle ID cannot be empty',
    'any.required': 'Vehicle ID is required',
  }),
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
  id: Joi.string().required().messages({
    'string.empty': 'Driver ID cannot be empty',
    'any.required': 'Driver ID is required',
  }),
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
};
